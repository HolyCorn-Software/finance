/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides publicly available methods related to managing products
 */

import ProductDataController from "../data/controller.mjs";
import ProductDataPublicMethods from "../data/terminals/public.mjs";
import ProductPurchaseController from "../purchase/controller.mjs";
import ProductPurchasePublicMethods from "../purchase/terminals/public.mjs";


export default class ProductPublicMethods {


    /**
     * 
     * @param {ProductDataController} data_controller 
     * @param {ProductPurchaseController} purchase_controller 
     */
    constructor(data_controller, purchase_controller) {


        this.purchase = new ProductPurchasePublicMethods(purchase_controller)
        this.data = new ProductDataPublicMethods(data_controller)

    }

}