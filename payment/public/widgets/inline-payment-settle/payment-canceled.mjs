/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (payment-failure) is the face of the inline-debit widget when the payment was canceled
 */

import { PaymentDone } from "./payment-done.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export class PaymentCanceledUI extends PaymentDone {


    constructor(state_data) {
        super();

        super.image = './res/payment-failure.png'
        this.text = `Payment canceled!`


        this.html.classList.add('hcts-inline-payment-settle-payment-canceled')
        this.actions = []

        /** @type {import('/$/system/static/html-hc/lib/alarm/alarm-types').AlarmObject<import("./types.js").StateStorage>} */ this.state_data = state_data

        this.state_data.$0.addEventListener('payment_data.failed.reason-change', () => {
            this.update_text()
        })

        this.update_text()


    }

    update_text() {
        this.text = this.state_data.payment_data.failed?.reason || this.text
    }

}

hc.importModuleCSS(import.meta.url)