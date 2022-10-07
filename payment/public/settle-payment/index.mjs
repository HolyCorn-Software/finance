/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This page allows a user to settle a payment
 */
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import InlinePaymentSettle from "../widgets/inline-payment-settle/debit.mjs";
import Navbar from "../widgets/borrowed/navbar/widget.mjs";
import Footer from "../widgets/borrowed/footer/widget.mjs";
import { $ } from "/$/system/static/html-hc/lib/widget/lib.mjs";

hc.importModuleCSS(import.meta.url);

async function start() {

    //Get the payment url 
    let id = new URL(window.location.href).searchParams.get('id')
    if (!id) {
        alert(`You clicked an invalid link. Sorry!`)
    }
    const inline_debit = new InlinePaymentSettle()
    inline_debit.state_data.payment_data.id = id;

    $('.body-content >.payment-box >.main').appendChild(inline_debit.html);
    $('.body-content >.payment-box >.title').innerHTML = `Make Payment`

}

async function buildUI() {
    $('.footer-section').appendChild(
        new Footer().html
    )

    document.body.prepend(new Navbar().html);

}

buildUI().then(() => start());

hc.importModuleCSS(import.meta.url);