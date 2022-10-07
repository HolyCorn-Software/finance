/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget is the footer
 */

import FooterSection from "./section.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class Footer extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-footer'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='logo-section'>
                            <img src='/$/shared/static/logo.png'>
                            <div class='copyright'>&copy; 2022</div>
                        </div>

                        <div class='data-section'>
                        
                        </div>
                        
                    </div>

                    <div class='author-info'>Carefully Engineered by <a href='mailto:holycornsoftware@gmail.com'>HolyCorn Software</a></div>
                    
                </div>
            `
        });

        /** @type {[import("./types.js").FooterSectionData]} */ this.data
        this.pluralWidgetProperty({
            selector: '.hc-donorforms-footer-section',
            parentSelector: '.container >.main >.data-section',
            property: 'data',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FooterSectionData} data 
                 */
                set: (data) => {
                    return new FooterSection(data).html
                },
                get: (html) => {
                    let widget = html?.widgetObject
                    return {
                        title: widget.title,
                        links: widget.links
                    }
                }
            }
        });


        this.data = [


            {
                title: `For Contestants`,
                links: [
                    {
                        label: `Guide`,
                        href: `#`
                    },
                    {
                        label: `Register`,
                        href: `/$/modernuser/static/login/`
                    },

                    {
                        label: `Competitions`,
                        href: `#`
                    }
                ]
            },

            {
                title: `For Moderators`,
                links: [

                    {
                        label: `Register`,
                        href: `/$/modernuser/static/login/`
                    }

                    ,

                    {
                        label: `Dashboard`,
                        href: `/admin/`
                    },


                    {
                        label: `Guide`,
                        href: `#`
                    },
                ]
            },

            {
                title: `General Public`,
                links: [
                    {
                        label: `Voting rules`,
                        href: '#'
                    },
                    {
                        label: `Support Us`,
                        href: '#'
                    },
                    {
                        label: `Contact Us`,
                        href: '#'
                    },
                ]
            }
        ]

    }

    static get classList(){
        return ['hc-donorforms-footer']
    }

}