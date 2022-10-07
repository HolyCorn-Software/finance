/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Payment
 * 
 * This widget shows a simple comprehensive description of the product being purchased
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

import PaymentProductDetailsPopup from '../product-details-popup/widget.mjs'



export default class ProductDescription extends Widget {

    /**
     * 
     * @param {import("faculty/payment/processor/products/types.js").PaymentProduct} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-payment-product-description'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>You are paying for <div class='product-label'></div>  </div>
                    <div class='price'><div class='value'></div> <div class='currency'></div>  </div>
                </div>
            `
        })

        /** @type {string} */ this.label
        this.htmlProperty(".container >.title >.product-label", "label", "innerHTML")

        /** @type {string} */ this.description
        

        this.html.$('.container >.title >.product-label').addEventListener('click', () => {
            new PaymentProductDetailsPopup({label: this.label, description: this.description}).show()
        })

        /** @type {string} */ this.price_value
        /** @type {string} */ this.price_currency

        for (let prop of ['value', 'currency']) {
            this.htmlProperty(`.container >.price >.${prop}`, `price_${prop}`, 'innerHTML')
        }

        /** @type {import("faculty/payment/types.js").Amount} */ this.price

        Reflect.defineProperty(this, 'price', {
            /**
             * 
             * @param {import("faculty/payment/types.js").Amount} price 
             */
            set: (price) => {
                this.price_currency = price.currency
                this.price_value = price.value
            },
            get: () => {
                return {
                    value: new Number(this.price_value).valueOf(),
                    currency: this.price_currency
                }
            },
            configurable: true,
            enumerable: true,
        })

        Object.assign(this, data);


    }

}