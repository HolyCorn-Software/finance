/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains general type definitions for the faculty
 */

import { PluginNamespaceMap } from "system/lib/libFaculty/plugins/types";
import PaymentPlugin from "./payment/plugin/model.mjs";
import { PaymentCollections } from "./payment/types";
import { ProductCollections } from "./product/types";
import FinanceInternalMethods from "./terminals/internal.mjs";


export declare interface FinanceCollections {
    payment: PaymentCollections,
    product: ProductCollections
}


declare global {
    export type FinanceFacultyInternalMethods = FinanceInternalMethods
}

type FinancePluginNamespaceMap = {
    payment: PaymentPlugin[]
}