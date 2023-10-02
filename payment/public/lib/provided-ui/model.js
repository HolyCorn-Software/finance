/*
Copyright 2022 HolyCorn Software
The BGI Swap Project
This represents the model for all provided UIs (UIs that come from a payment provider (e.g coinbase))

*/

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

/**
 * @template ClientInputData
 * @template ClientOutputData
 */
export class PaymentProvidedUI extends Widget {

    constructor() {

        super();

        hc.importModuleCSS(hc.getCaller(1))

        super.html = document.spawn({
            classes: ['hc-bgis-payment-provided-ui'],
            innerHTML: `
                <div class='container'>
                    <div class='content'></div>
                </div>
            `
        });

        /** @type {HTMLElement} */ this.content

        Reflect.defineProperty(this, 'content', {
            get: () => this.html.$('.content').children[0],
            set: v => {
                for (let child of this.html.$('.content').children || []) {
                    child.remove();
                }
                this.html.$('.content').appendChild(v);
            }
        })



        /**
         * @type {{
         * done:false
         * } & AlarmObject}
         */
        this.states = new AlarmObject();

        this.states.done = false;

        /**
         * This contains data about the payment
         * @type {htmlhc.lib.alarm.AlarmObject<finance.payment.PaymentRecord<{}, ClientInputData, ClientOutputData>& {payment_method_info: finance.payment.ClientPaymentMethodInfo}>>}
         */
        this.data = new AlarmObject();

        // Auto import CSS for the widget
        hc.importModuleCSS(hc.getCaller())

    }

}