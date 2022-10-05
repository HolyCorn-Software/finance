/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget is part of the payment-manager widget
 * This widget lists payments providing options for viewing details of a payment
 */

import { PaymentListing } from "./entry.mjs";
import { convertToFrontendFormat, fetchRecords } from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Checkbox } from "/$/system/static/lib/hc/checkbox/checkbox.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export default class PaymentListings extends Widget {


    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-admin-payment-listings'],
            innerHTML: `
                <table class='container'>
                    <thead>
                        <tr class='headers'>
                            <td class='checkbox'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                            <td class='header'></td>
                        </tr>
                    </thead>

                    <tbody>
                    </tbody>
                    
                </table>
            `
        });


        /** @type {function(('show-detail-popup'), function( CustomEvent<{data: import("./types.js").FrontendPaymentData, popup:PaymentDetailsPopup}>), AddEventListenerOptions)} */ this.addEventListener

        /** @type {[PaymentListing]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-donorforms-admin-payment-listing',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemWidgets',
            immediate: false,
        });

        /** @type {[import("./types.js").FrontendPaymentData]} */ this.itemsData

        this.pluralWidgetProperty({
            selector: '.hc-donorforms-admin-payment-listing',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemsData',
            immediate: false,
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FrontendPaymentData} data 
                 */
                set: (data) => {
                    let widget = new PaymentListing(data);

                    //TODO: Proper clean up
                    widget.addEventListener('show-detail-popup', (e) => {
                        this.dispatchEvent(
                            new CustomEvent('show-detail-popup', { detail: { data: data, popup: e.detail } })
                        )
                    })
                    return widget.html
                },
                get: (html) => {
                    return html?.widgetObject.getData()
                }
            }
        });

        /** @type {Checkbox} */ this.mainCheckbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'mainCheckbox',
            parentSelector: '.container .headers .checkbox'
        });

        this.mainCheckbox = new Checkbox()


        /** @type {[string]} */ this.headers
        this.pluralWidgetProperty({
            selector: '.header',
            parentSelector: '.headers ',
            childType: 'html',
            property: 'headers',
            transforms: {
                set: (string) => {
                    return hc.spawn({
                        tag: 'td',
                        innerHTML: string,
                        classes: ['header']
                    })
                },
                get: (html) => html.innerHTML
            }
        });

        this.headers = [
            'User',
            'Amount',
            'Date',
            'Status'
        ];


        this.waitTillDOMAttached(() => {
            this.populateUI()
        })


    }

    async populateUI() {

        this.loadBlock();

        try {


            this.itemsData = [];

            fetchRecords((data) => {

                for (let record of data) {
                    this.itemsData.push(convertToFrontendFormat(record))
                }
            }, () => {
                this.loadUnblock()
            })

        } catch (e) {
            setTimeout(() => this.loadUnblock(), 1000)
            handle(e)
        }



    }

    static get testWidget() {
        let widget = new this()

        return widget;
    }


}
