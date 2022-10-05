/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides the world with methods from the Faculty of Finance strictly related to payment
 * 
 */

import muser_common from "muser_common"
import { checkArgs } from "../../../../system/util/util.js"
import PaymentController from "../controller.mjs"



const controller_symbol = Symbol()


export default class PaymentPublicMethods {

    /**
     * 
     * @param {PaymentController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
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
     * This method is used by a client to update a record
     * @param {object} param0 
     * @param {string} param0.id
     * @param {import("../types.js").PaymentWritablePublicData} param0.data
     * @returns {Promise<void>}
     */
    async publicUpdate({ id, data }) {
        id = arguments[1]?.id
        data = arguments[1]?.data
        await this[controller_symbol].publicUpdate({ userid: (await muser_common.getUser(arguments[0])).id, id, data })
    }


    /**
     * This returns the list of all payment methods
     * @returns {Promise<[import("../types.js").ClientPaymentMethodInfo]>}
     */
    async getPaymentMethods() {

        let methods = await this[controller_symbol].getPaymentMethods();

        //Simply convert the buffers into data urls
        return methods.map(method => {
            method.image.mimeType ||= 'image/png'
            let new_method = { ...method, image: { mimeType: method.image.mimeType } }
            new_method.image.data = `data:${method.image.mimeType};base64,${method.image.data.toString('base64')}`
            return new_method
        })

    }


    /**
     * This method is used by the client to retrieve the form used by the client for a particular purpose
     * @param {object} param0 
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/lib/hc/multi-flex-form/types.js").MultiFlexFormDefinitionData}
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

        checkArgs(arguments[1], { id: 'string' }, 'input')

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



}




