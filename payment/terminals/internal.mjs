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
     * @param {import("../types.js").PaymentRecordInit} data 
     */
    async create(data) {
        return await this[controller_symbol].createRecord(arguments[1])
    }


    /**
     * This method is used to retrieve info of a payment
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<import("../types.js").PaymentRecord>}
     */
    async getPayment({ id }) {
        return await this[controller_symbol].findRecord({ ...arguments[1] })
    }


}