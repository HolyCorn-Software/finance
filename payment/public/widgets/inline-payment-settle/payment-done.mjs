/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (payment-success) reflects the state of the inline-debit widget when payment has been successfully made
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export class PaymentDone extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-hcts-inline-payment-payment-done', 'hcts-inline-payment-settle-screen'],
            innerHTML: `
                <div class='container'>
                    <div class='image'>
                        <img>
                    </div>

                    <div class='text'></div>

                    <div class='actions'></div>
                </div>
            `
        })

        this.image = './res/payment-complete.png'
        /** @type {string} */ this.text
        this.htmlProperty('.container >.text', 'text', 'innerHTML')

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.actions',
            childType: 'html',
            property: 'actions'
        });

    }

    set image(img_url) {
        this.html.$('.image img').src = new URL(img_url, hc.getCaller()).href
    }
    get image() {
        this.html.$('.image img').src
    }

}