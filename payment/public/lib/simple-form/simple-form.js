/*
Copyright 2022 HolyCorn Software
The BGI Swap Project
The Faculty of Payments
This widget allows other providers to create a simple payment UI
*/


import { PaymentProvidedUI } from "../provided-ui/model.js";
import { handle } from "/$/system/static/errors/error.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import MultiFlexForm  from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";

const paymentMethods = await hcRpc.finance.payment.getPaymentMethods()


/**
 * This class allows providers to easily setup UIs for collecting user payout information
 * 
 * This class is highly customizable, but we don't advice that you remove the default action (done) button
 * More work should be done via the simpledstui.form attribute, where callers can decide on the structure of the UI, as well as read values
 */
export class SimplePaymentForm extends PaymentProvidedUI {

    constructor({ title, image, caption } = {}) {
        super();

        this.content = document.spawn({
            classes: ['hc-bgis-simple-payment-form'],
            innerHTML: `
                <div class='container'>
                    <div class='top'>
                        <div class='logo'><img src='/$/payment/paymentMethods/images/paypal'></div>
                        <div class='title'>Receive to PayPal</div>
                    </div>
                    <div class='details'>
                        <div class='caption'></div>
                        <div class='details-main'>
                            <div class='fields'></div>
                            <div class='form'></div>
                            <div class='actions'></div>
                        </div>
                    </div>
                </div>
            `
        })

        /** @type {string} */ this.image
        this.htmlProperty('.logo >img', 'image', 'attribute', undefined, 'src')

        /** @type {string} */ this.title
        this.htmlProperty('.top >.title', 'title', 'innerHTML')

        /** @type {string} */ this.caption
        this.htmlProperty('.details >.caption', 'caption', 'innerHTML')

        /** @type {{name: string, label:string}[]} */ this.actions
        /** @type {(ActionButton & {name:string})[]} */ this.actionButtons

        const defineTheActionProperty = (property) => {

            this.pluralWidgetProperty({
                selector: '.hc-action-button',
                property,
                parentSelector: '.container .details .details-main >.actions',
                transforms: property === 'actions' ? {
                    set: ({ name, label, ...rest }) => new ActionButton({
                        content: label, name, ...rest
                    }).html,
                    get: (buttonHTML) => {
                        let { name, label } = buttonHTML.widgetObject
                        return { name, label }
                    }
                } : {
                    set: (button) => button.html,
                    get: (html) => html.widgetObject
                }
            })
        }

        defineTheActionProperty('actions');
        defineTheActionProperty('actionButtons');

        /** Add the default action */
        this.actions.push({
            name: 'done',
            label: 'Done'
        });


        this.widgetProperty({
            selector: '.hc-multi-flex-form',
            property: 'form',
            parentSelector: '.details-main >.form',
            childType: 'widget',
            /**
             * 
             * @param {MultiFlexForm} form 
             */
            onchange: (form) => {

                form.addEventListener('change', async () => {
                    const validateFxn = typeof this.autoValidateFxn === 'function' ? this.autoValidateFxn : defaultValidFxn;
                    try {
                        let val = await validateFxn()
                        const doneButton = this.actionButtons.filter(x => x.name === 'done')[0]
                        if (doneButton) {
                            doneButton.state = val ? '' : 'disabled';
                        }
                    } catch (e) {
                        handle(e);
                    }
                })
            }
        })
        this.form = new MultiFlexForm();

        /** @type {{paymentMethod:string, type:('src'|'dst')} & AlarmObject<{paymentMethod:string}>} */ this.data


        // Change the image according to the dst of the swap

        this.data.$0.addEventListener('change', () => {
            this.image = `/$/payment/paymentMethods/images/${this.data.paymentMethod}`
            this.caption = `Enter your details for how you'll ${this.data.type === 'src' ? ' be charged' : ' receive money'}`
            this.title = `${this.data.type === 'src' ? 'Pay via' : 'Receive to'} ${paymentMethods.filter(x => x.code === this.data.paymentMethod)[0].label}`
        })

        /** @type {function(Object<string, string>): Promise<boolean>} If this is set, the user's ability to click on the 'done' button will depend on whether this function returns true (Promise<boolean>). Note that is function is called with user input data*/ this.autoValidateFxn

        const defaultValidFxn = async () => true;

        setTimeout(() => {
            this.actionButtons.filter(x => x.name === 'done')[0].state = 'disabled'
        }, 100)




        Object.assign(this, arguments[0])
    }

}