/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This is adapted from the CAYOFED People System
 * This widget shows the user the status of BinancePay payment
 */

import { PaymentProvidedUI } from "/$/finance/payment/static/lib/index.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class BinancePayStatusWidget extends PaymentProvidedUI {

    constructor() {
        super()

        this.content = hc.spawn({
            classes: ['hc-cayofedpeople-binancepay-status'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <img>
                        <div class='wait-text'></div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.wait_text
        this.htmlProperty('.container >.main>.wait-text', 'wait_text', 'innerHTML')

        /** @type {string} */ this.image_url
        this.htmlProperty('.container >.main >img', 'image_url', 'attribute', undefined, 'src')



        this.data.$0.addEventListener('client_data.output-change', () => {
            this.wait_text = this.data.client_data.output.message.html
        })

        this.data.$0.addEventListener('payment_method_info-change', () => {
            this.image_url = this.data.payment_method_info.image.data
        })


    }

}


hc.importModuleCSS(import.meta.url)