/**
 * Copyright 2024 HolyCorn Software
 * The Faculty of Finance
 * This module contains type definitions meant for providing account functionality
 */



import { Collection } from "mongodb"

global {
    namespace finance.accounts {
        namespace info {
            interface AccountInfo {
                userid: string
                balance: number
                currency: string
                created: number
            }

            type AccountInfoCollection = Collection<AccountInfo>

            /**
             * This structure represents a debit transaction that has not yet been fully done on the other side.
             * 
             * It allows for the possibility of a chargeback (returning the user's funds), in case the external transaction was not successful.
             */

            interface PendingTransaction {
                id: string
                userid: string
                type: 'debit' | 'credit'
                amount: finance.Amount
                created: number
                expires: number
                payment: string
            }

            type PendingTransactionsCollection = Collection<PendingTransaction>



        }

    }
}