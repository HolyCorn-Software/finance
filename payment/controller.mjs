/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module controls the overall functioning of the Finance Faculty
 */

import shortUUID from "short-uuid"
import muser_common from "muser_common"
import financePlugins from "../helper.mjs"
import { CurrencyController } from "../currency/controller.mjs"



const collections_symbol = Symbol()

const faculty = FacultyPlatform.get()

const executeLock = Symbol()
const currency = Symbol()


export default class PaymentController {

    /**
     * 
     * @param {import("./types.js").PaymentCollections} collections 
     * @param {CurrencyController} currencyController
     */
    constructor(collections, currencyController) {

        this[collections_symbol] = collections

        this[currency] = currencyController



        this[executeLock] = new ExecuteLockManager()

    }

    /**
     * This method is called by the system.
     * When the system calls it, the PaymentController sets up the necessary stuff
     */
    async init() {
        await (await import('./plugin/model.mjs')).paymentPluginModelInit(this); //Make the model globally accessible
    }


    /**
     * This creates a blank record
     * @param {finance.payment.PaymentRecordInit} input 
     * @param {string} userid If set, the system will check to see that the user has permissions to create payments
     * @returns {Promise<string>}
     */
    async createRecord(input, userid) {

        if (typeof input !== 'object') {
            throw new Exception(`Please pass an object`, { code: 'error.system.unplanned' })
        }

        if (input.type !== 'invoice' && input.type !== 'payout') {
            throw new Exception(`The type of the record being created is unknown. Specify either 'invoice' or 'payout'`, { code: 'error.system.unplanned' })
        }
        if (!input.amount?.value || !input.amount?.currency) {
            throw new Error(`Invalid input for amount, when creating a new payment record.`)
        }

        if (userid) {
            await muser_common.whitelisted_permission_check(
                {
                    userid,
                    permissions: [
                        input.type === 'invoice' ? 'permissions.finance.payment.create_record.invoice' : 'permissions.finance.payment.create_record.payout'
                    ]
                }
            )
        }

        /** @type {finance.payment.PaymentRecord} */
        const data = {}

        data.type = input.type
        data.method = input.method
        data.owners = input.owners || []
        data.amount = input.amount
        data.method_whitelist = input.method_whitelist

        data.created = Date.now()
        data.lastRefresh = {
            client: Date.now(),
            system: Date.now(),
        }
        data.done = false
        data.provider_data = {};

        data.client_data = {
            input: {},
            output: {}
        }
        data.id = `${shortUUID.generate()}${shortUUID.generate()}`
        data.settled_amount = {
            value: 0,
            currency: input.amount?.currency
        }
        data.meta = input.meta || {
            product: {
                description: `Payment of ${new Date().toString()}`,
                name: `Payment of ${new Date().toString()}`,
                category: 'other',
                type: 'virtual'
            }
        }



        //Now insert it
        await this[collections_symbol].hot.insertOne(data)

        return data.id

    }


    /**
     * This method gets the publicly accessible data of a payment record.
     * 
     * It simply takes away what is not necessary
     * @param {finance.payment.PaymentRecord record
     * @returns {PaymentPublicData}
     */
    getPublicData(record) {
        const omit = ['provider_data', 'owners'];

        for (let field of omit) {
            delete record[field]
        }
        return record
    }


    /**
     * This method is used by a client to update a record
     * @param {object} param0 
     * @param {string} param0.userid If specified, security checks will be made
     * @param {string} param0.id
     * @param {finance.payment.PaymentWritablePublicData} param0.data
     * @returns {Promise<void>}
     */
    async publicUpdate({ userid, id, data }) {

        const record = await this.findAndCheckOwnership({ search: { id }, userid, })

        await this.publicUpdate0({ data, id, record })

    }

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {finance.payment.PaymentPublicData} param0.data
     * @param {finance.payment.PaymentRecord} record
     */
    async publicUpdate0({ data, id, record: final_data }) {

        /**
         * @type {Pick<finance.payment.PaymentRecord, "client_data"|"method">}
         */

        soulUtils.exclusiveUpdate(
            {
                method: 'string',
                'client_data.input': 'object'
            },
            data,
            final_data
        );


        //Now, if there's user input, let's check that the input is correct
        if (data.client_data?.input) {
            let record;
            /**
             * 
             * @returns {Promise<finance.payment.PaymentRecord>}
             */
            const getRecord = async () => {
                return record ||= await this.findRecord({ id })
            }
            const method = final_data.method || (await getRecord()).method

            if (method) {

                //Check if the payment method is legal
                if ((await getRecord()).method_whitelist?.length > 0) {
                    if ((await getRecord()).method_whitelist.findIndex(x => x == method) == -1) {
                        throw new Exception(`The payment method is not allowed for this transaction`)
                    }
                }

                const plugin = await this.getProvider({ method })

                const results = await plugin.validateUserInput(
                    {
                        data: final_data.client_data.input,
                        intent: (await getRecord()).type,
                        method
                    }
                );

                if (results.status !== 'valid') {
                    throw new Exception(results.message)
                }
            }
        }


        await this.updateRecord({ search: { id }, update: final_data })

    }



