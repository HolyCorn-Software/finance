/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module provides publicly available methods from the Faculty of Finance
 * The decision to create this controller is more based on the need to organize things
 */

import { HTTPServer } from "../../system/http/server.js";
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

        this.payment = new PaymentController(collections.payment)
        this.refresher = new PaymentRefresher(collections.payment, this.payment)
        this.product = new ProductController({
            collections: collections.product,
            payment_controller: this.payment

        })

    }

    /**
     * This method initializes the controlling parts of the Faculty of Finance
     * @param {HTTPServer} http
     */
    async init(http) {
        await this.payment.init(http)
        await this.product.init(http);
        this.refresher.start_loop()
    }

}