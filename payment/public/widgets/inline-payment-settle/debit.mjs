/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget was adapted from the HCTS Project
 * It allows a client to quickly settle a payment
 */

import { ChoosePaymentMethod } from "./select-payment-method.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { SlideContainer } from "/$/system/static/html-hc/widgets/slide-container/container.mjs";
import { EnterPaymentDetails } from './enter-payment-details.mjs'
import { PaymentSuccessUI } from './payment-success.mjs'
import { PaymentFailureUI } from "./payment-failure.mjs";

import { WaitingUI } from "./waiting.mjs";
import { startupLogic } from "./logic/startup.mjs";
import { paymentSelectLogic } from './logic/select-payment-method.mjs'
import { enterPaymentDetailsLogic } from "./logic/enter-payment-details.mjs";
import { waitingUILogic } from "./logic/waiting.mjs";
import configureFailureUI from "./logic/failure.mjs";

import { PaymentCanceledUI } from './payment-canceled.mjs'
import { handle } from "/$/system/static/errors/error.mjs";

export default class InlinePaymentSettle extends Widget {

    constructor() {
        super();

        /** @type {htmlhc.lib.alarm.AlarmObject<import("./types.js").StateStorage>} */
        this.state_data = new AlarmObject({ abortSignal: this.destroySignal })

        this.state_data.payment_data = {}
        this.state_data.data = {}


        super.html = hc.spawn({
            classes: InlinePaymentSettle.classList,
            innerHTML: `
                <div class='container'>
                    <div class='hold-slider'></div>
                </div>
            `
        });

        /** @type {SlideContainer} */ this.slider
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container >.hold-slider',
            property: 'slider',
            transforms: {
                get: html => html?.widgetObject,
                set: v => v.html
            }
        });
        this.slider = new SlideContainer();

        let payment_select = new ChoosePaymentMethod(this.state_data)
        let enter_details_widget = new EnterPaymentDetails(this.state_data)

        const waiting_ui = new WaitingUI(this.state_data);

        const failure_ui = new PaymentFailureUI(this.state_data)

        this.slider.screens.push(
            payment_select.html,
            enter_details_widget.html,
            waiting_ui.html,
            new PaymentSuccessUI(this.state_data).html,
            failure_ui.html,
            new PaymentCanceledUI(this.state_data).html,
        )

        this.state_data.$0.addEventListener('stage-change', async () => {

            this.slider.index =
                this.state_data.stage === 'select-payment-method' ? 0 :
                    this.state_data.stage === 'enter-payment-details' ? 1 :
                        this.state_data.stage === 'waiting' ? 2 :
                            this.state_data.stage === 'success' ? 3 :
                                this.state_data.stage === 'failure' ? 4 :
                                    this.state_data.stage === 'canceled' ? 5 :
                                        0
        });


        const init = async () => {
            //If id is set, call the loading logic
            //The loading logic will get details of the payment and put the widget in a state corresponding to how the payment is

            if (this.state_data.payment_data.id) {
                const id = this.state_data.payment_data.id

                if (id == this.last_id) return;

                try {

                    await startupLogic(this);
                    waitingUILogic(this, waiting_ui)
                    enterPaymentDetailsLogic(this, enter_details_widget)
                    await paymentSelectLogic(this, payment_select)
                    configureFailureUI(this, failure_ui)
                    this.last_id = id
                } catch (e) {

                    if (e.code === 'error.payment.illegal_access_to_record') {
                        alert(`Sign In with the right account to continue`)
                        throw ({ code: 'error.modernuser.authError' })
                    } else {
                        throw e
                    }
                }

            }
        }
        this.state_data.$0.addEventListener('payment_data.id-change', () => {
            //It's important to delay invocation of the init method so that we don't get too many calls to the method
            //Too many calls are seen typically when multiple fields are set at the same time. E.g during Object.assign()
            this.blockWithAction(init)
        })

        init()

    }

    static get classList() {
        return ['hc-cayofedpeople-payment-settle']
    }

}

