/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides the world with methods from the Faculty of Finance strictly related to payment
 * 
 */

import muser_common from "muser_common"
import PaymentController from "../controller.mjs"
import PaymentRefresher from "../refresher/refresher.mjs"



const controller_symbol = Symbol()
const refresher_symbol = Symbol()


export default class PaymentPublicMethods {

    /**
     * 
     * @param {PaymentController} controller 
     * @param {PaymentRefresher} refresher
     */
    constructor(controller, refresher) {

        this[controller_symbol] = controller
        this[refresher_symbol] = refresher
    }

    /**
     * This method returns the publicly accessible parts of a specified record
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<import("../types.js").PaymentPublicData>}
     */
    async getPublicData({ id }) {

        id = arguments[1]?.id

        //Securely find that record
        const record = await this[controller_symbol].findAndCheckOwnership(
            {
                search: { id },
                userid: (await muser_common.getUser(arguments[0])).id,
                permissions: ['permissions.finance.payment.view_any_payment']
            }
        )

        return this[controller_symbol].getPublicData(record);
    }

    /**
     * This method is used to force refresh a record, that's probably too long
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async forceRefresh({ id }) {

        await this[controller_symbol].forceRefresh({ id: arguments[1]?.id, userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method is used by a client to update a record
     * @param {object} param0 
     * @param {string} param0.id
     * @param {finance.payment.PaymentWritablePublicData} param0.data
     * @returns {Promise<void>}
     */
    async publicUpdate({ id, data }) {
        id = arguments[1]?.id
        data = arguments[1]?.data
        while (this[refresher_symbol].recordIsLocked(id)) {
            await new Promise(x => setTimeout(x, 200))
        }
        await this[controller_symbol].publicUpdate({ userid: (await muser_common.getUser(arguments[0])).id, id, data })
    }


    /**
     * This returns the list of all payment methods
     * @returns {Promise<finance.payment.ClientPaymentMethodInfo[]>}
     */
    async getPaymentMethods() {

        return await this[controller_symbol].getPaymentMethods();

    }


    /**
     * This method is used by the client to retrieve the form used by the client for a particular purpose
     * @param {object} param0 
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<htmlhc.widget.multiflexform.MultiFlexFormDefinitionData}
     */
    async getInlineForm({ intent, method }) {
        return await this[controller_symbol].getInlineForm({ ...arguments[1] })
    }


    /**
     * This method is used to execute a payment
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async execute({ id }) {

        soulUtils.checkArgs(arguments[1], { id: 'string' }, 'input')

        await this[controller_symbol].execute({ id: arguments[1]?.id, client: arguments[0] })
    }


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async cancelPayment({ id }) {

        await this[controller_symbol].userDismiss({ id: arguments[1]?.id, client: arguments[0] })
    }

    async getRecords() {
        return new JSONRPC.ActiveObject(await this[controller_symbol].getRecords())
    }

    /**
     * 
     * @param {finance.payment.PaymentRecordInit} init 
     */
    async createRecord(init) {
        init = arguments[1]
        return await this[controller_symbol].createRecord(init, (await muser_common.getUser(arguments[0])).id)
    }



}




