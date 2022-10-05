/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (payment-success) reflects the state of the inline-debit widget when payment has been successfully made
 */

import { PaymentDone } from "./payment-done.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";

export class PaymentSuccessUI extends PaymentDone{

    constructor(){
        super();
        
        super.image = './res/payment-complete.png'
        this.text = 'Payment Complete!'
    }
    
}