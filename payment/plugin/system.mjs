/**
 * Copyright 2022 HolyCorn Software
 * The Faculty of Finance
 * 
 * This module allows payment plugins access specific features that are useful for them
 * 
 */

import { CurrencyController } from "../../currency/controller.mjs";
import PaymentController from "../controller.mjs";



const currency = Symbol()
const controller = Symbol()

export default class PaymentPluginSystemInterface {


    /**
     * 
     * @param {PaymentController} _controller 
     */
    constructor(_controller) {
        this[controller] = _controller

    }

    /**
     * @returns {CurrencyController}
     */
    get currency() {
        return this[currency] ||= new CurrencyController()
    }

    get controller() {
        return this[controller];
    }

}