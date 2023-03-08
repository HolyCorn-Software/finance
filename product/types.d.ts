/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This module (types) contains type definitions used by it's parent module (product)
 */

import { ProductDataCollection } from "./data/types";
import { ProductPurchaseCollection } from "./purchase/types";

export declare interface ProductCollections {

    data: ProductDataCollection
    purchase: ProductPurchaseCollection

}