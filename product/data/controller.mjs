/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * The product module
 * This piece of code controls the main logic of managing data about products
 */

import muser_common from "muser_common"
import shortUUID from "short-uuid"

const faculty = FacultyPlatform.get()


const collection_symbol = Symbol()


export default class ProductDataController {



    /**
     * 
     * @param {import("./types.js").ProductDataCollection} collection 
     */
    constructor(collection) {
        this[collection_symbol] = collection
    }

    /**
     * This method is used to create a new product
     * @param {object} param0
     * @param {Omit<import("./types.js").ProductMutableData>} param0.data 
     * @param {string} param0.userid If specified, the user will be authenticated against the given action
     * @param {[string]} param0.zones If specified alongside userid, the system will check if the given user has permissions to create products in the given zone
     * @returns {Promise<string>}
     */
    async createProduct({ data, userid, zones }) {


        if (
            userid
            && !await muser_common.whitelisted_permission_check(
                {
                    userid,
                    intent: {
                        freedom: 'use',
                        zones
                    },
                    permissions: [
                        'permissions.finance.product.create'
                    ],
                    throwError: false

                }
            )
        ) {
            throw new Exception(`You are not permitted to create a prudct`)
        }

        const fields = ProductDataController.product_mutable_fields

        const final = {}
        for (let field of fields) {
            final[field] = data[field]
        }
        final.id = `${shortUUID.generate()}${shortUUID.generate()}`
        final.time = Date.now()


        this[collection_symbol].insertOne(
            final
        );

        return final.id


    }


    /**
     * This is used to modify one or more fields of a product
     * @param {object} param0 
     * @param {string} param0.id
     * @param {object} param0.security
     * @param {string} param0.security.userid If specified, checks will be performed to make sure the user is allowed to do this
     * @param {[string]} param0.security.zones If specified together with the userid, security checks will be made to ensure that the users powers
     * to alter a product he doesn't own, are valid within those zones
     * @param {Promise<import("./types.js").ProductMutableData>}
     */
    async modifyProduct({ id, data, security }) {

        await this.getAndCheckPermissions({ id, userid: security?.userid }) //We need this method to mainly verify if the product exists and to do security checks


        const query = {}

        for (let field of ProductDataController.product_mutable_fields) {
            if (typeof data[field] !== 'undefined' && data[field] !== null) {
                query[field] = data[field]
            }
        }

        this[collection_symbol].updateOne({ id }, { $set: query })
    }


    /**
     * Finds a product by id
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<import("./types.js").ProductData>}
     */
    async findProduct({ id }) {
        const product = await this[collection_symbol].findOne({ id });

        if (!product || product === null) {
            console.log(`Could not find product by `, arguments[0])
            throw new Exception(`Sorry, we could not find the product or payment you were looking for.`)
        }
        return product;
    }


    /**
     * This method is used to delete a product.
     * 
     * If the userid of the actor is specified, security checks will be made to make sure he is allowed to make those changes
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async deleteProduct({ id, userid }) {
        await this.getAndCheckPermissions({ id, userid })
        await this[collection_symbol].deleteOne({ id })
        faculty.connectionManager.events.emit(`${faculty.descriptor.name}.product-delete`, id)
    }

    /**
     * This method is used to get a product, and then check if the product belongs to the specified user
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @returns {Promise<import("./types.js").ProductData>}
     */
    async getAndCheckPermissions({ id, userid }) {

        const product = await this[collection_symbol].findOne({ id })

        if (!product) {
            console.trace(`The product ${product} was not found!`)
            throw new Exception(`The product or payment you are looking for was not found.`)
        }


        if (
            userid
            && !await muser_common.whitelisted_permission_check(
                {
                    userid,
                    intent: { freedom: 'use' },
                    permissions: ['permissions.finance.product.modify_any_product'],
                    whitelist: product.owners,
                    throwError: false
                }
            )
        ) {
            throw new Exception(`You were not the one who created this product and you also don't have the permissions to modify products`)
        }
        return product;
    }



    static get product_mutable_fields() {
        return [

            'label',
            'description',
            'owners',
            'price',
        ]

    }

}


/**
 * @type {[import("faculty/modernuser/permission/data/types.js").PermissionData]}
 */
export let product_data_permissions = [
    {

        name: 'permissions.finance.product.modify_any_product',
        label: `Modify a payment you don't own`,
        time: Date.now()
    }
]


