/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains type definitions for it's faculty
 */

import { Collection } from "mongodb"


export declare interface PaymentRecord {

    id: string,

    type: PaymentRecordType,
    method: string,
    amount: Amount,
    settled_amount: Amount,

    lastRefresh: {
        client: number,
        system: number
    }


    provider_data: object,

    client_data: {
        input: object,
        output: object
    },

    created: number,
    done: boolean
    settled_time: number,

    owners: [string],

    executed: number,

    failed: {
        time: number,
        reason: string,
        reason_code: string
    },

    refresher_time: number

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
>


export declare interface Amount {
    currency: string,
    value: number
}



export type PaymentRecordType = ("invoice" | "payout")


export declare type PaymentPublicData = Omit<PaymentRecord, "provider_data" | "owners">


export declare interface PaymentWritablePublicData {
    client_data: {
        input: object
    },
    method: string,

}




export declare type PaymentRecordCollection = Collection<PaymentRecord>


export declare interface PaymentProviderCredentials {
    name: string
}

export declare type PaymentProviderCredentialsCollection = Collection<PaymentProviderCredentials>



export declare interface PaymentCollections {
    hot: PaymentRecordCollection,
    middle: PaymentRecordCollection,
    archive: PaymentRecordCollection,
    credentials: Collection<{ name: string }>
}


export declare interface PaymentUserInputValidationResult {
    status: ("valid" | "invalid"),
    message: string
}



export declare interface PaymentMethodInfo<Type> {
    image: {
        data: Type,
        mimeType: string
    },
    code: string,
    label: string,
    /** This is filled by the system automatically */
    provider: string
}



export declare type ProviderPaymentMethodInfo = PaymentMethodInfo<Buffer>


export declare type ProviderPaymentMethodsInfo = [ProviderPaymentMethodInfo]


export declare type ClientPaymentMethodInfo = PaymentMethodInfo<string> & { provider: string }