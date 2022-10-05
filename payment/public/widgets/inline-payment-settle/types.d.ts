/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This script contains type definitions for the inline-debit widget
 */

import { ClientPaymentMethodInfo, PaymentRecord } from "faculty/finance/payment/types"
import { AlarmObject } from "/$/system/static/lib/hc/lib/util/alarm-types.js"




/** The various possible input types */
export type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose')

export interface MultiFlexFormFieldData {
    label: string,
    value: string | number | boolean,
    type: InputTypes
}
export type MultiFlexFormDefinitionData = [
    [MultiFlexFormFieldData]
]



export interface StateStorage {
    stage: ('select-payment-method' | 'enter-payment-details' | 'waiting' | 'success' | 'failure' | 'canceled'),
    data: {
        paymentMethods: [
            ClientPaymentMethodInfo
        ],
        form: MultiFlexFormDefinitionData
    },

    payment_data: PaymentRecord /*{
        id: string,
        client_data: {
            input: object,
            output: object
        },
        method: string,
        userCanceled: boolean,
        executed: number

    }*/
}

export type StateStorageObject = AlarmObject<StateStorage>