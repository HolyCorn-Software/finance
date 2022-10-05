/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This script is on the page that's used to test the payment module
 */

import InlinePaymentSettle from "../widgets/inline-payment-settle/debit.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";


let payment_settle = new InlinePaymentSettle()
document.body.appendChild(
    payment_settle.html
)

payment_settle.state_data.payment_data.id = 'jWD95yEvygaTabnX2h1WYamXVZZDuChXkXSQGmQcFWEL'