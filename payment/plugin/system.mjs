/**
 * Copyright 2022 HolyCorn Software
 * The Faculty of Finance
 * 
 * This module allows payment plugins access specific features that are useful for them
 * 
 */

import { CurrencyController } from "../../currency/controller.mjs";



const currency = Symbol()

export default class PaymentPluginSystemInterface {


    constructor() {




    }

    /**
     * @returns {CurrencyController}
     */
    get currency() {
        return this[currency] ||= new CurrencyController()
    }

}