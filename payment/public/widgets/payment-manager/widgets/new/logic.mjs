/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module is part of the NewPaymentPopup widget and contains the logic necessary for actually creating a new payment
 */

import payRpc from "/$/payment/static/lib/rpc/rpc.mjs";


/**
 * Creates a new payment
 * @param {object} param0 
 * @param {string} param0.userid
 * @param {import("faculty/payment/types.js").Amount} param0.amount
 * @returns {Promise<void>}
 */
export async function createNewPayment({userid, amount, type}){

    return await payRpc.payment.admin.createPayment({
        userid,
        amount,
        type
    })
}