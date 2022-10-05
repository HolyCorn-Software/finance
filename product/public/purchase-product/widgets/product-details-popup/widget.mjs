/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Payment
 * This widget shows the details of a product being purchased
 */

import { HCTSBrandedPopup } from "/$/system/static/lib/hc/branded-popup/popup.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";


export default class PaymentProductDetailsPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {import("faculty/payment/processor/products/types.js").PaymentProduct} data 
     */
    constructor(data) {
        super();

        this.content = hc.spawn({
            classes: ['hc-cayofedpeople-payment-product-details-popup-content'],
            innerHTML: `
                <div class='label'></div>
                <div class='description'></div>
            `
        })

        /** @type {string} */ this.label
        /** @type {string} */ this.description

        for (let prop of ['label', 'description']) {
            this.htmlProperty(`.hc-cayofedpeople-payment-product-details-popup-content >.${prop}`, prop, 'innerHTML')
        }

        Object.assign(this, data)



    }

}

hc.importModuleCSS()