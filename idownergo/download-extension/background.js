"use strict";

/**
 * iDownerGo Firefox Extension (Unofficial Port)
 * Non-official community build ported for Mozilla Firefox.
 */

const NATIVE_HOST_NAME = "com.idownergo.bridge";
const PRODUCT_ID = "iDownerGo";
const BROWSER_TYPE = "firefox";
const MAX_URL_LENGTH = 2048;

function validateMediaUrl(rawUrl) {
    if (typeof rawUrl !== "string" || rawUrl.length === 0 || rawUrl.length > MAX_URL_LENGTH) {
        return null;
    }
    if (/[\u0000-\u001F\u007F\s]/.test(rawUrl)) {
        return null;
    }
    try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return null;
        }
        if (parsed.username || parsed.password) {
            return null;
        }
        const hostname = parsed.hostname.toLowerCase();
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname.endsWith(".local")
        ) {
            return null;
        }
        return parsed.toString();
    } catch (_) {
        return null;
    }
}

function encodeBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function buildNativeParams(validatedUrl) {
    const searchParams = new URLSearchParams();
    searchParams.set("url", validatedUrl);
    searchParams.set("browser", BROWSER_TYPE);
    searchParams.set("product", PRODUCT_ID);
    return encodeBase64Utf8(searchParams.toString());
}

function sendToNativeHost(payload) {
    return browser.runtime.sendNativeMessage(NATIVE_HOST_NAME, payload);
}

async function launchDownloadUrl(targetUrl) {
    const validUrl = validateMediaUrl(targetUrl);
    if (!validUrl) {
        console.warn("[iDownerGo] Rejected invalid URL:", targetUrl);
        return { status: "error", success: false, message: "invalid_url" };
    }
    const params = buildNativeParams(validUrl);
    try {
        console.log("[iDownerGo] Sending payload to native bridge for:", validUrl);
        const response = await sendToNativeHost({
            action: "open-url",
            params: params
        });
        console.log("[iDownerGo] Native bridge response:", response);
        if (response && (response.status === "ok" || response.success === true)) {
            return { status: "ok", success: true };
        }
        return { status: "error", success: false, message: "native_error" };
    } catch (err) {
        console.error("[iDownerGo] Native bridge communication failed:", err);
        return { status: "error", success: false, message: "not_found" };
    }
}

// 1. Handle Toolbar Icon Click (Browser Action)
browser.action.onClicked.addListener(async (tab) => {
    if (!tab || !tab.url) return;
    const result = await launchDownloadUrl(tab.url);
    if (!result.success) {
        // If native messaging failed, notify content script if available on this tab
        if (tab.id) {
            browser.tabs.sendMessage(tab.id, { type: "showInstallModal" }).catch(() => {
                // Tab doesn't host content script (e.g. non-YouTube site), which is normal
            });
        }
    }
});

// 2. Handle Messages from YouTube Content Script
browser.runtime.onMessage.addListener((message, sender) => {
    if (!sender || sender.id !== browser.runtime.id) {
        return Promise.resolve({ status: "error", success: false, message: "unauthorized_sender" });
    }

    if (!message || typeof message !== "object" || message.type !== "openUrl") {
        return Promise.resolve({ status: "error", success: false, message: "invalid_message" });
    }

    const requestedUrl =
        typeof message.url === "string" && message.url.length > 0
            ? message.url
            : (sender.tab && sender.tab.url) || sender.url || "";

    return launchDownloadUrl(requestedUrl);
});
