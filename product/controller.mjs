/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module is the heart of the product module.
 * The product module is involved with the dynamics of the creation and purchase of products
 */

import ProductDataController, { product_data_permissions } from "./data/controller.mjs";
import ProductPurchaseController from "./purchase/controller.mjs";
import PaymentController from "../payment/controller.mjs";

const faculty = FacultyPlatform.get()



export default class ProductController {

    /**
     * 
     * @param {object} param0
     * @param {object} param0.collections 
     * @param {import("./data/types.js").ProductDataCollection} param0.collections.data
     * @param {import("./purchase/types.js").ProductPurchaseCollection} param0.collections.purchase
     * @param {PaymentController} param0.payment_controller
     */
    constructor({collections, payment_controller}) {

        this.data = new ProductDataController(collections.data)
        this.purchase = new ProductPurchaseController({
            collection:collections.purchase,
            data_controller: this.data,
            payment_controller: payment_controller
        })

    }

    async init(){



        /** @type {import("faculty/modernuser/terminals/internal.mjs").default} */
        const modernuser = (await faculty.connectionManager.connect('modernuser')).remote


        //Create all the necessary permissions
        for(let permission of product_data_permissions){
            modernuser.permissions.data.createPermission(permission)
        }
        
    }

}