/** 
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget shows the details of payment as well as possible actions
 * 
*/

import { PaymentDetails } from "./content.mjs";
import { HCTSBrandedPopup } from "/$/system/static/lib/hc/branded-popup/popup.js";


export default class PaymentDetailsPopup extends HCTSBrandedPopup {

    constructor({ fields, descriptors } = {}) {
        super();

        this.content = new PaymentDetails(arguments[0]).html

        /** @type {PaymentDetails} */ this.main
        Reflect.defineProperty(this, 'main', {
            get: () => {
                return this.content?.widgetObject
            },
            configurable: true,
            enumerable: true
        })
    }

}