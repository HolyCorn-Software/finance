/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module allows other faculties to special privileges related to use and management of products
 */

import ProductDataController from "../data/controller.mjs";
import ProductDataInternalMethods from "../data/terminals/internal.mjs";
import ProductPurchaseController from "../purchase/controller.mjs";
import ProductPurchaseInternalMethods from "../purchase/terminals/internal.mjs";


export default class ProductInternalMethods {


    /**
     * 
     * @param {ProductDataController} data_controller 
     * @param {ProductPurchaseController} purchase_controller 
     */
    constructor(data_controller, purchase_controller) {

        this.data = new ProductDataInternalMethods(data_controller)
        this.purchase = new ProductPurchaseInternalMethods(purchase_controller)

    }



}