/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module is the central starting point of the accounts module
 */

import shortUUID from "short-uuid"
import BlockChainLogic from "./blockchain/logic.mjs"
import account_utils from "./utils.mjs"
import PaymentController from "../payment/controller.mjs"




const accounts_collection_symbol = Symbol()
const system_keys_symbol = Symbol()
const payment_controller_symbol = Symbol()

const faculty = FacultyPlatform.get()



export default class FinanceAccountController {


    /**
     * 
     * @param {object} param0 
     * @param {object} param0.keys These keys are system keys, and will be used to encrypt and decrypto stuff
     * @param {Buffer} param0.keys.public
     * @param {Buffer} param0.keys.private
     * @param {object} param0.collections
     * @param {import("./types.js").AccountsCollection} param0.collections.account
     * @param {object} param0.controllers
     * @param {PaymentController} param0.controllers.payment
     */
    constructor({ keys, collections, controllers }) {

        this[accounts_collection_symbol] = collections.account
        this[system_keys_symbol] = keys

        this[payment_controller_symbol] = controllers.payment

    }

    /**
     * This method is used to create a new account.
     * 
     * The public and private keys passed are base64 strings.
     * @param {object} param0 
     * @param {object} param0.keys
     * @param {string} param0.keys.public
     * @param {string} param0.keys.private
     * @param {string} param0.keys.private_key_password The password used to encrypt the private key
     * @param {string} param0.label
     * @returns {Promise<string>}
     */
    async createAccount({ keys, label }) {
        const pubKey = Buffer.from(keys.public, 'base64')
        const privKey = Buffer.from(keys.private, 'base64')

        if (!account_utils.checkKeyCongruence(pubKey, privKey)) {
            throw new Exception(`Could not create the new account because the public key doesn't belong to the private key`)
        }


        const account_id = `${shortUUID.generate()}${shortUUID.generate()}`


        const account_collection = this.getCollectionForAccount(account_id);

        await BlockChainLogic.initChain(account_collection, pubKey);

        const default_currency = 'XAF'; //For now, there's no way 


        await this[accounts_collection_symbol].insertOne(
            {
                id: account_id,
                label,
                priv_key: this.encrypt_private_key(privKey, Buffer.from(keys.private_key_password)).toString('base64'),
                pub_key: keys.public,
                time: Date.now(),
                currency: default_currency
            }
        )

    }

    /**
     * This method is used to encrypt a private key.
     * It encrypts the key with the user key, then encrypts the results with the system key
     * @param {Buffer} privateKey 
     * @param {Buffer} userKey
     * @returns {Buffer}
     */
    encrypt_private_key(privateKey, userKey) {
        return account_utils.aesEncrypt(
            account_utils.aesEncrypt(
                privateKey,
                userKey
            ),
            this[system_keys_symbol].private
        )
    }

    /**
     * This method is used to add money to the system.
     * 
     * It supplies the transaction data to a provider to find out how much money the transaction is worth.
     * 
     * Then it converts that amouunt to the account's currency, and adds the transaction to the chain
     * 
     * @param {object} param0
     * @param {string} param0.account
     * @param {Finance.Payment.PaymentRecordMinimal} param0.transaction 
     * @returns {Promise<void>}
     * 
     */
    async createMoney({ account, transaction }) {


        //TODO: Find a way to prevent using the same transaction data to create money in more than one account, without querrying all of them

        const accounts_cursor = this[accounts_collection_symbol].find({})

        while (await accounts_cursor.hasNext()) {
            let an_account = accounts_cursor.next()
            //Now check if this account already has the given transaction

            if (
                await this.getCollectionForAccount(an_account.id).findOne(
                    {
                        'data.transaction.provider_data': transaction.provider_data
                    }
                )
            ) {

                throw new Exception(`Cannot add money to the system because the transaction data has already been used before.`)

            }
        }

        //Now that the transaction is not duplicate

        //Let's find out how much it is worth

        await this[payment_controller_symbol].refreshRecord(transaction)


        //Now we know how much it is worth, now let's convert that to the base currency of the account



    }




    /**
     * This method returns a reference to the collection that stores data for the given account
     * @param {string} account_id 
     * @returns {import("./blockchain/types.js").BlockChainCollection}
     */
    getCollectionForAccount(account_id) {
        return faculty.database.collection(`${faculty.descriptor.name}.accounts.${account_id}`)
    }



}