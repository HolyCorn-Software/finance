/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains type definitions for it's faculty
 */

import { Collection } from "mongodb"
import FinanceInternalMethods from "../terminals/internal.mjs"
import { PaymentType } from "./public/widgets/payment-manager/widgets/listings/types"


export declare interface PaymentRecord {

    id: string

    type: PaymentRecordType,
    method: string
    method_whitelist: string[]
    amount: Amount,
    settled_amount: Amount

    lastRefresh: {
        client: number
        system: number
    }


    provider_data: object

    client_data: {
        input: object
        output: {
            message: {
                html: string
                text: string
            }
        }
    },

    created: number
    done: boolean
    settled_time: number

    owners: [string]

    executed: number

    failed: {
        time: number
        reason: string
        reason_code: string
        fatal: boolean
    },

    refresher_time: number

    /** Additional data that might be useful to some payment methods; especially in describing what is being paid for */
    meta: {
        product: {
            name: string
            description: string
            category: ("electronics" | "content" | "homeTools" | "fashion" | "child" | "automotive" | "credit" | "entertainment" | "jewelry" | "homeService" | "beauty" | "sports" | "foodAndDrugs" | "pet" | "science" | "other")
            type: "physical" | "virtual"
        }
    }

    archived: boolean

}


export declare type PaymentRecordMinimal = Pick<PaymentRecord,
    "id"
    | "type"
    | "method"
    | "provider_data"
    | "created"
    | "settled_time"
    | "amount"
    | "settled_amount"
>


export declare type PaymentRecordInit = Pick<PaymentRecord,
    "amount"
    | "type"
    | "method"
    | "owners"
    | "meta"
    | "method_whitelist"
>


export declare interface Amount {
    currency: string
    value: number
}



export type PaymentRecordType = ("invoice" | "payout")


export declare type PaymentPublicData = Omit<PaymentRecord, "provider_data" | "owners">


export declare interface PaymentWritablePublicData {
    client_data: {
        input: object
    },
    method: string

}




export declare type PaymentRecordCollection = Collection<PaymentRecord>


export declare interface PaymentProviderCredentials {
    name: string
}

export declare type PaymentProviderCredentialsCollection = Collection<PaymentProviderCredentials>



export declare interface PaymentCollections {
    hot: PaymentRecordCollection
    middle: PaymentRecordCollection
    archive: PaymentRecordCollection
    credentials: Collection<{ name: string }>
}


export declare interface PaymentUserInputValidationResult {
    status: ("valid" | "invalid"),
    message: string
}

export declare interface PaymentUserInputValidationData {
    data: object
    intent: PaymentType
}



export declare interface PaymentMethodInfo {
    /** A URL link to the image */
    image: string
    code: string
    label: string
    /** This is filled by the system automatically */
    plugin: string
}




export declare type PaymentMethodsInfo = PaymentMethodInfo[]


export declare type ClientPaymentMethodInfo = PaymentMethodInfo


interface _PaymentRecord extends PaymentRecord { }

declare global {


    type finance = {

        PaymentRecord: PaymentRecord
        PaymentRecordMinimal: PaymentRecordMinimal
        PaymentRecordInit: PaymentRecordInit
        PaymentUserInputValidationResult: PaymentUserInputValidationResult
        PaymentMethodsInfo: PaymentMethodsInfo
        PaymentUserInputValidationData: PaymentUserInputValidationData
        PaymentRecordType: PaymentRecordType
        Amount: Amount
        ClientPaymentMethodInfo: ClientPaymentMethodInfo
        remote: {
            internal: FinanceInternalMethods
        }
    }


}