/*
Copyright 2022 HolyCorn Software
The BGI Swap Project.
This widget allows the client UI to display UIs that come from providers, which we refer to as "provided" UIs
This widget focuses on UIs provided by the SwapD faculty.
*/

import { CalculatedError } from "/$/system/static/errors/error.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { PaymentProvidedUI } from "./model.js";

/** @type {typeof import('system/public/lib/hc/lib/util/path.js')} */
const pathUtils = (await import('/$/system/static/html-hc/lib/path/path.mjs'))


/**
 * @template ContentWidgetType
 */
export class PaymentProvidedUIFrame extends Widget {


    constructor() {

        super();

        super.html = document.spawn({
            classes: ['hc-bgis-exchange-provided-ui-frame'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <!-- The provided UI displays here -->
                    </div>
                </div>
            `
        });

        /** @type {string} The path of the UI to be displayed. This value is typically something like coinbase/payment-form or flutterwave.momo/show-payment-data*/ this.path

        /** @type {HTMLElement & {widgetObject: PaymentProvidedUI}} */ this.__content_html__
        this.widgetProperty({
            selector: '.hc-bgis-payment-provided-ui',
            property: '__content_html__',
            parentSelector: '.container >.main',
            transforms: {
                set: x => x,
                get: x => x
            }
        });

        /** @type {ContentWidgetType} */ this.content
        Reflect.defineProperty(this, 'content', {
            get:()=>this.__content_html__.widgetObject
        })



    }

    /**
     * This loads the UI.
     * Make sure that this.path is set.
     * 
     * For example, this.path could be /paypal/show-payment-data/
     */
    async load() {

        this.loadBlock();

        try {


            if (typeof this.path === 'undefined') {
                throw new Error(`Cannot load the UI because the UI path is missing`);
            }

            //Now fetch the UI module
            /** @type  {typeof PaymentProvidedUI}*/
            let cleanedPath = pathUtils.removeLastSlash(pathUtils.makeAbsolute(pathUtils.cleanPath(this.path)))
            const Module = (await import(`/$/finance/$plugins${cleanedPath}`)).default


            //Now check if the module follows the structure
            if (!(Module.prototype instanceof PaymentProvidedUI)) {
                console.log(`Could not load `, Module)
                throw new CalculatedError({
                    message: `A technical error occurred.\nA page that was to be shown to you doesn't conform to some inheritance requirements. This is not your fault dear user, we are working on it. More info (${typeof Module === 'undefined' ? 'No default export' : 'Default export doesn\'t follow inheritance constraints.'})`,
                    code: 'error.system.unplanned'
                })

            }

            let instance = new Module()
            this.__content_html__ = instance.html

            instance.html.dispatchEvent(new CustomEvent('start'));

            this.loadUnblock();

        } catch (e) {
            this.loadUnblock()
            throw e
        }


    }
}