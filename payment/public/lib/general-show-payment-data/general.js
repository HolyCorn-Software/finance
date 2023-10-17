/*
Copyright 2021 HolyCorn Software
Revised 2022 for BGI Swap 2
The BGI Swap Project
This module defines a payment UI for payment methods in general, and is agnostic that certain payment methods deal with user links
It is intended that payment providers extend this class in order to quickly provide good-looking payment UIs
*/

import { PaymentProvidedUI } from '../provided-ui/model.js'
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

hc.importModuleCSS(import.meta.url)


export default class GeneralPaymentUI extends PaymentProvidedUI {

    constructor() {

        super(...arguments)


        this.content = document.spawn({
            class: 'hc-bgis-genpayui',
            innerHTML: `
                <div class='container'>

                    <div class='all-content'>
                        <div class='top'>
                            <div class='logo'><img src='/res/pp_fc_hl.svg'></div>
                        </div>

                        <div class='middle'>
                            <div class='text'>Dial *126# and confirm payment</div>
                        </div>

                        <div class='bottom'>
                            <div class='payment-button' link='#'>Make Payment</div>
                        </div>
                    </div>

                </div>
            `
        })

        /** @type {string} */ this.title
        this.htmlProperty('.hc-bgis-genpayui .title', 'title', 'innerHTML')
        /** @type {string} */ this.helpText
        this.htmlProperty('.hc-bgis-genpayui .middle .text', 'helpText', 'innerHTML')
        /** @type {string} */ this.buttonText
        this.htmlProperty('.hc-bgis-genpayui .bottom .payment-button', 'buttonText', 'innerHTML')

        // this.loader = new Loader();
        // this.html.$('.middle .loader').appendChild(this.loader.html)

        this.html.$('.bottom .payment-button').addEventListener('click', function () {
            window.open(this.getAttribute('link'))
        })

        /** @type {{getAttribute:function(('link')):string, setAttribute:function(('link'), string):string} & HTMLElement} */ this.paymentButton
        Reflect.defineProperty(this, 'paymentButton', {
            get: () => this.html.$('.bottom .payment-button'),
            set: () => {
                throw new Error(`Cannot override this property please.`, {
                    code: 'error.system.unplanned'
                })
            },
            configurable: true,
            enumerable: true
        })


        this.data_onchange = () => {
            this.html.$('img')?.setAttribute('src', `/$/payment/paymentMethods/images/${this.data.paymentMethod}`)
        }

        this.data_onchange();
        this.data.$0.addEventListener('change', this.data_onchange);
    }

}