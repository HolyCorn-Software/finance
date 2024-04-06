/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This is the Faculty of Finance
 * 
 */


import collections from "./collections.mjs"
import FinancePublicMethods from "./terminals/public.mjs"
import FinanceController from "./controller.mjs"
import FinanceInternalMethods from "./terminals/internal.mjs"


const faculty = FacultyPlatform.get()

export default async function init() {



    console.log(`${faculty.descriptor.label.magenta} is working!`)




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
    await overall_controller.init()

    //Then setup public rpc
    faculty.remote.public = new FinancePublicMethods(overall_controller)

    //Then, let's provide some privileges for other faculties
    faculty.remote.internal = new FinanceInternalMethods(overall_controller)





}