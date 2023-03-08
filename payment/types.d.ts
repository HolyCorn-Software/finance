/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains type definitions for it's faculty
 */

import { Collection } from "mongodb"
import FinanceInternalMethods from "../terminals/internal.mjs"
import { PaymentType } from "./public/widgets/payment-manager/widgets/listings/types"


export declare interface PaymentRecord<ProviderData = {}, ClientInputData = {}, ClientOutputData = {}> {

    id: string
    type: PaymentRecordType
    method: string
    method_whitelist: string[]
    amount: Finance.Amount
    settled_amount: Finance.Amount

    lastRefresh: {
        client: number
        system: number
    }


    provider_data: ProviderData

    client_data: {
        input: ClientInputData
        output: {
            message: {
                html: string
                text: string
            }
        } & ClientOutputData
    }

    created: number
    done: boolean
    settled_time: number

    owners: string[]

    executed: number

    failed: {
        time: number
        reason: string
        reason_code: string
        fatal: boolean
    }

    refresher_time: number

    /** Additional data that might be useful to some payment methods; especially in describing what is being paid for */
    meta: {
        product: {
            name: string
            description: string
            category: ("electronics" | "content" | "homeTools" | "fashion" | "child" | "automotive" | "credit" | "entertainment" | "jewelry" | "homeService" | "beauty" | "sports" | "foodAndDrugs" | "pet" | "science" | "other")
            type: "physical" | "virtual"
        }
        recipient_name: string
        reason: string
        note: string
    }

    archived: boolean

}


export declare type PaymentRecordMinimal<ProviderData = {}> = Pick<PaymentRecord<ProviderData, {}, {}>,
    "id"
    | "type"
    | "method"
    | "provider_data"
    | "created"
    | "settled_time"
    | "amount"
    | "settled_amount"
>


export declare type PaymentRecordInit<ProviderData = {}, ClientInputData = {}, ClientOutputData = {}> = Pick<PaymentRecord<ProviderData, ClientInputData, ClientOutputData>,
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


export declare type PaymentPublicData<ClientInputData, ClientOutputData> = Omit<PaymentRecord<{}, sClientInputData, ClientOutputData>, "provider_data" | "owners">


export declare type PaymentWritablePublicData<ClientInputData> = Pick<PaymentRecord<{}, ClientInputData, {}>, "client_data" | "method">




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
    status: ("valid" | "invalid")
    message: string
}

export declare interface PaymentUserInputValidationData<ClientInputData = {}> {
    data: ClientInputData
    intent: PaymentType
    method: string
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


declare global {


    /**
     * @deprecated Use Finance instead of finance or global['finance']
     */
    type finance = {

        /** @deprecated use Finance.Payment.PaymentRecord instead of global['finance']['PaymentRecord'] */
        PaymentRecord: PaymentRecord
        /** @deprecated use Finance.Payment.PaymentRecordMinimal instead of global['finance']['PaymentRecordMinimal'] */
        PaymentRecordMinimal: PaymentRecordMinimal
        /** @deprecated use Finance.Payment.PaymentRecordInit instead of global['finance']['PaymentRecordInit'] */
        PaymentRecordInit: PaymentRecordInit
        /** @deprecated use Finance.Payment.PaymentUserInputValidationResult instead of global['finance']['PaymentUserInputValidationResult'] */
        PaymentUserInputValidationResult: PaymentUserInputValidationResult
        /** @deprecated use Finance.Payment.PaymentMethodsInfo instead of global['finance']['PaymentMethodsInfo'] */
        PaymentMethodsInfo: PaymentMethodsInfo
        /** @deprecated use Finance.Payment.PaymentUserInputValidationData instead of global['finance']['PaymentUserInputValidationData'] */
        PaymentUserInputValidationData: PaymentUserInputValidationData
        /** @deprecated use Finance.Payment.PaymentRecordType instead of global['finance']['PaymentRecordType'] */
        PaymentRecordType: PaymentRecordType
        /** @deprecated use Finance.Amount */
        Amount: Amount
        /** @deprecated use Finance.PaymentMethodInfo */
        ClientPaymentMethodInfo: ClientPaymentMethodInfo
        /** @deprecated use Finance.InternalMethods */
        remote: {
            internal: FinanceInternalMethods
        }
    }


}