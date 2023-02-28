/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module configures the logic used by the payment failure ui
 */

import InlinePaymentSettle from "../debit.mjs";
import { PaymentFailureUI } from "../payment-failure.mjs";
import ListPopup from "/$/system/static/html-hc/widgets/list-popup/widget.mjs";


/**
 * 
 * @param {InlinePaymentSettle} payment_widget 
 * @param {PaymentFailureUI} failure_widget 
 */
export default function configureFailureUI(payment_widget, failure_widget) {

    failure_widget.addEventListener('retry', () => {

        const hasInput = Array.isArray(payment_widget.state_data.data.form)
        const paymentMethodLabel = payment_widget.state_data.data.paymentMethods.find(x => x.code === payment_widget.state_data.payment_data.method).label
        console.log(`payment_widget.state_data.$0data`, payment_widget.state_data.$0data)
        console.log(`hasInput: `, hasInput)

        const popup = new ListPopup(
            {
                hideOnOutsideClick: false,
                selectionSize: { min: 1, max: 1 },
                title: `Retry payment`,
                caption: `How do you want to retry the payment?`,
                options: [
                    {
                        label: `Same information`,
                        caption: `Use the same information, and try the payment again.`,
                        value: 'none'
                    },

                    hasInput ? {
                        label: `Change some information`,
                        caption: `Change your information and still use ${paymentMethodLabel}`,
                        value: 'part'
                    } : undefined,
                    {
                        label: `Change everything`,
                        caption: `Select a new payment method, and try again`,
                        value: 'all'
                    }

                ],
                actionText: `Retry`,
            }
        );

        popup.waitTillSelect().then(x => {
            const choice = x[0];
            payment_widget.state_data.stage =
                choice === 'all' ? 'select-payment-method'
                    : choice === 'part' ? 'enter-payment-details' :
                        'waiting';

            payment_widget.state_data.retry = true;
        })

    })
}