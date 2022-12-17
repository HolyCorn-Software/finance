/**
 * Copyright 2022 HolyCorn Software
 * The Faculty of Finance
 * This module (helper) allows plugins to be retrieved with typing information
 */

import PluginList from "../../system/lib/libFaculty/plugins/list.mjs"




/** @type {{list: PluginList<import("faculty/finance/types.js").FinancePluginNamespaceMap>}} */ 
const financePlugins = {}

Reflect.defineProperty(financePlugins, 'list', {
    get: () => FacultyPlatform.get().pluginManager.plugins,
    configurable: true,
    enumerable: true
})


export default financePlugins