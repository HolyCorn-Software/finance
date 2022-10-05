/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty Finance
 * The product purchase module
 * This module(controller) has the overall logic of managing product purchases
 * 
 */

import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";
import { Exception } from "../../../../system/errors/backend/exception.js";
import { checkArgs } from "../../../../system/util/util.js";
import PaymentController from "../../payment/controller.mjs";
import ProductDataController from "../data/controller.mjs";



const payment_controller_symbol = Symbol()
const data_controller_symbol = Symbol()
const collection_symbol = Symbol()

const faculty = FacultyPlatform.get()


export default class ProductPurchaseController {

    /**
     * 
     * @param {object} param0
     * @param {import("./types.js").ProductPurchaseCollection} param0.collection
     * @param {PaymentController} param0.payment_controller 
     * @param {ProductDataController} param0.data_controller
     */
    constructor({ collection, payment_controller, data_controller }) {
        this[payment_controller_symbol] = payment_controller
        this[data_controller_symbol] = data_controller;
        this[collection_symbol] = collection;

        //Now let's listen to the situation where a payment is complete. Once it is complete, we emit an event signaling that a product purchase is complete
        faculty.connectionManager.events.addListener(`${faculty.descriptor.name}.payment-complete`, async (id) => {
            const product_purchase = await this[collection_symbol].findOne({ payment: id })
            if (product_purchase) {
                //For now, let's deal only with successful purchases
                faculty.connectionManager.events.emit(`${faculty.descriptor.name}.product-purchase.complete`, product_purchase.product)
            }
        })

        faculty.connectionManager.events.addListener(`${faculty.descriptor.name}.product-delete`, async (id) => {
            //Now that a product is deleted, delete all pending purchases

            const purchases = this[collection_symbol].find({ product: id })

            let purchase;

            while ((purchase = await purchases.next())) {
                this[payment_controller_symbol].deleteRecord({ id: purchase.payment })
            }

            this[collection_symbol].deleteMany({
                product: id
            });



        })

    }

    /**
     * This method is used to purchase a product.
     * 
     * It returns a payment id
     * @param {import("./types.js").ProductPurchaseCommon} param0 
     */
    async purchase({ userid, product, quantity }) {

        checkArgs(arguments[0], {
            'quantity': 'number',
            'product': 'string'
        })

        const product_data = await this[data_controller_symbol].findProduct({ id: product })
        if (quantity < 1) {
            throw new Exception(`Invalid quantity. You can purchase at least 1, not ${quantity}`)
        }
        const total = quantity * product_data.price.value

        const payment_id = await this[payment_controller_symbol].createRecord(
            {
                owners: [userid],
                amount: {
                    value: total,
                    currency: product_data.price.currency
                },
                type: 'invoice'
            }
        );

        this[collection_symbol].insertOne(
            {
                userid,
                product,
                quantity,
                payment: payment_id,
                time: Date.now(),
            }
        )

        return payment_id

    }

    /**
     * This method returns all the pending purchases associated to a user
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {object} param0.product If specified, the results will be filtered to only the ones that concern the given product
     * @returns {Promise<[import("./types.js").PendingProductPurchase]>}
     */
    async getPendingPurchases({ userid, product }) {
        const query = { userid }
        if (product) {
            query.product = product
        }
        return await this[collection_symbol].find(query).toArray()
    }




    /**
     * This method checks the current state of a product purchase
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.product
     * @returns {Promise<import("./types.js").PurchaseState>}
     */
    async getPurchaseStatus({ userid, product }) {


        const pending_purchases = await this.getPendingPurchases({ userid, product })


        const records = await Promise.all(
            pending_purchases.map(async entry => {
                return await this[payment_controller_symbol].findRecord({ id: entry.payment })
            })
        );



        //Now, we have a number of possibilities
        //1) No record, purchase state is blank
        if (records.length === 0) {
            return 'blank'
        }

        //2) There's atleast a complete transaction, then the purchase is complete
        if (records.some(record => record.settled_amount.value > 0 && record.settled_amount.value >= record.amount.value)) {
            return 'complete'
        }

        // 3) There's at least one transaction that's pending
        if (records.some(record => !record.failed?.time)) {
            return 'pending'
        }

        //Finally, then all the records have failed
        return 'failed'

    }


}
