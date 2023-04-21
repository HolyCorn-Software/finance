/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This script contains type definitions for the inline-debit widget
 */

import { MultiFlexFormDefinitionData } from "/$/system/static/html-hc/widgets/multi-flex-form/types";




/** The various possible input types */
export type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose')



export interface StateStorage {
    stage: ('select-payment-method' | 'enter-payment-details' | 'waiting' | 'success' | 'failure' | 'canceled'),
    data: {
        paymentMethods: [
            Finance.Payment.ClientPaymentMethodInfo
        ],
        form: MultiFlexFormDefinitionData
    }

    payment_data: Finance.Payment.PaymentRecord
}

export type StateStorageObject = htmlhc.lib.alarm.AlarmObject<StateStorage>