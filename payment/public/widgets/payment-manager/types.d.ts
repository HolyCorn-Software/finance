/**
 * Copyright 2023 HolyCorn Software
 * The Faculty of Finance
 * The payment-manager widget
 * This module contains vital data types for the widget
 */



import ''

global {
    namespace finance.ui.payment_manager {
        interface ExternalAction {
            name: string
            callback: (record: finance.payment.PaymentRecord) => Promise<HTMLElement[]> | HTMLElement[]
        }
    }
}