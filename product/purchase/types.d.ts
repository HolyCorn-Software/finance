/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module contains type definitions related to the purchase of products
 */

import { Collection } from "mongodb"




/** 
 * @deprecated use {@link finance.product.purchase.PendingProductPurchase} instead.
 */
export type PendingProductPurchase = finance.product.purchase.PendingProductPurchase


/** 
 * @deprecated use {@link finance.product.purchase.ProductPurchaseCommon} instead.
 */
export declare interface ProductPurchaseCommon extends finance.product.purchase.ProductPurchaseCommon { }


/** 
 * @deprecated use {@link finance.product.purchase.ProductPurchaseCollection} instead.
 */
export type ProductPurchaseCollection = finance.product.purchase.ProductPurchaseCollection



/** 
 * @deprecated use {@link finance.product.purchase.PurchaseState} instead.
 */
export type PurchaseState = finance.product.purchase.PurchaseState


global {
    namespace faculty {
        interface FacultyEvents {
            'finance.product-purchase.complete': [string]
            'finance.product-delete': [string]
        }
    }
    namespace finance.product.purchase {


        type PendingProductPurchase = ProductPurchaseCommon & {

            time: string
            payment: string
        }


        interface ProductPurchaseCommon {
            userid: string
            product: string
            quantity: number
        }


        type ProductPurchaseCollection = Collection<PendingProductPurchase>

        type PurchaseState = "pending" | "complete" | "failed" | "blank"
    }
}