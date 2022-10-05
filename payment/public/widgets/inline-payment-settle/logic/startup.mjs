/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This module (load) allows the inline-debit module to load the details of a payment from the server
 */

import InlinePaymentSettle from "../debit.mjs";
import finRpc from "/$/finance/static/lib/rpc/rpc.mjs";


/**
 * 
 * @param {InlinePaymentSettle} widget 
 */
export async function startupLogic(widget) {

    const stop = () => {
        widget.loadUnblock()
    }

    try {
        widget.loadBlock();

        let payment_data = await finRpc.finance.payment.getPublicData({
            id: widget.state_data.payment_data.id
        });

        Object.assign(widget.state_data.payment_data, payment_data);


        if (payment_data.failed?.time !== undefined) {
            widget.state_data.stage = 'canceled';
            return stop();
        }

        console.log(`Where do we resume `, payment_data)

        //Now deciding on where the widget will go
        if (payment_data.settled_amount.value >= payment_data.amount.value) { //If the user has paid the amount or more
            widget.state_data.stage = 'success'
            return stop()
        }

        const load_payment_providers_ui = async () => {
            widget.state_data.data.paymentMethods = await finRpc.finance.payment.getPaymentMethods()
        }



        //Well, from here, it is only possible that the user has not completed payment

        //So load the payment selection UI
        await load_payment_providers_ui();

        //So, if a payment method has not already been chosen, show a UI for that
        if (!widget.state_data.payment_data.method) {

            widget.state_data.stage = 'select-payment-method'
            return stop()
        }

        //However, if there's already a payment method chosen
        //And the user has not been debited, then he gets to re-enter his payment details
        if (!widget.state_data.payment_data.executed) {
            widget.state_data.stage = 'enter-payment-details'
            return stop();
        }

        //So at this point, the payment method is set, and the client has already been debited
        //The best thing is to offer the client a waiting UI
        widget.state_data.stage = 'waiting';
        stop();

    } catch (e) {
        stop()
        throw e
    }

}