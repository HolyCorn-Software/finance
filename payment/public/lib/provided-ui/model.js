/*
Copyright 2022 HolyCorn Software
The BGI Swap Project
This represents the model for all provided UIs (UIs that come from a payment provider (e.g coinbase))

*/

import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { AlarmObject } from "/$/system/static/lib/hc/lib/util/alarm.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";

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
         * @type {import("/$/system/static/lib/hc/lib/util/alarm-types.js").AlarmObject<import("faculty/finance/payment/types.js").PaymentRecord & {payment_method_info: import("faculty/finance/payment/types.js").ClientPaymentMethodInfo}>}
         */
        this.data = new AlarmObject();


        // Auto import CSS for the widget
        hc.importModuleCSS(hc.getCaller())

    }

}