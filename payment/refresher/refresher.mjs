/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module is responsible for keeping transactions up to date. That is, constantly refreshing them.
 * 
 * 
 * The algorithm works thus
 *     The time to live in the hot transactions collection is 15 mins. These are the transactions refreshed every 15 seconds. 
 *     The time to live in the middle transactions collections is 45 mins. These transactions are refreshed every 60 seconds.
 *     The time to live in the archive depends on whether the transaction is completed. If not completed, the transaction lives 7 days. Else, forever
 *     Whenever a transaction in the hot or middle collections is complete, it is moved to the archive collection.
 * 
 * 
 */

import PaymentController from "../controller.mjs";
import CollectionRefresher from "./collection-refresher.mjs";

import EventEmitter from 'node:events'
import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";


const faculty = FacultyPlatform.get()


export default class PaymentRefresher {


    /**
     * 
     * @param {import("../types.js").PaymentCollections} collections 
     * @param {PaymentController} payment_controller
     */
    constructor(collections, payment_controller) {


        this.refreshers = [
            new CollectionRefresher(
                {
                    collection: collections.hot,
                    delay: 1000,
                    time_to_live: 15 * 60 * 1000,
                    timeout: 5000,
                    payment_controller
                }
            ),
            new CollectionRefresher(
                {
                    collection: collections.middle,
                    delay: 5000,
                    time_to_live: 45 * 60 * 1000,
                    timeout: 10_000,
                    payment_controller
                }
            )

        ]

        /** @type {import("./types.js").EventsInterface} */
        this.events = new EventEmitter()

        //Now we want a situation such that if a record with any of these refreshers completes or expires, we move it to the lower collection
        //Records go from hot to middle to archive
        for (let refresher of this.refreshers) {

            const rank = this.refreshers.findIndex(x => x == refresher);

            const collections_ranked = [
                collections.hot,
                collections.middle,
                collections.archive
            ]

            for (let event of ['expire', 'complete', 'fail']) {

                refresher.events.addListener(event, (id) => {
                    move_record_lower(id, rank)

                    this.events.emit(event, id)

                    //Now let other faculties know that a certain payment expired, completed or failed
                    faculty.connectionManager.events.emit(`${faculty.descriptor.name}.payment-${event}`, id); //For example finance.payment-complete, or finance.payment.expire
                })

            }


            const move_record_lower = async (id, rank) => {
                //When a record expires, simply move it from the current collection to the lower one
                const record = await collections_ranked[rank].findOne({ id })
                await collections_ranked[rank + 1].updateOne({ id }, { $set: record }, { upsert: true })
                await collections_ranked[rank].deleteOne({ id })

            }


            //And failed transactions should go straight to the archives
            refresher.events.addListener('fail', async (id) => {
                console.log(`Payment ${id} failed, and will be moved to the archives!`)
                const record = await collections_ranked[rank].findOne({ id })
                await collections_ranked.at(-1).updateOne({ id }, { $set: record }, { upsert: true })
                await collections_ranked[rank].deleteOne({ id })
            })
        }


    }

    /**
     * This method is used to check if a record is currently being used by the refresher
     * @param {string} id 
     * @returns {boolean}
     */
    recordIsLocked(id) {
        return this.refreshers.some(x => x.recordLocks[id] ?? false)
    }

    /**
     * This method starts the infinite loop
     */
    async start_loop() {
        for (let refresher of this.refreshers) {
            refresher.loop()
        }
    }

}