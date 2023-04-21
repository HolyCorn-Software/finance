/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget allows the admin to see details of a payment and to send an email for the payment
 */

import PaymentField from "./field.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import GrowRetry from "/$/system/static/html-hc/lib/retry/retry.mjs";


export class PaymentDetails extends Widget {

    constructor({ descriptors, values } = {}) {
        super();

        super.html = hc.spawn({
            classes: ['hc-donorforms-payment-manager-details'],
            innerHTML: `
                <div class='container'>
                    <table class='data'>
                        <!-- The Information about the payment goes here -->
                        <tbody>
                            
                        </tbody>
                    </table>

                    <div class='actions'>
                        <!-- The set of actions that can be performed stay here. E.g Send Receipt Emails -->
                    </div>
                    
                </div>
            `
        });

        /** @type {import("./types.js").FieldDescriptor[]} */ this.descriptors
        this.pluralWidgetProperty({
            selector: 'tr.hc-donorforms-payment-manager-field',
            parentSelector: '.container >.data >tbody',
            property: 'descriptors',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FieldDescriptor} data 
                 */
                set: (data) => {
                    return new PaymentField(data).html
                },
                get: (html) => {
                    /** @type {PaymentField} */
                    let widget = html?.widgetObject

                    return { label: widget?.label, name: widget?.name }
                }
            }
        });

        /** @type {{[key:string]: string}} */ this.values
        Reflect.defineProperty(this, 'values', {
            get: () => {
                return new FieldValuesNavigator(this)
            },
            set: (d) => {
                Object.assign(this.values, d);
            },
            configurable: true,
            enumerable: true
        });


        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.actions',
            property: 'actions'
        });


        this.actions = [
            new ActionButton({
                content: `Delete Payment`
            }).html
        ]


        this.descriptors = [
            {
                label: 'Customer',
                name: 'customer'
            },
            {
                label: 'Amount',
                name: 'amount'
            },

            {
                label: 'Payment Created',
                name: 'creationDate'
            },

            {
                label: 'Payment due',
                name: 'dueDate'
            },

            {
                label: 'Date of Payment',
                name: 'settledDate'
            },

            {
                label: 'Payment Method',
                name: 'paymentMethod'
            },


            {
                label: 'Transaction Id',
                name: 'id'
            },

            {
                label: 'Status',
                name: 'status'
            },

        ];

        this.values = {
            customer: 'someone@gmail.com',

            creationDate: '24/03/2022',

            dueDate: '24/03/2022',

            amount: '24/03/2022',

            paymentMethod: 'Mobile Money',

            amount: '$15000',

            transactionId: 'fNXtmfa2vvofZoRwxGSpAy',

            status: 'Pending',
        }

        Object.assign(this, arguments[0]);
    }

}





class FieldValuesNavigator {

    /**
     * 
     * @param {PaymentDetails} widget 
     * @returns 
     */
    constructor(widget) {


        //
        const fetchFieldNow = (name) => widget.html.$(`.data >tbody >.hc-donorforms-payment-manager-field[name="${name}"]`)?.widgetObject

        //This function keeps looking for the field till it's found
        const fetchField = (name) => new GrowRetry(() => {
            const field = fetchFieldNow(name);
            if (!field) {
                throw new Error(`No field with name ${name}`);
            }
            return field
        }, {
            maxTime: 500, //Doesn't matter much
            maxTries: 4, //Try looking for the field not more than four(4) times
            factor: 2, //Each time it fails to find a field, wait for twice as much time as the previous time spent waiting.
            startTime: 100 //The time to wait after the first try
        }).execute()


        return new Proxy({}, {
            get: (target, property, receiver) => {
                if (typeof property !== 'string') {
                    return;
                }
                return fetchFieldNow(property)?.content
            },
            set: (target, property, value, receiver) => {
                if (typeof property !== 'string') {
                    throw new Error(`Cannot set non-string property.`)
                };

                fetchField(property).then(field => {
                    field.content = value
                })

                return true
            }
        })
    }
}