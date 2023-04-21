/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module provides publicly available methods from the Faculty of Finance
 * The decision to create this controller is more based on the need to organize things
 */

import { CurrencyController } from "./currency/controller.mjs";
import PaymentController from "./payment/controller.mjs";
import PaymentRefresher from "./payment/refresher/refresher.mjs";
import ProductController from "./product/controller.mjs";



export default class FinanceController {


    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").FinanceCollections} param0.collections
     */
    constructor({ collections }) {

        this.currency = new CurrencyController()
        this.payment = new PaymentController(collections.payment, this.currency)
        this.refresher = new PaymentRefresher(collections.payment, this.payment)
        this.product = new ProductController({
            collections: collections.product,
            payment_controller: this.payment

        })

    }

    /**
     * This method initializes the controlling parts of the Faculty of Finance
     */
    async init() {
        await this.payment.init()
        this.refresher.start_loop()
    }

}