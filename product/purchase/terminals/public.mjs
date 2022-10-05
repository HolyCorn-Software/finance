/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product purchase terminals module
 * This module (public) provides usable methods relating to product purchase to the general public
 */

import muser_common from "muser_common";
import ProductPurchaseController from "../controller.mjs";



const controller_symbol = Symbol()

export default class ProductPurchasePublicMethods {


    /**
     * 
     * @param {ProductPurchaseController} controller 
     */
    constructor(controller) {
        this[controller_symbol] = controller
    }

    /**
     * This method is used to purchase a single product
     * @param {Omit<import("../types.js").ProductPurchaseCommon, "userid">} param0 
     * @returns {Promise<string>}
     */
    async purchase({ quantity, product }) {
        return await this[controller_symbol].purchase(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                product: arguments[1]?.product,
                quantity: arguments[1]?.quantity
            }
        )
    }

    /**
     * This returns all the purchases initiated by the user
     * @param {object} param0
     * @param {string} param0.product If specified, only the pending purchases of the given product will be returned
     */
    async getPendingPurchases({ product } = {}) {
        return await this[controller_symbol].getPendingPurchases(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                product: arguments[1]?.product
            }
        )
    }


    /**
     * This method checks if the user has paid for the given product
     * @param {object} param0 
     * @param {string} param0.product
     * @returns {Promise<import("../types.js").PurchaseState>}
     */
    async getPurchaseStatus({ product }) {
        return await this[controller_symbol].getPurchaseStatus(
            {
                product: arguments[1]?.product,
                userid: (await muser_common.getUser(arguments[0])).id
            }
        )
    }


}