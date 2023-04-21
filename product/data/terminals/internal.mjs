/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides useful methods to other faculties, in relation to product data management
 */

import ProductDataController from "../controller.mjs";



const controller_symbol = Symbol()

export default class ProductDataInternalMethods {

    /**
     * 
     * @param {ProductDataController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
    }

    /**
     * This method is used to create a new product
     * @param {object} param0
     * @param {Omit<import("../types.js").ProductData, "id"|"time">} param0.data  Information about the new product
     * @param {string} param0.userid If specified, permission checks will be made with that user. After that, the product will be owned 
     * by the user
     * @param {string[]} param0.zones If specified alongside the userid, checks will be made to ensure that the given userid has permissions to create products
     * in the given zone
     * 
     * @returns {Promise<string>}
     */
    async createProduct({ data, userid, zones }) {
        return await this[controller_symbol].createProduct({
            data: arguments[1]?.data,
            userid: arguments[1]?.userid,
            zones: arguments[1]?.zones
        })
    }


    /**
     * This method is used to delete a product.
     * 
     * If the userid is specified, security checks will be performed
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async deleteProduct({ id, userid }) {
        await this[controller_symbol].deleteProduct({ ...arguments[1] })
    }

    /**
     * This method is used to update a product.
     * 
     * If the security parameter is specified, checks will be made to ensure that the given user can make changes to the product.
     * @param {object} param0 
     * @param {string} param0.id
     * @param {import("../types.js").ProductMutableData} param0.data
     * @param {object} param0.security
     * @param {string} param0.security.userid
     * @param {string} param0.security.zones
     * @returns {Promise<void>}
     */
    async updateProduct({ id, data, security }) {
        await this[controller_symbol].modifyProduct({ ...arguments[1] })
    }

    /**
     * This method is used to retrieve a product
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<import("../types.js").ProductData>}
     */
    async getProduct({ id }) {
        return await this[controller_symbol].findProduct({ ...arguments[1] })
    }

}