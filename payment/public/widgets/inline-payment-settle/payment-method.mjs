/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (payment-method) is part of the inline-debit widget, giving a user the minimum UI representation of a payment method
 * 
 */

import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export class PaymentMethod extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-hcts-payment-inline-debit-payment-method', 'hcts-inline-payment-settle-screen'],
            innerHTML: `
                <div class='container'>
                    <div class='img'><img></div>
                    <div class='label'></div>
                    <div class='highlighter'></div>
                </div>
            `
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {string} */ this.image_url
        this.htmlProperty('.container >.img img', 'image_url', 'attribute', undefined, 'src')

        /** @type {string} */ this.code

        /** @type {addEventListener(('click'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener;

        this.html.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('click'))
        })


    }

}