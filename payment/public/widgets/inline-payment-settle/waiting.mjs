/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget (waiting) shows spinning balls and a message, while the user completes the payment
 */

import { ActionButton } from "/$/system/static/lib/hc/action-button/button.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";

export class WaitingUI extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-hcts-inline-debit-waiting'],
            innerHTML: `
                <div class='container'>

                    <div class='payment-ui'></div>
                    
                    <div class='spinner'>
                        <img src='${new URL('./res/rotating-balls.gif', import.meta.url).href}'></img>
                    </div>
                    
                    <div class='actions'></div>
                </div>
            `
        });



        /** @type {HTMLElement} */ this.paymentUI
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container >.payment-ui',
            property: 'paymentUI'
        })

        /** @type {[HTMLElement]} */ this.actions
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.actions',
            childType: 'html',
            property: 'actions'
        });

        this.actions = [
            new ActionButton({
                content: "Cancel"
            }).html
        ]

        this.text = `Transaction waiting`

    }

}