/*
Copyright 2022 HolyCorn Software
The BGI Swap Project
This is part of the widget that allows remote views to be loaded
This widget (ProvidedFrameErrorUI) allows the developer to display a neat error page with an option to reload
*/

import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export class ProvidedFrameErrorUI extends Widget {

    constructor() {
        super();
        super.html = document.spawn({
            classes: ['hc-bgis-exchange-provided-frame-error-ui'],
            innerHTML: `
                <div class='container'>
                    <div class='content'>
                        <div class='main'></div>
                        <div class='additional'></div>
                    </div>

                    <div class='actions'></div>
                    
                </div>
            `
        });

        /** @type {HTMLElement} */ this.mainContent
        /** @type {HTMLElement} */ this.additionalContent
        const propertyMap = {
            mainContent: '.main',
            additionalContent: '.additional'
        }
        for (let property in propertyMap) {
            const className = propertyMap[property]

            Reflect.defineProperty(this, property, {
                get: () => this.html.$(`.container >.${className}`).children[0],
                set: (v) => {
                    this.html.$(`.container >.${className}`).children[0]?.remove()
                    this.html.$(`.container >.${className}`).appendChild(v)
                },
                configurable: true,
                enumerable: true
            })
        }

        /** @type {string} */ this.resolvedChoice
        let resChoice;

        Reflect.defineProperty(this, 'resolvedChoice', {
            set: (v) => {
                resChoice = v
                this.dispatchEvent(new CustomEvent('change'))
            },
            get: () => resChoice
        })

        /** @type {{name, label}[]} */ this.actions

        this.pluralWidgetProperty({
            selector: `.hc-action-button`,
            parentSelector: '.container >.actions',
            property: 'actions',
            transforms: {
                set: ({ name, label }) => {
                    const button = new ActionButton({
                        content: label,
                        onclick: () => {
                            this.resolvedChoice = name
                        }
                    })
                    button.name = name;
                    return button.html
                },
                get: (button) => {
                    return {
                        label: button.widgetObject.content,
                        name: button.widgetObject.name
                    }
                }
            }
        })


        /** @type {ActionButton[]} */ this.actionButtons
        this.pluralWidgetProperty({
            selector: `.hc-action-button`,
            parentSelector: '.container >.actions',
            property: 'actionButtons'
        })
    }

    static get defaultActions(){
        return [
            {
                name:'reload',
                content:'Reload'
            },
            {
                name:'report',
                content:'Report error'
            }
        ]
    }

}