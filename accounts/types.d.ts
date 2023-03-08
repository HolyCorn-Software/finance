/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The accounts module
 * This module (types) contains type defintions used by the accounts module
 */

import { Collection } from "mongodb";


export declare interface AccountEntry {

    id: string,
    label: string,
    currency: string,
    time: number,
    priv_key: string, //This is because some accounts are managed by the system.
    pub_key: string,

}


export declare type AccountsCollection = Collection<AccountEntry>



export declare namespace AccountTransactionData {

    export declare interface Generic {
        base_amount: number,
    }


    export declare type External = Generic & {

        type: ("create" | "destroy"),

        transaction: Finance.Payment.PaymentRecordMinimalnimal,

    }

    export declare type Internal = Generic & {
        type: ("add" | "remove"),

        internal_data: {
            account: string,
            time: number,
            amount: Finance.Amount
        }
    }
}