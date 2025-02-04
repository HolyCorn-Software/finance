/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module is the heart of the product module.
 * The product module is involved with the dynamics of the creation and purchase of products
 */

import ProductDataController from "./data/controller.mjs";
import ProductPurchaseController from "./purchase/controller.mjs";
import PaymentController from "../payment/controller.mjs";



export default class ProductController {

    /**
     * 
     * @param {object} param0
     * @param {object} param0.collections 
     * @param {finance.product.data.ProductDataCollection} param0.collections.data
     * @param {finance.product.purchase.ProductPurchaseCollection} param0.collections.purchase
     * @param {PaymentController} param0.payment_controller
     */
    constructor({ collections, payment_controller }) {

        this.data = new ProductDataController(collections.data)
        this.purchase = new ProductPurchaseController({
            collection: collections.purchase,
            data_controller: this.data,
            payment_controller: payment_controller
        })

    }
}