/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This script contains type definitions for the inline-debit widget
 */

finance['ClientPaymentMethodInfo'] } from "faculty/finance/payment/types"
import {AlarmObject} from "/$/system/static/html-hc/lib/alarm/alarm-types";
import { MultiFlexFormDefinitionData } from "/$/system/static/html-hc/widgets/multi-flex-form/types";




/** The various possible input types */
export type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose')



export interface StateStorage {
    stage: ('select-payment-method' | 'enter-payment-details' | 'waiting' | 'success' | 'failure' | 'canceled'),
    data: {
        paymentMethods: [
            ClientPaymentMethodInfo
        ],
        form: MultiFlexFormDefinitionData
    },

    payment_data: finance['PaymentRecord']
}

export type StateStorageObject = AlarmObject<StateStorage>