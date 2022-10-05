/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This module (select-payment-method) controls the logic allowing the user to select a payment method
 */

import InlinePaymentSettle from "../debit.mjs";
import { ChoosePaymentMethod } from "../select-payment-method.mjs";
import finRpc from "/$/finance/static/lib/rpc/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";


/**
 * 
 * @param {InlinePaymentSettle} widget 
 * @param {ChoosePaymentMethod} selection_widget 
 */
export async function paymentSelectLogic(widget, selection_widget) {

    if (widget.state_data.stage !== 'select-payment-method') {
        return;
    }

    selection_widget.addEventListener('change', async () => {

        try {

            if (!selection_widget.value) {
                return console.log(`selection_widget.value is`, selection_widget.value);
            }

            selection_widget.loadBlock();

            //When the user selects a payment method, we set it as the selected payment method and move over to input payment details
            await finRpc.finance.payment.publicUpdate(
                {
                    id: widget.state_data.payment_data.id,
                    data: {
                        method: selection_widget.value
                    }
                }
            );
            widget.state_data.payment_data.method = selection_widget.value;

            widget.state_data.stage = 'enter-payment-details'
        } catch (e) {
            selection_widget.loadUnblock();
            handle(e)
        }

    })

}