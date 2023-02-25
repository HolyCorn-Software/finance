/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module provides methods to be used by other faculties
 */





import FinanceController from "../controller.mjs";
import PaymentInternalMethods from "../payment/terminals/internal.mjs";
import ProductInternalMethods from "../product/terminals/internal.mjs";



export default class FinanceInternalMethods extends FacultyPublicMethods {

    /**
     * 
     * @param {FinanceController} controller
     */
    constructor(controller) {
        super()


        this.payment = new PaymentInternalMethods(controller.payment)
        this.product = new ProductInternalMethods(controller.product.data, controller.product.purchase)

    }


}