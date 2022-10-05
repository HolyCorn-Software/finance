/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module configures the logic used by the payment failure ui
 */

import  InlinePaymentSettle from "../debit.mjs";
import { PaymentFailureUI } from "../payment-failure.mjs";


/**
 * 
 * @param {InlinePaymentSettle} payment_widget 
 * @param {PaymentFailureUI} failure_widget 
 */
export default function configureFailureUI(payment_widget, failure_widget){

    failure_widget.addEventListener('retry', ()=>{
        payment_widget.state_data.stage = 'select-payment-method'
    })
}