    /**
     * Determines the collection that contains a record and updates it
     * @param {object} param0 
     * @param {finance.payment.PaymentRecord} param0.search
     * @param {finance.payment.PaymentRecord} param0.update
     * @returns {Promise<void>}
     */
    async updateRecord({ search, update }) {
        const promises = []
        for (let collection in this[collections_symbol]) {
            if (collection === 'credentials') {
                continue;
            }
            promises.push(this[collections_symbol][collection].updateOne({ ...search }, { $set: update }))
        }

        await Promise.all(promises)
    }



    /**
     * This method searches for a record thoroughly, irrespective of the actual collection it resides
     * @param {finance.payment.PaymentRecord} param0 
     * @param {object} param1
     * @param {boolean} param1.throwError
     * @returns {Promise<finance.payment.PaymentRecord}
     */
    async findRecord({ ...data }, { throwError } = {}) {

        if (Object.keys(data).length === 0) {
            console.trace(`This query could be a threat!`)
        }

        //Search all three collections async
        let promises = []
        for (let collection in this[collections_symbol]) {
            promises.push(
                this[collections_symbol][collection].findOne(data)
            )
        }

        const all = [...await Promise.all(promises)].filter(x => x !== null && x !== undefined)

        const value = all[0]
        if (!value && throwError) {
            throw new Exception(`Payment record ${(JSON.stringify(data))} not found`)
        }
        return value
    }

    /**
     * This method searchs for a record and does ownership check immediately before returning the record
     * @param {object} param0 
     * @param {finance.payment.PaymentRecord} param0.search
     * @param {string} param0.userid If specified ownership checks will be made to see if the user owns this
     * @param {modernuser.permission.PermissionEnum[]} param0.permissions When specified, it will define the permissions to check for. By default this is an array containing permissions.finance.payment.modify_any_payment
     * @returns {Promise<finance.payment.PaymentRecord}
     */
    async findAndCheckOwnership({ search, userid, permissions = ['permissions.finance.payment.modify_any_payment'] }) {
        const record = await this.findRecord({ ...search }, { throwError: true })

        if (userid) {
            await ownership_check({ userid, record, bypass_permissions: permissions })
        }

        return record

    }


    /**
     * This method is used to force refresh a record, that's probably too long
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async forceRefresh({ id, userid }) {
        const record = await this.findAndCheckOwnership({ search: { id }, userid })
        if (!record.archived) {
            console.log(`NOT Doing a forced refresh of `.red, id)
            return; //Let's prevent people from overwhelming our systems
        }
        console.log(`Doing a forced refresh of `, id)
        await this.refreshRecord(record, 'client')
    }


    /**
     * This returns the list of all payment methods
     * @returns {Promise<finance.payment.PaymentMethodsInfo>}
     */
    async getPaymentMethods() {

        return (await financePlugins.list.namespaces.payment.callback.getPaymentMethodsInfo()).success.map(val => {
            return val.value.map(method => ({ ...method, plugin: val.plugin.descriptor.name }))
        }).flat()
    }


    /**
     * This method is used by the client to retrieve the form used by the client for a particular purpose
     * @param {object} param0 
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<htmlhc.widget.multiflexform.MultiFlexFormDefinitionData}
     */
    async getInlineForm({ intent, method }) {
        let provider = await this.getProvider({ method })
        return await provider.getPaymentForm({ intent, method })
    }

    /**
     * This method returns the plugin that can handle the given method
     * @param {object} param0 
     * @param {string} param0.method
     * @returns {Promise<import("./plugin/model.mjs").default>}
     */
    async getProvider({ method }) {

        let the_provider = (await financePlugins.list.namespaces.payment.callback.matchPlugin(method)).success.find(x => x.value)

        if (!the_provider) {
            console.log(`The plugins: `, financePlugins.list.namespaces.payment)
            throw new Exception(`No provider for ${method}`)
        }
        return the_provider.plugin
    }


