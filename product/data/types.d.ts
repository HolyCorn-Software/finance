/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module (types) contains type definitions related to information of products
 */

import { Collection } from "mongodb";


/**
 * @deprecated use {@link finance.product.data.ProductData}
 */
export declare interface ProductData extends finance.product.data.ProductData {
}


/**
 * @deprecated use {@link finance.product.data.ProductDataCollection}
 */
export type ProductDataCollection = finance.product.data.ProductDataCollection



/**
 * @deprecated use {@link finance.product.data.ProductMutableData}
 */
export type ProductMutableData = finance.product.data.ProductMutableData

global {
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.finance.product.create': true
            'permissions.finance.product.modify_any_product': true
        }
    }

    namespace faculty {
        interface FacultyEvents {
            'finance.product-delete': [string]
        }
    }

    namespace finance.product.data {
        interface ProductData {
            id: string
            label: string
            description: string
            time: number
            owners: string[]
            price: finance.Amount
        }


        type ProductDataCollection = Collection<ProductData>

        type ProductMutableData = Omit<ProductData, "id" | "time">


    }
}