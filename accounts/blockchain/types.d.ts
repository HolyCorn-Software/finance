/**
 * Copyright 2022 HolyCorn Software
 * The CAYOED People System
 * The Faculty of Finance
 * The accounts/blockchain module
 * This module (types) contains typedefinitions used by the blockchain module
 */

import { Collection } from "mongodb"



export declare interface Block<DataType>{

    id: string,
    data: DataType,
    prev_hash: string,
    time: number
    random: string
    
}


export type BlockChainCollection = Collection<Block<{}>>