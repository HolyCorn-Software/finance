/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (payment-failure) is the face of the inline-debit widget when the payment failed for a reason
 */

import { PaymentDone } from "./payment-done.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export class PaymentFailureUI extends PaymentDone {

    constructor() {
        super();

        super.image = './res/payment-failure.png'
        this.text = `Payment failed!`

        let retry = new ActionButton({
            content: 'Try Again',
            onclick: ()=>{
                this.dispatchEvent(new CustomEvent('retry'))
            }
        });
        /** @type {function(('retry'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
        
        this.html.classList.add('hcts-inline-payment-settle-payment-failure')
        retry.html.classList.add('retry')
        this.actions.push(
            retry.html
        )
    }

}

hc.importModuleCSS(import.meta.url)