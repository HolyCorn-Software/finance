/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget allows an authorized personnel to manage the payments of the system
 */

import PaymentDetailsPopup from "./widgets/details/widget.mjs";
import { convertToFrontendFormat } from "./widgets/listings/logic.mjs";
import PaymentListings from "./widgets/listings/widget.mjs";
import { NewPaymentPopup } from "./widgets/new/widget.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class PaymentManager extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-payment-manager'],
            innerHTML: `
                <div class='container'>

                    <div class='top-section'>
                        <div class='title'>Payments</div>
                        <div class='actions'>

                        </div>
                    </div>

                    <div class='listings'>

                    </div>
                
                </div>
            `
        });

        /** @type {string} */ this.title
        this.htmlProperty('.top-section >.title', 'title', 'innerHTML')

        /** @type {PaymentListings} */ this.listings
        this.widgetProperty({
            selector: '.hc-donorforms-admin-payment-listings',
            parentSelector: '.container >.listings',
            childType: 'widget',
            property: 'listings',
            transforms: {
                /**
                 * 
                 * @param {PaymentListings} widget 
                 * @returns 
                 */
                set: (widget) => {
                    //TODO: Proper clean up
                    widget.addEventListener('show-detail-popup', (e) => {
                        this.dispatchEvent(new CustomEvent('show-detail-popup', { detail: e.detail }))
                    })
                    return widget.html
                },
                get: (html) => html?.widgetObject
            }
        });

        this.listings = PaymentListings.testWidget

        /** @type {ActionButton[]} */ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'actions',
            parentSelector: '.top-section >.actions',
            childType: 'widget',
        });

        let createNew = new ActionButton({
            content: 'Create New',
            onclick: () => {
                let popup = new NewPaymentPopup();
                popup.show();
                popup.addEventListener('create', ({ detail: data }) => {
                    this.listings.itemsData.push(
                        convertToFrontendFormat(data)
                    )
                    this.dispatchEvent(new CustomEvent('new', { detail: { data: data } }))
                });

            }
        });

        let deleteMany = new ActionButton({
            content: 'Delete Many'
        })
        this.actions.push(
            createNew,
            deleteMany
        );

        /** @type {function(('show-detail-popup'|'new'), function( CustomEvent<{data:import("./widgets/listings/types.js").FrontendPaymentData, popup:PaymentDetailsPopup}>), AddEventListenerOptions)} */ this.addEventListener


    }

}