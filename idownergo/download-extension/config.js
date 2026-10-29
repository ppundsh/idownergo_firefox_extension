"use strict";

/**
 * Immutable product configuration for iDownerGo Firefox extension.
 * Note: Native Messaging host name is intentionally NOT exposed to content scripts
 * and is enforced exclusively inside background.js.
 */
const IDOWNERGO_CONFIG = Object.freeze({
    productId: "iDownerGo",
    idPrefix: "idownergo",
    allowedDownloadHosts: Object.freeze([
        "download.idownergo.com",
        "idownergo.com",
        "www.idownergo.com"
    ])
});