    /**
     * This executes a payment, whether invoice or payout
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid If specified, we'll check if the user owns the record
     * @returns {Promise<void>}
     */
    async execute({ id, userid }) {

        if (!this[executeLock].lock(id)) {
            return; //It's already being executed, or it wasn't executed too long from now
        }

        let record;

        try {


            record = await this.findAndCheckOwnership({ search: { id }, userid })

            //Now, check that the payment is mature (It has sufficient data that will permit the provider to execute it)
            for (let field of ['amount', 'method', 'type']) {
                if (!record[field]) {
                    throw new Exception(`The payment lacks the '${field}' field. It cannot yet be executed`)
                }
            }

            //Now, find the provider and execute it
            const provider = await this.getProvider({ method: record.method })

            //How do we execute the payment ?
            if (record.type === 'invoice') {
                await provider.charge(record)
            } else {
                if (record.executed && !record.failed) {
                    throw new Exception(`Cannot retry this payout, because it has not failed`)
                } else {
                    if (record.failed?.fatal) {
                        throw new Exception(`Cannot retry this payout, because it failed for a very big reason.\n${record.failed.reason}`)
                    }
                    await provider.payout(record)
                }
            }

            record.executed = Date.now()
            delete record.failed
            delete record.done
            delete record.archived
            // Force the record into the hot collection
            this[collections_symbol].archive.deleteOne({ id: record.id })
            this[collections_symbol].middle.deleteOne({ id: record.id })
            this[collections_symbol].hot.updateOne({ id: record.id }, { $set: record }, { upsert: true })

            await this.updateRecord({ search: { id: record.id }, update: record })
        } catch (e) {
            this[executeLock].unlock(id)

            //Store the error in the record
            if (record) {
                const errorId = shortUUID.generate()
                console.log(`${e.stack || e.message || e}\nid:${errorId}`)
                record.failed = {
                    reason: e instanceof Exception ? e.message : `System Error: ${errorId}`,
                    time: Date.now(),
                    fatal: e.fatal ?? false
                }
                try {
                    await this.updateRecord({ search: { id: record.id }, update: record })
                } catch (updateErr) {
                    console.error(`Could not update record, after failure to execute it.\nCould not update because: \n`, updateErr.stack || updateErr)
                }
            }
            throw e
        }

        this[executeLock].unlock(id)

    }

    /**
     * This method refreshes a record
     * @param {finance.payment.PaymentRecord record 
     * @param {('system'|'client')} actor
     * @returns {Promise<finance.payment.PaymentRecord}
     */
    async refreshRecord(record, actor = 'client') {

        while (!this[executeLock].canUpdate(record.id)) {
            await new Promise(x => setTimeout(x, 200))
        }
        this[executeLock].lock(record.id)

        try {

            if (record.executed && record.method && record.amount?.value && record.amount?.currency && ((record.provider_data && Reflect.ownKeys(record.provider_data).length > 0) || record.executed)) {
                const provider = await this.getProvider({ method: record.method })
                await provider.refresh(record);
                record.lastRefresh ||= { client: 0, system: 0 }
                record.lastRefresh[actor === 'client' ? 'client' : 'system'] = Date.now()
                record.archived = false

                const settled_real_value = await this[currency].convert(record.settled_amount.value, record.settled_amount.currency, record.amount.currency)
                record.settled_amount = {
                    value: settled_real_value,
                    currency: record.amount.currency
                }
                if (!record.done) {
                    record.done = (record.amount.value > 0) && record.settled_amount.value >= record.amount.value ? true : false
                }
                await this.updateRecord({ search: { id: record.id }, update: record })
            }

        } catch (e) {
            this[executeLock].unlock(record.id)
            throw e
        }

        this[executeLock].unlock(record.id)

        return record;
    }

