/** 
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget represents a single field in the payment-manager details widget
 * 
*/

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class PaymentField extends Widget{

    /**
     * 
     * @param {import("./types.js").FieldDescriptor} data 
     */
    constructor(data){
        super();

        this.html = hc.spawn({
            tag:'tr',
            classes:['hc-donorforms-payment-manager-field'],
            innerHTML:`
                <td class='label'><!-- The label of the field goes here --></td>
                <td class='content'><!-- The content of the field goes here --></td>
            `
        });

        /** @type {string} */ this.label
        /** @type {string} */ this.content
        for(let field of ['label', 'content']){
            this.htmlProperty(`td.${field}`, field, 'innerHTML')
        }


        /** @type {string} */ this.name
        this.htmlProperty(undefined, 'name', 'attribute', undefined, 'name')


        Object.assign(this, data);


    }
    
}