/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This module controls the logic governing the WaitingUI widget
 * It automatically initiates a debit when the waiting UI lands
 */

import { PaymentProvidedUIFrame } from "../../../lib/index.mjs";
import InlinePaymentSettle from "../debit.mjs";
import { WaitingUI } from "../waiting.mjs";
import finRpc from "/$/finance/static/lib/rpc/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";



/**
 * This function glues the logic involved with launching the waiting UI and waiting for the payment to complete
 * @param {InlinePaymentSettle} widget 
 * @param {WaitingUI} waiting_ui 
 */
export async function waitingUILogic(widget, waiting_ui) {

    let configured = false;

    let listening; //Are we listening for the event of settled transaction ?

    async function widget_statedata_onchange() {
        if (widget.state_data.stage !== 'waiting') {
            return;
        }

        if (widget.state_data.payment_data.method) {
            if (configured) {
                if (!listening) {
                    //In the case that we are returning to the waiting ui after a canceled transaction
                    setup_checker();
                }
                return
            }

            try {
                await configure()
                configured = true;
            } catch (e) {
                handle(e)
                setTimeout(() => widget.state_data.stage = 'enter-payment-details', 1000)
            }
        }


        /**
         * To acheive the effect of continuously polling the server to see if the transaction is complete and moving to the next step
         */
        function setup_checker() {

            console.log(`Setting interval`)

            const checker_interval = setInterval(async () => {

                let status = await finRpc.finance.payment.getPublicData({
                    id: widget.state_data.payment_data.id
                })
                if (status.settled_amount.value >= status.amount.value) {
                    //Then payment is complete
                    widget.state_data.stage = 'success'
                    clearInterval(checker_interval)
                    listening = false;
                }
                if (status.failed && status.failed.reason) {
                    widget.state_data.stage = 'canceled';
                    clearInterval(checker_interval)
                    listening = false;
                }
                Object.assign(widget.state_data.payment_data, status)
            }, 4500);

            listening = true;

            widget.state_data.$0.addEventListener('stage-change', () => {
                if (widget.state_data.stage !== 'waiting') {
                    return clearInterval(checker_interval)
                }
            })

        }

        setup_checker();

    }


    async function configure() {

        // First things first, has the payment been executed ?
        if (!widget.state_data.payment_data.executed) {
            await finRpc.finance.payment.execute({ id: widget.state_data.payment_data.id });
            //Now, since the payment data has changed due to execution, we now fetch it
            widget.state_data.payment_data = await finRpc.finance.payment.getPublicData({ id: widget.state_data.payment_data.id })
        }


        //Load the provider's UI
        let frame = new PaymentProvidedUIFrame()

        console.log(`widget.statedata.data.paymentMethods `, widget.state_data.data.paymentMethods)
        const provider = widget.state_data.data.paymentMethods.find(x => x.code == widget.state_data.payment_data.method).provider

        frame.path = `/${provider}/static/status-widget.mjs`
        waiting_ui.paymentUI = frame.html
        frame.load().then(x => {
            const frame_data = frame.__content_html__?.widgetObject.data;

            Object.assign(frame_data, widget.state_data.payment_data);

            frame_data.payment_method_info = widget.state_data.data.paymentMethods.find(x => x.code === widget.state_data.payment_data.method)

        });

        //From now on, wait for payment to complete, then move to the completion UI

        //Now, make use of the Cancel button
        console.log(`waiting_ui.actions `, waiting_ui.actions)
        waiting_ui.actions[0].addEventListener('click', () => cancel_payment(widget))
    }


    await widget_statedata_onchange()
    widget.state_data.$0.addEventListener('stage-change', widget_statedata_onchange);


}

/**
 * This cancels a payment
 * @param {InlinePaymentSettle} widget 
 * @returns {void}
 */
export const cancel_payment = (widget) => {

    new BrandedBinaryPopup(
        {
            question: `Do you want to permanently cancel this payment ?`,
            title: `Cancel Payment ?`,
            execute: async () => {

                if (widget.state_data.stage !== 'waiting') {
                    return waiting_ui.actions[0].removeEventListener('click', cancel_payment);
                }
                try {
                    await finRpc.finance.payment.cancelPayment({
                        id: widget.state_data.payment_data.id
                    });
                    widget.state_data.stage = 'canceled';
                    widget.state_data.payment_data.canceled = true;
                    //Now update the data we have about the payment
                    Object.assign(widget.state_data.payment_data, await finRpc.finance.payment.getPublicData({ id: widget.state_data.payment_data.id }))

                } catch (e) {
                    handle(e)
                }
            },
            positive: `Yes`,
            negative: `No`
        }
    ).show()


}