/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The Blockchain Controller
 * This module is able to make and verify transactions of a blockchain
 */

import crypto from 'node:crypto'
import shortUUID from 'short-uuid';
import { Exception } from '../../../../system/errors/backend/exception.js';
import account_utils from '../utils.mjs';




export default class BlockChainLogic {


    constructor() {

    }

    /**
     * This method creates the first and most important block of the blockchain
     * @param {import('./types.js').BlockChainCollection} collection  
     * @param {Buffer} publicKey 
     * @returns {Promise<void>}
     */
    static async initChain(collection, publicKey) {

        //That first block should have id 0
        const id = '0';

        //However, let's check if there's already a first block
        const existing = await collection.findOne({
            id
        });

        if (existing) {
            throw new Error(`Could not initialize block chain because there's already a foundation block.`)
        }


        //The First block contains the public key

        /** @type {import('./types.js').Block} */
        const item = {
            id,
            data: publicKey.toString('base64'),
            prev_hash: '',
            random: shortUUID.generate(),
            time: Date.now()
        }


        await collection.insertOne(item)


    }



    /**
     * This method adds a single piece of data to the blockchain
     * @param {import('./types.js').BlockChainCollection} collection 
     * @param {object} data 
     * @param {Buffer} privateKey
     * @returns {Promise<string>}
     */
    static async addBlock(collection, data, privateKey) {

        // Get the highest id
        const previous_block = (await collection.find({}).sort({ id: -1 }).next())

        //Get the first block
        const first_block = previous_block.id === '0' ? previous_block : await collection.findOne({ id: '0' })


        if (!first_block) {
            throw new Error(`Cannot add block to chain, because chain is not yet initialized`)
        }

        //Now, we check the key congruence
        if (!account_utils.checkKeyCongruence(privateKey, Buffer.from(first_block.data, 'base64'))) {
            throw new Exception(`Could not add block to the blockchain because the private key doesn't correspond to the original public key of the chain.`)
        }

        //TODO: Check the previous three blocks



        const new_id = `${(new Number(previous_block.id).valueOf()) + 1}`
        const prev_hash = this.hashObject(previous_block, privateKey)

        await collection.insertOne(
            {
                data,
                id: new_id,
                prev_hash,
                random: shortUUID.generate(),
                time: Date.now(),
            }
        )




    }

    /**
     * This method calculates the signed hash of an object using a privateKey.
     * 
     * It simply converts the object to a JSON string and calculates the signed hash of that string
     * @param {object} object 
     * @param {Buffer} privateKey 
     * @returns {Buffer}
     */
    static hashObject(object, privateKey) {
        return this.hash(JSON.stringify(object), privateKey)
    }

    /**
     * This calculates the signed hash of some data.
     * 
     * That is, it encrypts it, and hashes it
     * @param {Buffer} data 
     * @param {Buffer} private 
     * @returns {string}
     */
    static hash(data, private) {
        const encrypted = crypto.privateEncrypt(private, data)
        return crypto.createHash('md5').update(encrypted).digest().toString('hex')

    }

}