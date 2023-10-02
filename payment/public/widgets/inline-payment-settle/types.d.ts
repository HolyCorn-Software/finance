/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This script contains type definitions for the inline-debit widget
 */

import ''


/** The various possible input types */
export type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose')



export interface StateStorage {
    stage: ('select-payment-method' | 'enter-payment-details' | 'waiting' | 'success' | 'failure' | 'canceled'),
    data: {
        paymentMethods: finance.payment.ClientPaymentMethodInfo[]
        form: htmlhc.widget.multiflexform.MultiFlexFormDefinitionData
    }

    payment_data: finance.payment.PaymentRecord
}

export type StateStorageObject = htmlhc.lib.alarm.AlarmObject<StateStorage>