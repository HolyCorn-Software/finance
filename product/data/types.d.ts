/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module (types) contains type definitions related to information of products
 */

import { Collection } from "mongodb";


export declare interface ProductData {
    id: string
    label: string
    description: string
    time: number
    owners: string[]
    price: finance.Amount
}


export type ProductDataCollection = Collection<ProductData>


export type ProductMutableData = Omit<ProductData, "id" | "time">

global {
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.finance.product.create': true
            'permissions.finance.product.modify_any_product': true
        }
    }
}