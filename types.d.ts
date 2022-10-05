/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains general type definitions for the faculty
 */

import { PaymentCollections } from "./payment/types";
import { ProductCollections } from "./product/types";
import FinancePublicMethods from "./terminals/public.mjs";


export declare interface FinanceCollections {
    payment: PaymentCollections,
    product: ProductCollections
}

export type FinancePublicMethods = FinancePublicMethods