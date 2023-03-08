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
    price: Finance.Amount
}


export type ProductDataCollection = Collection<ProductData>


export type ProductMutableData = Omit<ProductData, "id" | "time">