/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This module controls the logic involved with how the user enters data which will eventually be used to bill him
 * 
 */

import InlinePaymentSettle from "../debit.mjs";
import { EnterPaymentDetails } from "../enter-payment-details.mjs";
import finRpc from "/$/finance/static/lib/rpc/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";


/**
 * 
 * @param {InlinePaymentSettle} widget 
 * @param {EnterPaymentDetails} enter_details_widget 
 */
export async function enterPaymentDetailsLogic(widget, enter_details_widget) {


    let widget_statedata_onchange = async () => {

        if (widget.state_data.stage !== 'enter-payment-details') {
            return;
        }

        if (widget.state_data.payment_data.method && enter_details_widget.formWidget.items.length === 0) {

            try {


                let form_structure = await finRpc.finance.payment.getInlineForm({
                    intent: 'invoice',
                    method: widget.state_data.payment_data.method
                });

                if (form_structure === null || !form_structure) {


                    //Now if the provider doesn't require any input to charge the client, then just go ahead

                    await finRpc.finance.payment.publicUpdate(
                        {
                            id: widget.state_data.payment_data.id,
                            data: {
                                client_data: {
                                    input: {
                                        empty: true //Just bla bla bla. This helps prevents us from returning to this screen next time
                                    }
                                }
                            }
                        }
                    );

                    return widget.state_data.stage = 'waiting';
                }


                widget.state_data.data.form = form_structure
                enter_details_widget.formWidget.values = widget.state_data.payment_data.client_data.input

                enter_details_widget.actions[0].addEventListener('click', async () => {
                    //Now, if the user submits his details, update the payment details and move to the next phase
                    //Debit will be initiated by the next phase ('waiting')


                    try {

                        //So, while submitting the details, show a waiting dialogue as expected
                        await enter_details_widget.loadBlock()

                        await sendUserInput(widget, enter_details_widget)
                        widget.state_data.stage = 'waiting'
                    } catch (e) {
                        handle(e)
                    }

                    enter_details_widget.loadUnblock()

                })

            } catch (e) {
                handle(e)
            }
        }
    }

    //Now, when the payment method changes, get the appropriate form for the payment method
    widget.state_data.$0.addEventListener('stage-change', widget_statedata_onchange)

    widget_statedata_onchange()

}


/**
 * This method specifically updates the user details to the server
 * @param {InlinePaymentSettle} widget 
 * @param {EnterPaymentDetails} enter_details_widget 
 */
async function sendUserInput(widget, enter_details_widget) {

    return await finRpc.finance.payment.publicUpdate(
        {
            id: widget.state_data.payment_data.id,
            data: {
                client_data: {
                    input: {
                        ...enter_details_widget.formWidget.value
                    }
                }
            }
        }
    );
}