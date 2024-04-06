/**
 * Copyright 2024 HolyCorn Software
 * The Faculty of Finance
 * This module (accounts), allows for users to have a financial account with the system, which can cover payments.
 * In that way, payments must not be done only with external payment methods, but equally with the funds in the account.
 */

import shortUUID from "short-uuid";
import collections from "../collections.mjs";
import PaymentController from "../payment/controller.mjs";

const controllers = Symbol()

export default class FinanceAccountsController {


    /**
     * 
     * @param {object} _controllers 
     * @param {PaymentController} _controllers.payment
     */
    constructor(_controllers) {
        this[controllers] = _controllers
    }
    async init() {
        await collections.account_pending_transactions.createIndex({ expires: 1 }, { expireAfterSeconds: 10 });


        /**
         * 
         * @param {finance.accounts.info.PendingTransaction} record 
         */
        const processPendingTransaction = async (record) => {
            const paymentRecord = await this[controllers].payment.findRecord({ id: record.payment });
            if (paymentRecord.done) {
                try {
                    if (paymentRecord.amount.currency != record.amount.currency) {
                        console.warn(`There's an issue. The debit transaction was created in ${record.amount.currency}, whereas, the payment was done in ${paymentRecord.amount.currency}`);
                    } else {
                        await collections.account_info.updateOne({ userid: record.userid }, { $inc: { balance: paymentRecord.settled_amount.value } });
                        await this.finalizeTransaction({ id: record.id });
                    }
                } catch (e) {
                    console.error(`Error when processing ${record.id}\n`, e);
                }
            }
        }


        // Whenever a payment is complete, let's check if it's a payment for an account topup
        FacultyPlatform.get().connectionManager.events.addListener('finance.payment-complete', async (id) => {
            const record = await collections.account_pending_transactions.findOne({ type: 'credit', payment: id })
            if (record) {
                // If so, let's process the transaction, and probably increment the user's balance
                processPendingTransaction(record)
            }
        });


        (async () => {
            for await (const record of collections.account_pending_transactions.find({ type: 'credit', payment: { $exists: true } })) {
                await processPendingTransaction(record);
            }
        })()

    }

    /**
     * This method marks a transaction as final, to prevent revoking.
     * @param {object} param0 
     * @param {string} param0.id
     */
    async finalizeTransaction({ id }) {
        if (typeof id != 'string') {
            throw new Exception(`Pass a string for 'id'`)
        }
        await collections.account_pending_transactions.deleteOne({ id })
    }



    /**
     * This method opens a new account for a user.
     * 
     * This method would not open an account, if there's already one.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.currency
     * @returns {Promise<finance.accounts.info.AccountInfo>}
     */
    async openAccount({ userid, currency }) {
        const details = await collections.account_info.updateOne({
            userid
        }, {
            $setOnInsert: {
                balance: 0,
                currency,
                created: Date.now(),
            }
        }, { upsert: true });

        /** @type {Awaited<ReturnType<FinanceAccountsController['openAccount']>>} */
        const data = details.upsertedCount == 0 ? {
            userid,
            balance: 0,
            currency,
            created: Date.now(),
        } : await collections.account_info.findOne({ userid })

        delete data._id

        return data

    }

    /**
     * This method returns a user's account info
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {Omit<Parameters<FinanceAccountsController['openAccount']>['0'], "userid">} param0.autoCreate If the account doesn't exist, this data would be used to create another account
     */
    async getAccountInfo({ userid, autoCreate }) {
        const data = (await collections.account_info.findOne({ userid })) || await (() => {
            return autoCreate ? this.openAccount({ ...autoCreate, userid, }) : undefined
        })()
        if (data) delete data._id
        return data
    }

    /**
     * This method is used to debit a user
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {finance.Amount} param0.amount
     * @param {object} param0.autoFinalize
     * @param {number} param0.autoFinalize.timeout
     */
    async debitUser({ userid, amount, autoFinalize }) {
        const accountInfo = await this.getAccountInfo({ userid })
        if (!accountInfo) {
            throw new Exception(`The transaction cannot continue, because user with id '${userid}', doesn't have a financial account with the system.`)
        }

        FinanceAccountsController.checkAmount(amount);

        if (accountInfo.currency != amount.currency) {
            throw new Exception(`The transaction cannot continue, because the user's account is retained in '${accountInfo.currency}', which is different from the transaction's currency (${amount.currency})`)
        }
        if (accountInfo.balance < amount.value) {
            throw new Exception(`Insufficient balance. Please, topup`)
        }

        const chargebackId = `${shortUUID.generate()}${shortUUID.generate()}`
        await collections.account_info.updateOne({ userid }, { $inc: { balance: amount.value * -1 } });


        await collections.account_pending_transactions.insertOne({
            id: chargebackId,
            type: 'debit',
            userid,
            amount,
            created: Date.now(),
            // timeout is passed in milliseconds, and we need to convert it to seconds (only if it was passed in the first place)
            expires: ((x => x ? x / 1000 : x)(autoFinalize?.timeout)) || (72 * 60 * 60) // The default finalization time, is 72 hours
        })

        return chargebackId
    }

    /**
     * 
     * @param {finance.Amount} amount 
     */
    static checkAmount(amount) {
        soulUtils.checkArgs(amount, {
            currency: 'string',
            value: 'number'
        }, 'amount', undefined, ['exclusive']);

        if (amount.value < 0) {
            throw new Exception(`${amount.value} ${amount.currency} is invalid for an amount.`);
        }
    }

    /**
     * This method starts the process of topping up a user's account
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {finance.Amount} param0.amount
     */
    async topupAccount({ userid, amount }) {
        FinanceAccountsController.checkAmount(amount)
        await this.getAccountInfo({ userid, autoCreate: { currency: amount.currency } });

        const payment = await this[controllers].payment.createRecord({
            type: 'invoice',
            amount,
            owners: [userid],
            meta: {
                note: `Account topup`,
                product: {
                    category: 'credit',
                    description: `Account topup of ${amount.value} ${amount.currency}`,
                    type: 'virtual',
                    name: 'Account Topup'
                },
                reason: 'Account topup'
            }
        })

        collections.account_pending_transactions.insertOne({
            id: shortUUID.generate(),
            userid,
            type: 'credit',
            payment,
            amount,
            created: Date.now(),
            expires: 7 * 24 * 60 * 60, // At least, 7 days to wait for the transaction to complete
        });

        return payment
    }

}