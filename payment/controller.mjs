/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module controls the overall functioning of the Finance Faculty
 */

import shortUUID from "short-uuid"
import { HTTPServer } from "../../../system/http/server.js"
import { Exception } from "../../../system/errors/backend/exception.js"
import { StrictFileServer } from "../../../system/http/strict-file-server.js"
import { ProviderLoader } from "../../../system/lib/libFaculty/provider-driver.js"
import PaymentProviderModel from "./provider/model.mjs"
import exclusiveUpdate from "../../../system/util/exclusive-update.mjs"
import { FacultyPlatform } from "../../../system/lib/libFaculty/platform.mjs"
import muser_common from "muser_common"



const collections_symbol = Symbol()
const providers_symbol = Symbol()

const faculty = FacultyPlatform.get()


export default class PaymentController {

    /**
     * 
     * @param {import("./types.js").PaymentCollections} collections 
     */
    constructor(collections) {

        this[collections_symbol] = collections

        /** @type {[PaymentProviderModel]} */
        this[providers_symbol] = []

    }

    /**
     * This method is called by the system.
     * When the system calls it, the PaymentController sets up the necessary stuff
     * @param {HTTPServer} http
     */
    async init(http) {

        // Setup HTTP routing for static files
        new StrictFileServer(
            {
                http,
                urlPath: '/payment/static/',
                refFolder: './public/'
            }
        ).add('./public')


        //Now Load the providers
        /** @type {ProviderLoader<PaymentProviderModel>} */
        const loader = new ProviderLoader(
            {
                providers: './provider/providers/',
                model: './provider/model.mjs',
                credentials_collection: this[collections_symbol].credentials,
                fileStructure: ['./provider.mjs', './public/status-widget.mjs'],
                relModulePath: './provider.mjs'
            },
            import.meta.url
        );

        let results = await loader.load()

        if (results.errors.length > 0) {
            console.error(`Some Payment providers failed to load \n`, results.errors.join('\n----------------------------------\n'))
        }

        this[providers_symbol] = results.providers

        for (let provider of results.providers) {
            const public_path = `${provider.$data.path}/public/`
            new StrictFileServer(
                {
                    http,
                    urlPath: `/payment/providers/${provider.$data.name}/static/`,
                    refFolder: public_path
                }
            ).add(public_path)
        }


    }


    /**
     * This creates a blank record
     * @param {import("./types.js").PaymentRecordInit} input 
     * @returns {Promise<string>}
     */
    async createRecord(input) {

        if (typeof input !== 'object') {
            throw new Exception(`Please pass an object`, { code: 'error.system.unplanned' })
        }

        if (input.type !== 'invoice' && input.type !== 'payout') {
            throw new Exception(`The type of the record being created is unknown. Specify either 'invoice' or 'payout'`, { code: 'error.system.unplanned' })
        }
        if (!input.amount?.value || !input.amount?.currency) {
            throw new Error(`Invalid input for amount, when creating a new payment record.`)
        }

        const data = {}

        data.type = input.type
        data.method = input.method
        data.owners = input.owners || []
        data.amount = input.amount

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



        //Now insert it
        await this[collections_symbol].hot.insertOne(data)

        return data.id

    }


    /**
     * This method gets the publicly accessible data of a payment record.
     * 
     * It simply takes away what is not necessary
     * @param {import("./types.js").PaymentRecord} record
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
     * @param {import("./types.js").PaymentWritablePublicData} param0.data
     * @returns {Promise<void>}
     */
    async publicUpdate({ userid, id, data }) {
        if (userid) {

            const record = await this.findAndCheckOwnership({ search: { id }, userid, })
            await ownership_check({ userid, record, bypass_permissions: ['permissions.finance.payment.modify_any_payment'] })
        }


        await this.publicUpdate0({ data, id })

    }

    async publicUpdate0({ data, id }) {

        const final_data = {}

        exclusiveUpdate(
            {
                method: 'string',
                'client_data.input': 'object'
            },
            data,
            final_data
        );

        await this.updateRecord({ search: { id }, update: final_data })

    }



    /**
     * Determines the collection that contains a record and updates it
     * @param {object} param0 
     * @param {import("./types.js").PaymentRecord} param0.search
     * @param {import("./types.js").PaymentRecord} param0.update
     * @returns {Promise<void>}
     */
    async updateRecord({ search, update }) {
        for (let collection in this[collections_symbol]) {
            if (collection === 'credentials') {
                continue;
            }
            this[collections_symbol][collection].updateOne({ ...search }, { $set: update })
        }
    }



