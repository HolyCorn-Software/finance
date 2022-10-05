/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module contains type definitions related to the purchase of products
 */

import { Collection } from "mongodb"


export type PendingProductPurchase = ProductPurchaseCommon & {

    time: string,
    payment: string,
}


export declare interface ProductPurchaseCommon {
    userid: string,
    product: string,
    quantity: number,
}

export type ProductPurchaseCollection = Collection<PendingProductPurchase>


export type PurchaseState = "pending" | "complete" | "failed" | "blank"