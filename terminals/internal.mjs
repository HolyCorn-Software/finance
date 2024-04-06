/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides methods to be used by other faculties
 */





import FinanceAccountsInternalMethods from "../accounts/remote/internal.mjs";
import FinanceController from "../controller.mjs";
import { CurrencyController } from "../currency/controller.mjs";
import PaymentInternalMethods from "../payment/terminals/internal.mjs";
import ProductInternalMethods from "../product/terminals/internal.mjs";



export default class FinanceInternalMethods extends FacultyFacultyRemoteMethods {

    /**
     * 
     * @param {FinanceController} controller
     */
    constructor(controller) {
        super()


        this.payment = new PaymentInternalMethods(controller.payment)
        this.product = new ProductInternalMethods(controller.product.data, controller.product.purchase)
        /** @type  {CurrencyController} */
        this.currency = new FunctionProxy.SkipArgOne(controller.currency)
        this.accounts = new FinanceAccountsInternalMethods(controller.accounts)

    }


}