/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains general type definitions for the faculty
 */

import { PluginNamespaceMap } from "system/lib/libFaculty/plugins/types";
import PaymentPlugin from "./payment/plugin/model.mjs";
import {
    PaymentCollections, PaymentMethodsInfo as _PaymentMethodsInfo,
    PaymentRecord as _PaymentRecord, PaymentRecordInit as _PaymentRecordInit,
    PaymentRecordMinimal as _PaymentRecordMinimal,
    PaymentUserInputValidationResult as _PaymentUserInputValidationResult,
    PaymentUserInputValidationData as _PaymentUserInputValidationData,
    PaymentRecordType as _PaymentRecordType,
    ClientPaymentMethodInfo as _ClientPaymentMethodInfo,
    PaymentMethodInfo as _PaymentMethodInfo
} from "./payment/types";

import { ProductCollections } from "./product/types";
import FinanceInternalMethods from "./terminals/internal.mjs";
import FinancePublicMethods from "./terminals/public.mjs";


export declare interface FinanceCollections {
    payment: PaymentCollections,
    product: ProductCollections
}


declare global {

    namespace Finance {
        namespace Payment {
            declare interface PaymentRecord<ProviderData = {}, ClientInputData = {}, ClientOutputData = {}> extends _PaymentRecord<ProviderData, ClientInputData, ClientOutputData> { }
            declare interface PaymentRecordMinimal<ProviderData> extends _PaymentRecordMinimal<ProviderData> { }
            declare interface PaymentRecordInit<ProviderData = {}> extends _PaymentRecordInit<ProviderData> { }
            declare interface PaymentUserInputValidationResult extends _PaymentUserInputValidationResult { }
            declare type PaymentMethodsInfo = _PaymentMethodsInfo
            declare type PaymentMethodInfo = _PaymentMethodInfo
            declare interface PaymentUserInputValidationData<ClientInputData = {}> extends _PaymentUserInputValidationData<ClientInputData> { }
            declare type PaymentRecordType = _PaymentRecordType
            declare interface ClientPaymentMethodInfo extends _ClientPaymentMethodInfo { }
        }

        declare interface Remote {
            internal: FinanceInternalMethods
            public: FinancePublicMethods
        }

        declare interface Amount {
            currency: string
            value: number
        }
    }
}

type FinancePluginNamespaceMap = {
    payment: PaymentPlugin<{}>[]
}