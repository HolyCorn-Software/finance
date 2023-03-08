/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This module is the entry point for the public payment library
 * It contains relevant exports, organized in an very comprehensive manner
 */


/** This allows us to load any payment UI by simply specifying the URL path */
export { PaymentProvidedUIFrame } from './provided-ui/frame.js'

/** This defines a structure that must be followed by providers when providing payment UIs */
export { PaymentProvidedUI } from './provided-ui/model.js'

/**This widget is an easy to use module allowing providers to create a UI for showing payment details, without inventing much */
export { default as GeneralPaymentUI } from './general-show-payment-data/general.js'
