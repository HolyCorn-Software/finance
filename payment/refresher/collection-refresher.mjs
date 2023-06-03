/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module is part of the refresher module.
 * This module serves to trigger refreshing of a single collection
 */

import EventEmitter from "node:events"
import PaymentController from "../controller.mjs"




export default class CollectionRefresher {


    /**
     * 
     * @param {object} param0 
     * @param {import("../types.js").PaymentRecordCollection} param0.collection
     * @param {number} param0.delay
     * @param {number} param0.timeout The maximum time to refresh a record
     * @param {number} param0.time_to_live The maximum time a record should spend in the collection
     * @param {PaymentController} param0.payment_controller
     */
    constructor({ collection, delay, time_to_live, payment_controller }) {

        /** @type {import("../types.js").PaymentRecordCollection} */ this.collection
        /** @type {number} */ this.delay
        /** @type {number} */ this.timeout
        /** @type {number} */ this.time_to_live
        /** @type {PaymentController} */ this.payment_controller

        Object.assign(this, arguments[0])

        /** @type {import('./types.js').EventsInterface} */
        this.events = new EventEmitter()

        /**
         * This object keeps track of records that are being processed, thereby preventing an external module from making update at the wrong time; a move that could lead to data loss
         * @type {id: string[]: true}
         */
        this.recordLocks = {}


    }



    /**
     * This method begins a process of constantly refreshing
     * A tick is the process of refreshing all collections
     * This process is endless untill stopped
     */
    async loop() {
        if (this.stopped == true) return;

        setTimeout(() => this.tick().then(() => this.loop()), this.delay)
    }

    /**
     * This method actually refreshes the payments in the collection
     */
    async tick() {
        const cursor = this.collection.find({});

        /** @type {Promise[]} */
        const promises = []


        //As long as there's a next document to be fetched...
        while (await cursor.hasNext()) {

            //Start the process of fetching it and leave the promise in the array of promises
            promises.push(
                new Promise((done, failed) => {
                    cursor.next().then(entry => { //Fetch the next record
                        this.refresh(entry).then(() => done()) //Refresh it, and then indicate that we're done
                        setTimeout(() => failed(`Timeout for ${entry.id} after ${this.delay}ms`), this.delay) //Make sure it doesn't take too long
                    })
                })
            )
        }

        //Since we didn't wait for each of the promises before moving to the next... Let's wait here till all are complete
        await Promise.allSettled(promises)
    }

    /**
     * This method refreshes a single record
     * @param {Finance.Payment.PaymentRecord record 
     * @returns {Promise<void>}
     */
    async refresh(record) {

        //Ensure that some fields are present
        record.lastRefresh ||= {}
        record.lastRefresh.system ||= 0
        record.lastRefresh.client ||= 0



        /**
         * This method checks if a record is un-refreshable for one reason or another.
         * 
         * It returns true if it finds a reason
         * @returns {boolean}
         */
        const terminal_checks = () => {

            //Before refreshing, let's check that the record has not over-stayed it's welcome
            if (Date.now() - record.lastRefresh.system > this.time_to_live) {
                this.events.emit('expire', record.id)
                return true;
            }

            //And that the record is not already complete
            if (record.done) {
                this.events.emit('complete', record.id)
                return true;
            }


            if (typeof record.failed?.reason !== 'undefined' && typeof record.failed?.time !== 'undefined') {
                this.events.emit('fail', record.id)
                return true;
            }

            return false;
        }

        if (terminal_checks()) {
            return;
        }


        //Now if the last time the record was refreshed is not very far from now, or it was created less than a minute ago, just ignore this record
        if ((Date.now() - record.lastRefresh.system < this.delay)) {
            //The reason for ignoring the record if it was created less than a minute ago, is to prevent the situation where the refresher updates a record immediately after
            //A change was already made to it, thereby causing data loss.
            return;
        }


        this.recordLocks[record.id] = true

        try {
            await this.payment_controller.refreshRecord(record, 'system')
            //After refreshing, we perform the terminal checks again
            terminal_checks()
        } catch (e) {
            console.warn(`Could not refresh payment ${record.id} because\n`, e)
        }

        delete this.recordLocks[record.id]

    }


}