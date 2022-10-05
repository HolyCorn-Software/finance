/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */

import { DetailedFrontendOwnerData } from "../../../../../gateway/public/types.js"

export declare interface FrontendPaymentData {
    owner: DetailedFrontendOwnerData,
    creationDate: string,
    status: PaymentStatus,
    amount: {
        currency: string,
        value: number
    },
    id: string,
    type: PaymentType,
    paidInAmount: Amount,
    paidOutAmount: Amount
}

export type PaymentStatus = ('pending' | 'completed' | 'failed')

export type PaymentType = ('invoice' | 'payout')