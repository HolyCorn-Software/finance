/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module allows other faculties, access to some method related to management of payments
 * 
 */


import PaymentController from "../controller.mjs";



const controller_symbol = Symbol()

export default class PaymentInternalMethods {

    /**
     * 
     * @param {PaymentController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller

    }


    /**
     * 
     * This method is used to create a payment
     * @param {Finance.Payment.PaymentRecordInit} data 
     */
    async create(data) {
        return await this[controller_symbol].createRecord(arguments[1])
    }


    /**
     * This method is used to retrieve info of a payment
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<Finance.Payment.PaymentRecord>}
     */
    async getPayment({ id }) {
        return await this[controller_symbol].findRecord({ ...arguments[1] })
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
        await this[controller_symbol].publicUpdate({ id, data })
    }

    async userDismiss({ id }) {
        return await this[controller_symbol].userDismiss({ id: arguments[1]?.id })
    }


    /**
     * This returns the list of all payment methods
     * @returns {Promise<[Finance.Payment.ClientPaymentMethodInfo]>}
     */
    async getPaymentMethods() {

        return await this[controller_symbol].getPaymentMethods();
    }


    /**
     * This method is used by the client to retrieve the form used by the client for a particular purpose
     * @param {object} param0 
     * @param {('invoice'|'payout')} param0.intent
     * @param {string} param0.method
     * @returns {Promise<import("/$/system/static/html-hc/widgets/multi-flex-form/types.js").MultiFlexFormDefinitionData}
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

        await this[controller_symbol].execute({ id: arguments[1]?.id })
    }



}