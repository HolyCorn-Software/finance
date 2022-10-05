/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The accounts module
 * This module (utils) provides utilities used by other modules within the accounts module
 */

import crypto from 'node:crypto'
import shortUUID from 'short-uuid';



/**
 * This method checks if a public key corresponds to a private key.
 * @param {Buffer} privateKey 
 * @param {Buffer} publicKey 
 * @returns {boolean}
 */
function checkKeyCongruence(privateKey, publicKey) {
    const random_data = `${shortUUID.generate()}${shortUUID.generate()}`
    try {
        if (crypto.publicDecrypt(publicKey, crypto.privateEncrypt(privateKey, random_data)) === random_data) {
            return true;
        }
    } catch (e) {
        console.warn(`Will return false for checkKeyCongruence() because\n`, e)
    }
    return false;

}




/**
 * This method is used to encrypt data symmetrically, especially a private key
 * @param {Buffer} data 
 * @param {Buffer} key
 * @returns {Buffer}
 */
function aesEncrypt(data, key) {

    //We'll use aes256 encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', key, shortUUID.generate())
    cipher.update(data)
    return cipher.final()

}



/**
 * This method is used to check if two objects are equal
 * @param {object} a 
 * @param {object} b 
 * @returns {boolean}
 */
function object_equals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
}




const account_utils = {
    checkKeyCongruence,
    aesEncrypt,
    object_equals
}
export default account_utils