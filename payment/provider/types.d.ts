/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains type definitions related to managing payment providers
 */



export declare interface PaymentUserInput {
    intent: ("invoice" | 'payout'),
    data: object
}