/**
 * Copyright 2024 HolyCorn Software
 * The Faculty of Finance
 * This module allows other faculties to access features related to managing users' financial accounts
 */

import FinanceAccountsController from "../controller.mjs";



/**
 * @extends FunctionProxy.SkipArgOne<FinanceAccountsController>
 */
export default class FinanceAccountsInternalMethods extends FunctionProxy.SkipArgOne {

    /**
     * 
     * @param {FinanceAccountsController} controller 
     */
    constructor(controller) {
        super(controller,)
    }

    async init() {
        throw new Error(`How dare you?`)
    }

}