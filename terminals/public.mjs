/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides publicly available methods from the Faculty of Finance
 */

import FinanceController from "../controller.mjs";
import { CurrencyController } from "../currency/controller.mjs";
import PaymentPublicMethods from "../payment/terminals/public.mjs";
import ProductPublicMethods from "../product/terminals/public.mjs";



export default class FinancePublicMethods extends FacultyPublicMethods {

    /**
     * 
     * @param {FinanceController} controller
     */
    constructor(controller) {
        super()


        this.payment = new PaymentPublicMethods(controller.payment, controller.refresher)
        this.product = new ProductPublicMethods(controller.product.data, controller.product.purchase)
        /** @type  {CurrencyController} */
        this.currency = new FunctionProxy.SkipArgOne(controller.currency)

    }


}