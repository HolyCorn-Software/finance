/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (enter-payment-details) allows for the possibility of collecting user input to be used debit the user
 */

import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { MultiFlexForm } from "/$/system/static/html-hc/widgets/multi-flex-form/index.mjs";

export class EnterPaymentDetails extends Widget {

    /**
     * 
     * @param {import("./types.js").StateStorageObject} state_data 
     */
    constructor(state_data) {
        super();

        super.html = hc.spawn({
            classes: ['hcts-inline-payment-settle-enter-payment-details', 'hcts-inline-payment-settle-screen'],
            innerHTML: `
                <div class='container'>
                    <div class='multi-flex-form'></div>
                    <div class='actions'></div>
                </div>
            `
        });

        /** @type {MultiFlexForm} */ this.formWidget
        this.widgetProperty({
            selector: '.hc-multi-flex-form',
            parentSelector: `.container >.multi-flex-form`,
            property: 'formWidget',
            transforms: {
                get: html => html?.widgetObject,
                set: x => x.html
            }
        });

        this.formWidget = new MultiFlexForm()

        /** @type {[HTMLElement]} */ this.actions
        this.pluralWidgetProperty({
            selector:'*',
            parentSelector:'.container >.actions',
            childType:'html',
            property:'actions'
        });

        this.actions.push(
            new ActionButton({
                content:'Continue'
            }).html
        )

        /** @type {import('./types.js').StateStorageObject} */ this.state_data = state_data

        this.state_data.$0.addEventListener('data.form-change', () => {
            this.render()
        })

        this.render();
    }

    render() {


        if (Array.isArray(this.state_data?.data?.form)) {
            this.formWidget.quickStructure = this.state_data.data.form
        }

    }

}