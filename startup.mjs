/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This is the Faculty of Finance
 * 
 */


import collections from "./collections.mjs"
import FinancePublicMethods from "./terminals/public.mjs"
import FinanceController from "./controller.mjs"
import { FacultyPublicJSONRPC, FacultyPublicRPCServer } from "../../system/comm/rpc/faculty-public-rpc.mjs"
import FinanceInternalMethods from "./terminals/internal.mjs"


const faculty = FacultyPlatform.get()

export default async function init() {



    console.log(`${faculty.descriptor.label.magenta} is working!`)


    const http = await HTTPServer.new()

    faculty.base.shortcutMethods.http.claim(
        {
            remotePath: faculty.standard.httpPath,
            http,
            localPath: '/'
        }
    );

    faculty.base.shortcutMethods.http.websocket.claim(
        {
            http,
            base: {
                point: faculty.standard.publicRPCPoint
            },
            local: {
                path: '/'
            }
        }
    );



    //Initialize the controller


    const overall_controller = new FinanceController({
        collections: {
            payment: {
                archive: collections.archive_payment_records,
                hot: collections.hot_payment_records,
                middle: collections.middle_payment_records,
                credentials: collections.payment_provider_credentials
            },
            product: {
                data: collections.product_data,
                purchase: collections.product_purchase
            }
        }
    });



    //Initialize the logic
    await overall_controller.init(http)

    //Then setup public rpc
    faculty.remote.public = new FinancePublicMethods(overall_controller)

    new FacultyPublicRPCServer(faculty.remote.public, http, {
        path: '/',
        remotePoint: faculty.standard.publicRPCPoint,
        callback: (msg, client) => {
            new FacultyPublicJSONRPC(client)
        }
    })

    //Then, let's provide some privileges for other faculties
    faculty.remote.internal = new FinanceInternalMethods(overall_controller)





    // ----------------- Temporary Code ------------------------

    setTimeout(async () => {

        if (1) return;

        let id = await overall_controller.payment.createRecord(
            {
                // method: 'flutterwave.momo.mtn_momo',
                amount: {
                    value: 1,
                    currency: 'XAF'
                },
                type: 'invoice',
            }
        );

        console.log(`New payment created with id `, id, `\nGo to https://${faculty.server_domains.secure}/$/finance/payment/static/settle-payment/?id=${id}`)


    }, 2000)



}