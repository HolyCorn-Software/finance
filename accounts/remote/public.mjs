/**
 * Copyright 2024 HolyCorn Software
 * The Faculty of Finance
 * This module allows users over the public web with features related to managing their financial accounts
 */

import muser_common from "muser_common";
import FinanceAccountsController from "../controller.mjs";


const controller = Symbol()


export default class FinanceACcountsPublicMethods {

    /**
     * 
     * @param {FinanceAccountsController} _controller 
     */
    constructor(_controller) {
        this[controller] = _controller

    }

    /**
     * This method returns information about the user's account
     * @param {object} param0
     * @param {Parameters<this[controller]['getAccountInfo']>['0']['autoCreate']} param0.autoCreate
     */
    async getMyAccountInfo({ autoCreate }) {
        const userid = (await muser_common.getUser(arguments[0])).id
        const data = await this[controller].getAccountInfo({ ...arguments[1], userid })
        delete data.userid
        return data
    }


    /**
     * This method starts the process of topping up a user's account
     * @param {finance.Amount} amount 
     */
    async topupMyAccount(amount) {
        amount = arguments[1]
        return await this[controller].topupAccount({
            userid: (await muser_common.getUser(arguments[0])).id,
            amount
        })
    }

}