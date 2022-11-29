/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Faculty of Finance
 * This module makes it easy to access public methods of the Faculty
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.js";

/**
 * @type {{finance:import("faculty/finance/terminals/public.mjs").default}}
 */
const finRpc = hcRpc

export default finRpc