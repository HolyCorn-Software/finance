/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module allows the general public to enjoy features related managing data about products
 */

import ProductDataController from "../controller.mjs";




const controller_symbol = Symbol()

export default class ProductDataPublicMethods {


    /**
     * 
     * @param {ProductDataController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
    }

    /**
     * This returns information about a product
     * @param {object} param0
     * @param {string} param0.id
     * @returns {Promise<finance.product.data.ProductData>}
     */
    async getProduct({id}) {
        let data = await this[controller_symbol].findProduct({ id: arguments[1]?.id })
        delete data.owners
        return data;
    }

}

