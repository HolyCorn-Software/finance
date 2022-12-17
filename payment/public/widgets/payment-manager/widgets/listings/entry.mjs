/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget represents a single entry in the payment listings widget
 */

import PaymentDetailsPopup from "../details/widget.mjs";
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export class PaymentListing extends Widget {

    /**
     * @param {import("./types.js").FrontendPaymentData} data
     */
    constructor(data) {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-admin-payment-listing'],
            tag: 'tr',
            innerHTML: `
                <td class='checkbox'></td>
                <td class='field owner_label'></td>
                <td class='field __amount__'></td>
                <td class='field creationDate'></td>
                <td class='field status'></td>
            `
        });


        /** @type {string} */ this.__amount__
        /** @type {string} */ this.creationDate
        /** @type {string} */ this.owner_label
        for (let _property of ['owner_label', '__amount__', 'creationDate']) {
            this.htmlProperty(`.field.${_property}`, _property, 'innerHTML')
        }
        /** @type {import("faculty/payment/gateway/public/types.js").DetailedFrontendOwnerData} */ this.owner
        Reflect.defineProperty(this, 'owner', {
            set: (v) => {
                this.__owner__ = v
                this.owner_label = v.label || v.id;
            },
            get: () => {
                return this.__owner__
            }
        })

        /** @type {finance['Amount']} */ this.amount
        Reflect.defineProperty(this, 'amount', {
            /**
             * 
             * @param {finance['Amount']} value 
             */
            set: (value) => {
                this.__amount__ = `${value.value} ${value.currency}`
            },
            get: () => {
                let [, value, currency] = (/^([0-9]+) (.+)$/.exec(this.__amount__)) || []
                return {
                    value,
                    currency
                }
            }
        })



        /** @type {('pending'|'completed'|'failed')} */ this.status
        this.htmlProperty(`td.field.status`, 'status', 'attribute', undefined, 'status-value')

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'checkbox',
            parentSelector: '.checkbox',
            immediate: false
        });


        this.checkbox = new Checkbox()


        this.html.addEventListener('click', (event) => {
            if (event.target === this.checkbox.html || this.checkbox.html.contains(event.target)) {
                return;
            }
            let popup = new PaymentDetailsPopup({
                values: {


                    customer: this.owner.id,

                    creationDate: this.creationDate,

                    settledDate: 'Not available',

                    dueDate: 'Not available',

                    amount: `${this.amount.value} ${this.amount.currency}`,

                    paymentMethod: 'Not available',

                    id: this.id,

                    status: this.status,
                },

            })
            popup.show()

            this.dispatchEvent(new CustomEvent('show-detail-popup', {detail: popup}))
        })


        Object.assign(this, data);

        /** @type {function(('show-detail-popup'), function( CustomEvent<PaymentDetailsPopup>), AddEventListenerOptions)} */ this.addEventListener


    }

    getData() {
        return {
            owner: this.owner,
            amount: this.amount,
            creationDate: this.creationDate,
            status: this.status
        }
    }

    static get testWidget() {
        let widget = new this();
        let testdata = {
            owner: 'someone@gmail.com',
            amount: '$49000',
            status: ['pending', 'complete', 'failed'][Math.floor((Math.random() * 10) % 3)],
            date: '25/09/22'
        }

        Object.assign(widget, testdata)
        return widget;
    }

}