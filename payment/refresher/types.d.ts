/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module contains type definitions for the payment refresher module
 */

import EventEmitter from "events";


export interface EventsInterface extends EventEmitter {
    addListener(event: ('complete'), listener: (id: string) => void): this;
    addListener(event: 'expire', listener: (id: string) => void): this;
    addListener(event: 'fail', listener: (id: string) => void): this;
}

global {
    namespace faculty {
        interface FacultyEvents {
            'finance.payment-complete': [string]
            'finance.payment-fail': [string]
        }
    }
}