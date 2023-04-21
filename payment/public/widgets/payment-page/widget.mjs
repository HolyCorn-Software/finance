/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Payment
 * This widget defines the looks of a standard payment page
 * 
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

import Footer from '../borrowed/footer/widget.mjs'
import Navbar from '../borrowed/navbar/widget.mjs'



export default class PaymentPage extends Widget{

    /**
     * 
     * @param {object} param0 
     * @param {HTMLElement[]} param0.content
     */
    constructor({content}={}){
        super();

        this.html = hc.spawn({
            classes:['hc-cayofedpeople-payment-page'],
            innerHTML:`
                <div class='container'>
                    <div class='navbar'></div>
                    <div class='content'></div>
                    <div class='footer'></div>
                </div>
            `
        });

        const classes = {
            'navbar': 'hc-donorforms-navbar',
            'footer': 'hc-donorforms-footer'
        }

        /** @type {Navbar} */ this.navbar
        /** @type {Footer} */ this.footer

        for(let item in classes){
            this.widgetProperty(
                {
                    selector:`.${classes[item]}`,
                    property: item,
                    parentSelector:`.container >.${item}`,
                    childType:'widget',
                }
            )
        }

        this.navbar = new Navbar()
        this.footer = new Footer()

        /** @type {HTMLElement[]} */ this.content
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content',
                property: 'content',
                childType:'html',
            }
        );

        Object.assign(this, arguments[0])
        
    }
    
}