    /**
     * This method searches for a record thoroughly, irrespective of the actual collection it resides
     * @param {import("./types.js").PaymentRecord} param0 
     * @param {object} param1
     * @param {boolean} param1.throwError
     * @returns {Promise<import("./types.js").PaymentRecord>}
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
     * @param {PaymentRecord} param0.search
     * @param {string} param0.userid If specified ownership checks will be made to see if the user owns this
     * @param {[string]} param0.permissions When specified, it will define the permissions to check for. By default this is an array containing permissions.finance.payment.modify_any_payment
     * @returns {Promise<import("./types.js").PaymentRecord>}
     */
    async findAndCheckOwnership({ search, userid, permissions = ['permissions.finance.payment.modify_any_payment'] }) {
        const record = await this.findRecord({ ...search }, { throwError: true })

        if (userid) {
            await ownership_check({ userid, record, bypass_permissions: permissions })
        }

        return record

    }


    /**
     * This returns the list of all payment methods
     * @returns {Promise<import("./types.js").ProviderPaymentMethodsInfo>}
     */
    async getPaymentMethods() {

        let promises = this[providers_symbol].map(provider => {
            //If there's already payment methods info, return them. If not fetch and store them
            return provider[payment_method_symbol] ? Promise.resolve(provider[payment_method_symbol]) : new Promise((resolve, reject) => {
                provider.getPaymentMethodsInfo().then(methods => {
                    resolve(methods)
                    provider[payment_method_symbol] = methods
                    for (let method of methods) {
                        method.provider = provider.$data.name
                    }
                })
            })
        })

        return (await Promise.allSettled(promises)).filter(promi => {
            if (promi.status === 'rejected') {
                console.warn(`Failed to load a payment method because `, promi.reason)
                return false
            }
            return true
        }).map(x => x.value).flat()

    }


    /**
     * This method is used by the client to retrieve the form used by the client for a particular purpose
     * @param {object} param0 
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/lib/hc/multi-flex-form/types.js").MultiFlexFormDefinitionData}
     */
    async getInlineForm({ intent, method }) {
        let provider = await this.getProvider({ method })
        return await provider.getInlineFormDataStructure({ intent, method })
    }

    /**
     * This method returns the provider that can handle the given method
     * @param {object} param0 
     * @param {string} param0.method
     * @returns {Promise<PaymentProviderModel>}
     */
    async getProvider({ method }) {

        let the_provider;

        await Promise.allSettled([
            this[providers_symbol].map(provider => {
                return new Promise((resolve, reject) => {
                    provider.matchProvider(method).then(() => {
                        resolve()
                        the_provider = provider
                    })

                })
            })
        ])

        if (!the_provider) {
            throw new Exception(`No provider for ${method}`)
        }
        return the_provider
    }


    /**
     * This executes a payment, whether invoice or payout
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid If specified, we'll check if the user owns the record
     * @returns {Promise<void>}
     */
    async execute({ id, userid }) {
        const record = await this.findAndCheckOwnership({ search: { id }, userid })

        //Now, check that the payment is mature (It has sufficient data that will permit the provider to execute it)
        for (let field of ['amount', 'method', 'type']) {
            if (!record[field]) {
                throw new Exception(`The payment lacks the ${field} field. It cannot yet be executed`)
            }
        }

        //Now, find the provider and execute it
        const provider = await this.getProvider({ method: record.method })

        //How do we execute the payment ?
        if (record.type === 'invoice') {
            await provider.charge(record)
        } else {
            await provider.payout(record)
        }

        record.executed = Date.now()

        this.updateRecord({ search: { id: record.id }, update: record })

    }

    /**
     * This method refreshes a record
     * @param {import("./types.js").PaymentRecord} record 
     * @param {('system'|'client')} actor
     * @returns {Promise<import("./types.js").PaymentRecord>}
     */
    async refreshRecord(record, actor = 'client') {

        if (record.method && record.amount?.value && record.amount?.currency && record.provider_data && Reflect.ownKeys(record.provider_data).length > 0) {

            const provider = await this.getProvider({ method: record.method })
            await provider.refresh(record);
            record.lastRefresh ||= { client: 0, system: 0 }
            record.lastRefresh[actor === 'client' ? 'client' : 'system'] = Date.now()
        }
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



}


const payment_method_symbol = Symbol()




/**
 * This uses a userid to check if the user has ownership of a payment record or to ignore the results of the ownership check if the user has the given permissions
 * @param {object} param0 
 * @param {string} param0.userid
 * @param {import("./types.js").PaymentRecord} param0.record
 * @param {[string]} param0.bypass_permissions
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






// Setup necessary permissions

const init = async () => {

    console.log('in init function')

    const modernuser = await muser_common.getConnection()

    console.log(`done with init function`)

    let permissions = [

        {
            name: 'permissions.finance.payment.modify_any_payment',
            label: `Modify any payment`
        },

        {
            name: 'permissions.finance.payment.view_any_payment', //TODO: Zone this permission
            label: `View data about any payment`
        }
    ]

    for (let permission of permissions) {
        await modernuser.permissions.data.createPermission(permission)
    }
}

setTimeout(() => init(), 500)