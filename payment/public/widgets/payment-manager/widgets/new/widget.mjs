/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget is a popup that helps the admin create a new payment
 */

import { createNewPayment } from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export class NewPaymentPopup extends PopupForm {

    constructor() {
        super({
            form: [
                [
                    {
                        label: 'Customer',
                        name: 'owner',
                        type: 'customWidget',
                        customWidgetUrl: '/$/modernuser/static/widgets/user-n-role-input/widget.mjs',
                        mode: 'user'
                    }
                ],
                [
                    {
                        label: 'Amount',
                        name: 'amount',
                        type: 'number'
                    }
                ]
            ],
            caption: `Enter Payment details`,
            title: `Create Payment`,
        });

        this.addEventListener('complete', () => {
            this.submit()
        });


        /** @type {function(('create'), function({detail: object}&CustomEvent), AddEventListenerOptions)} */ this.addEventListener

    }

    async submit() {
        if (this[submit_lock_symbol]) {
            return;
        }

        this[submit_lock_symbol] = true;
        this.positiveButton.state = 'waiting';

        try {
            let data = await createNewPayment({
                userid: this.formWidget.value.owner,
                amount: {
                    value: new Number(this.formWidget.value.amount).valueOf(),
                    currency: 'USD' //This is hardcoded
                },
                type: 'invoice' //Just for now!
            });

            this.dispatchEvent( new CustomEvent('create', { detail: data }))
            this.positiveButton.state = 'success'

            setTimeout(()=> this.hide(), 700);

        } catch (e) {
            console.log(e)
            handle(e)
            this.positiveButton.state = 'initial'
            this.positiveButton.notification.warn('Error!', 5000)
        }
        this[submit_lock_symbol] = false;

    }

}


const submit_lock_symbol = Symbol(`NewPaymentPopup.prototype.submit_lock`)