    /**
     * This method is used by the client to dismiss a payment. That is, cancel it
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async userDismiss({ id, userid }) {
        const record = await this.findAndCheckOwnership({ search: { id }, userid })

        const actor_is_owner = (record.owners || []).findIndex(x => x == userid) !== -1

        await this.updateRecord({
            search: { id },
            update: {
                failed: {
                    time: Date.now(),
                    reason: `User${userid ? ` (${userid})` : ''} canceled the payment`,
                    reason_code: actor_is_owner ? `canceled_by_owner` : `canceled_by_admin`
                }
            }
        });

    }

    /**
     * This method deletes a payment record
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async deleteRecord({ id }) {
        //How? it deletes the record from all collections, then issues an event
        for (let cName of ['archive', 'middle', 'hot']) {
            this[collections_symbol][cName].deleteOne({ id })
        }
        faculty.connectionManager.events.emit(`${faculty.descriptor.name}.payment-delete`, id)

    }


    /**
     * This method returns records in the system
     */
    async getRecords() {

        let userids = new Set()
        let profilesNext;

        return {
            /** @type {()=> AsyncGenerator<finance.payment.PaymentRecord>} */
            data:
                (
                    /**
                     * @this PaymentController
                     */
                    async function* () {
                        /** @type {(keyof this[collections_symbol])[]} */
                        const collectionKeys = ['hot', 'middle', 'archive']
                        for (const cType of collectionKeys) {
                            /** @type {import('mongodb').Collection<finance.payment.PaymentRecord>} */
                            const collection = this[collections_symbol][cType]
                            const cursor = collection.find({}, { sort: { created: 'descending' } })
                            while (await cursor.hasNext()) {
                                const next = await cursor.next()
                                const lastUseridsSize = userids.size;
                                userids.add(...next.owners)
                                yield next
                                if (userids.size != lastUseridsSize) {
                                    profilesNext?.()
                                }

                            }
                        }
                        profilesNext?.()
                        userids.add(null)

                    }
                ).bind(this),

            /** @type {()=> AsyncGenerator<modernuser.profile.UserProfileData>} */
            profiles:
                (
                    /**
                 * @this PaymentController
                 */
                    async function* () {
                        let lastUseridsSize = 0;


                        while ([...userids][lastUseridsSize - 1] !== null) {
                            try {

                                // We wait for the data generator, if the size of the userid set hasn't changed.
                                // But, if the data generator says it's over, then it's over
                                let timeout = setTimeout(() => profilesNext(), 1000)
                                await new Promise((resolve) => (profilesNext = resolve))
                                clearTimeout(timeout);


                                let currUseridsSize = userids.size

                                if (currUseridsSize > lastUseridsSize) {
                                    const batch = [...userids].slice(lastUseridsSize, currUseridsSize).filter(x => x !== null)


                                    if (batch.length > 0) {

                                        const profiles = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.getProfiles(batch)
                                        for (const profile of profiles) {
                                            yield profile
                                        }
                                    }


                                }

                                lastUseridsSize = currUseridsSize
                            } catch (e) {
                                console.warn(`Error while looping through payment records\n`, e)
                            }
                        }


                    }
                ).bind(this)

        }

    }



}




/**
 * This uses a userid to check if the user has ownership of a payment record or to ignore the results of the ownership check if the user has the given permissions
 * @param {object} param0 
 * @param {string} param0.userid
 * @param {finance.payment.PaymentRecord param0.record
 * @param {string[]} param0.bypass_permissions
 * @returns {Promise<void>}
 */
export const ownership_check = async ({ userid, record, bypass_permissions }) => {


    if (
        !await muser_common.whitelisted_permission_check(
            {
                userid,
                whitelist: record.owners,
                intent: {
                    freedom: 'use',
                    zones: undefined
                },
                permissions: bypass_permissions,
                throwError: false
            }
        )
    ) {

        throw new Exception(`You donot own this payment and you also don't have sufficient permissions to view and modify it.`)

    }
}




const locks = Symbol()

/**
 * This class makes sure, only a single call to the execute() method for a record is made at a time
 */
class ExecuteLockManager {

    constructor() {
        /** @type {{[record: string]: {time:number, locked:boolean}}} */
        this[locks] = {}
    }
    lock(id) {
        if ((Date.now() - this[locks][id]?.time) > ExecuteLockManager.lockTime) {
            return false
        }
        this[locks][id] = { time: Date.now(), locked: true }
        return true
    }
    unlock(id) {
        this[locks][id].locked = false
    }

    /**
     * This method let's us know if the record can be updated.
     * 
     * Even it's not executable.
     * @param {string} id The id of the record
     * @returns {boolean}
     */
    canUpdate(id) {
        return !this[locks][id]?.locked
    }

    static get lockTime() {
        return 2 * 60 * 1000 //2 mins before a record can be executed again
    }

}