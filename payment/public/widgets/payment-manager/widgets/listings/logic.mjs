/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This is part of the payment-manager listings widget
 * It provides useful features such as fetching payment records
 */

import payRpc from "/$/payment/static/lib/rpc/rpc.mjs";



/**
 * @returns {AsyncGenerator<import("faculty/payment/gateway/public/types.js").DetailedFrontendRecord>}
 */
export async function* fetchRecordsAtOnce() {
    //Fetch payment records from the server
    let max_chunk_size = 24; //The maximum number of records to be fetched at once

    let transaction = await payRpc.payment.admin.getAllRecords();

    console.log(`transaction `, transaction)

    for (let index = 0; index < transaction.length;) {
        let stop = Math.min(index + max_chunk_size, transaction.length - 1);

        let packet = await payRpc.payment.admin.fetchArray({
            id: transaction.id,
            start: index,
            stop
        });

        index = stop + 1;

        for (let record of packet) {
            yield record;
        }
    }

}

/**
 * Gets all records and continuously calls the dataCallback each time data is received.
 * 
 * When done fetching all records, the doneCallback is called
 * @param {function([import("faculty/payment/gateway/public/types.js").DetailedFrontendRecord])} dataCallback 
 * @param {function()} doneCallback 
 */
export async function fetchRecords(dataCallback, doneCallback) {
    //Fetch payment records from the server
    let max_chunk_size = 8; //The maximum number of records to be fetched at once

    let transaction = await payRpc.payment.admin.getAllRecords();


    for (let index = 0; index < transaction.length;) {
        let stop = Math.min(index + max_chunk_size, transaction.length - 1);

        let packet = await payRpc.payment.admin.fetchArray({
            id: transaction.id,
            start: index,
            stop
        });

        index = stop + 1;

        dataCallback(packet)
    }

    doneCallback();
}

/**
 * 
 * @param {import("faculty/payment/gateway/public/types.js").DetailedFrontendRecord} record 
 * @returns 
 */
export function convertToFrontendFormat(record) {
    return {
        ...record,
        creationDate: new Date(record.creationTime).toDateString(),
        owner: record.owner,
        status: record.userCanceled ? 'canceled' : record.failed ? 'failed' : (() => {
            let settled = (record.paidInAmount || record.paidOutAmount || 0)
            return settled > 0 && settled >= record.amount.value ? 'complete' : 'pending'
        })(),
        type: typeof record.paidInAmount !== 'undefined' ? 'invoice' : 'payout'
    }
}