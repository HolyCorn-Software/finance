/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (choose-payment-method) is part of the inline-debit widget.
 * This is a phase of the payment process where by the user selects the preferred payment method
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { PaymentMethod } from './payment-method.mjs'

export class ChoosePaymentMethod extends Widget {

    /**
     * 
     * @param {import("./types.js").StateStorageObject} state_data 
     */
    constructor(state_data) {
        super();

        super.html = hc.spawn({
            classes: ['hc-hcts-payment-inline-debit-select-payment-method', 'hcts-inline-payment-settle-screen'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>Choose your payment Method</div>
                    <div class='methods'></div>
                </div>
            `
        });

        /** @type {Finance.Payment.ClientPaymentMethodInfo[]} */ this.paymentMethods
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.methods',
            property: 'paymentMethods',
            transforms: {
                get: (html) => {
                    let widget = html.widgetObject
                    return widget.data
                },

                /**
                 * 
                 * @param {Finance.Payment.ClientPaymentMethodInfo} data 
                 * @returns 
                 */
                set: (data) => {
                    let widget = new PaymentMethod(data)
                    widget.code = data.code

                    widget.addEventListener('click', () => {
                        this.value = widget.code
                    })
                    return widget.html
                }
            }
        });

        /** @type {string} */ this.value
        let value_store;
        Reflect.defineProperty(this, 'value', {
            get: () => value_store,
            set: v => {
                value_store = v
                this.dispatchEvent(new CustomEvent('change'))
            }
        });

        /** @type { function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        /** @type {import("./types.js").StateStorageObject} */
        this.state_data = state_data

        //Each time the state_data widget changes, update the list of payment methods
        this.state_data.$0.addEventListener('stage-change', () => this.render())
    }

    render() {
        if (this.state_data.stage == 'select-payment-method' && this.state_data?.data?.paymentMethods) {
            let paymentMethods = this.state_data.data.paymentMethods
            if (this.state_data.payment_data.method_whitelist) {
                paymentMethods = this.state_data.payment_data.method_whitelist.map(x => paymentMethods.find(m => m.code == x)).filter(x => typeof x !== 'undefined')
            }
            this.paymentMethods = paymentMethods
        }
    }

}