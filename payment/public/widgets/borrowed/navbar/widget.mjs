/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * The Navbar widget
 */


import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";




export default class Navbar extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-navbar'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='logo'>
                            <img src='/$/shared/static/logo.png'>
                        </div>
                        <div class='center'>
                            <div class='links'></div>
                        </div>
                    </div>
                </div>
            `
        });


        /** @type {[{label:string, href:string}]} */ this.links
        this.pluralWidgetProperty({
            selector: 'a',
            property: 'links',
            parentSelector: '.container >.main >.center >.links',
            transforms: {
                set: ({ label, href } = {}) => {

                    return hc.spawn({
                        tag: 'a',
                        innerHTML: label,
                        attributes: {
                            href
                        }
                    })
                },
                get: (a) => {
                    return {
                        label: a.innerHTML,
                        href: a.getAttribute('href')
                    }
                }
            }
        });

        this.links.push(
            {
                label: 'Home',
                href: '/'
            },
            {
                label: 'Compete',
                href: '#'
            },
            {
                label: 'Vote',
                href: '#'
            }
        )
    }

    static get classList() {
        return ['hc-donorforms-navbar']
    }

}

