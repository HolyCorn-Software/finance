/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product purchase terminals module
 * This module (internal) provides usable methods relating to product purchase to other faculties
 */

import ProductPurchaseController from "../controller.mjs";



const controller_symbol = Symbol()

export default class ProductPurchaseInternalMethods {


    /**
     * 
     * @param {ProductPurchaseController} controller 
     */
    constructor(controller) {
        this[controller_symbol] = controller
    }

    /**
     * This method is used to purchase a single product
     * @param {Omit<finance.product.purchase.ProductPurchaseCommon, "userid">} param0 
     * @returns {Promise<string>}
     */
    async createPurchase({ quantity, userid, product }) {
        return await this[controller_symbol].purchase(
            {
                userid: arguments[1]?.userid,
                product: arguments[1]?.product,
                quantity: arguments[1]?.quantity
            }
        )
    }


    /**
     * This method checks the current state of a product purchase
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.product
     * @returns {Promise<import("../types.js").PurchaseState>}
     */
    async getPurchaseStatus({ userid, product }) {
        return await this[controller_symbol].getPurchaseStatus({ ...arguments[1] })
    }


}