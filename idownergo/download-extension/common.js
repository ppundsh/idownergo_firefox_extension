"use strict";

/**
 * iDownerGo Firefox Extension (Unofficial Port)
 * Non-official community build ported for Mozilla Firefox.
 */

// Pure standalone SVG icon (resolves missing image display bug)
const DOWNLOAD_SVG_DATA_URL =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRkE4QTAzIj48cGF0aCBkPSJNMTIgMTZsLTUtNWgzVjRoNHY3aDNsLTUgNXptLTcgMmgxNHYySDV2LTJ6Ii8+PC9zdmc+";

const THEME = Object.freeze({
    iconUrl: DOWNLOAD_SVG_DATA_URL,
    dlNormalColor: "#FA8A03",
    dlHoveredColor: "#fa9b26",
    productUrl: "https://download.idownergo.com/idownergo.exe",
    productUrlMac: "https://download.idownergo.com/idownergo.dmg"
});

const currentProduct = IDOWNERGO_CONFIG.productId;

function nsId(suffix) {
    const prefix = IDOWNERGO_CONFIG.idPrefix || currentProduct.toLowerCase();
    return prefix + "-" + suffix;
}

function detectPlatform() {
    if (navigator.userAgentData && navigator.userAgentData.platform) {
        return navigator.userAgentData.platform === "macOS" ? "mac" : "windows";
    }
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("mac os") !== -1 || ua.indexOf("macintosh") !== -1 ? "mac" : "windows";
}

function isAllowedInstallerUrl(urlStr) {
    try {
        const parsed = new URL(urlStr);
        return (
            parsed.protocol === "https:" &&
            IDOWNERGO_CONFIG.allowedDownloadHosts.includes(parsed.hostname.toLowerCase())
        );
    } catch (_) {
        return false;
    }
}

function getMessage(key, fallback) {
    try {
        const msg = browser.i18n.getMessage(key);
        return msg || fallback;
    } catch (_) {
        return fallback;
    }
}

function launchNativeApp(targetUrl, callback) {
    const urlToOpen = targetUrl || window.location.href;
    if (!urlToOpen) {
        if (callback) callback(false);
        return false;
    }

    browser.runtime
        .sendMessage({
            type: "openUrl",
            url: urlToOpen
        })
        .then((response) => {
            if (callback) {
                callback(Boolean(response && (response.status === "ok" || response.success === true)));
            }
        })
        .catch(() => {
            if (callback) callback(false);
        });

    return true;
}

function handleDownloadClick() {
    launchNativeApp(window.location.href, (success) => {
        if (!success) {
            showInstallDialog();
        }
    });
}

function repositionFloatingBtns() {
    const buttons = document.querySelectorAll('[id$="-itdl-btn"]');
    if (buttons.length <= 1) return;
    const baseBottom = 30;
    const step = 70;
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.bottom = baseBottom + i * step + "px";
    }
}

function createDlBtn(customClickHandler) {
    const btnId = nsId("itdl-btn");
    const styleId = nsId("itd_btn_style");

    if (document.getElementById(btnId)) {
        return;
    }

    const cssText = `
    #${btnId} {
        position: fixed;
        bottom: 30px;
        z-index: 99999;
        right: 30px;
        font-size: 20px;
        padding: 4px 18px 4px 4px;
        cursor: pointer;
        background: ${THEME.dlNormalColor};
        color: white;
        border-radius: 25px;
        border: none;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    #${btnId}:hover { background-color: ${THEME.dlHoveredColor}; }
    #${btnId}:focus { outline: none; }

    #${btnId} .itdl-btn-icon-circle {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    #${btnId} .itdl-btn-icon-circle img {
        width: 22px;
        height: 22px;
        display: block;
    }
    `;

    if (!document.getElementById(styleId) && document.head) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.textContent = cssText;
        document.head.appendChild(styleEl);
    }

    if (!document.body) return;

    const btn = document.createElement("button");
    btn.id = btnId;
    btn.type = "button";

    const iconSpan = document.createElement("span");
    iconSpan.className = "itdl-btn-icon-circle";

    const iconImg = document.createElement("img");
    iconImg.src = THEME.iconUrl;
    iconImg.alt = "Download";
    iconSpan.appendChild(iconImg);

    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Download";

    btn.appendChild(iconSpan);
    btn.appendChild(labelSpan);
    btn.addEventListener("click", typeof customClickHandler === "function" ? customClickHandler : handleDownloadClick);

    document.body.appendChild(btn);
    repositionFloatingBtns();
}

function showInstallDialog() {
    const overlayId = nsId("itdl-install-overlay");
    if (document.getElementById(overlayId) || !document.body) return;

    const platform = detectPlatform();
    const candidateUrl = platform === "mac" && THEME.productUrlMac ? THEME.productUrlMac : THEME.productUrl;
    if (!isAllowedInstallerUrl(candidateUrl)) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;" +
        "background:rgba(0,0,0,0.6);z-index:100000;display:flex;" +
        "align-items:center;justify-content:center;";

    const modal = document.createElement("div");
    modal.style.cssText =
        "background:#fff;border-radius:16px;padding:32px 40px;" +
        "min-width:340px;max-width:420px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.3);" +
        'font-family:"Roboto","Arial",sans-serif;';

    const iconBox = document.createElement("div");
    iconBox.style.cssText =
        "width:48px;height:48px;margin:0 auto 16px;border-radius:50%;background:#FFF0E0;display:flex;align-items:center;justify-content:center;";
    const iconImg = document.createElement("img");
    iconImg.src = THEME.iconUrl;
    iconImg.alt = "iDownerGo";
    iconImg.style.cssText = "width:28px;height:28px;";
    iconBox.appendChild(iconImg);

    const titleEl = document.createElement("h2");
    titleEl.textContent = getMessage("installDialogTitle", "Desktop App Not Installed");
    titleEl.style.cssText = "margin:0 0 8px;font-size:20px;color:#333;";

    const descEl = document.createElement("p");
    descEl.textContent = getMessage(
        "installDialogDesc",
        "Please install the desktop application to start downloading."
    );
    descEl.style.cssText = "margin:0 0 24px;font-size:14px;color:#666;line-height:1.5;";

    const downloadLink = document.createElement("a");
    downloadLink.href = candidateUrl;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener noreferrer";
    downloadLink.textContent = getMessage("installDialogDownloadBtn", "Download Installer");
    downloadLink.style.cssText =
        "flex:1;padding:10px 20px;" +
        "background:" + THEME.dlNormalColor + ";color:#fff;border-radius:20px;" +
        "font-size:14px;text-decoration:none;cursor:pointer;text-align:center;white-space:nowrap;";
    downloadLink.addEventListener("mouseover", function () {
        this.style.backgroundColor = THEME.dlHoveredColor;
    });
    downloadLink.addEventListener("mouseout", function () {
        this.style.backgroundColor = THEME.dlNormalColor;
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = getMessage("installDialogCloseBtn", "Close");
    closeBtn.style.cssText =
        "flex:1;padding:10px 20px;" +
        "background:none;border:1px solid #ddd;color:#999;border-radius:20px;" +
        "font-size:14px;cursor:pointer;text-align:center;white-space:nowrap;";
    closeBtn.addEventListener("click", () => {
        overlay.remove();
    });
    closeBtn.addEventListener("mouseover", function () {
        this.style.borderColor = "#999";
        this.style.color = "#666";
    });
    closeBtn.addEventListener("mouseout", function () {
        this.style.borderColor = "#ddd";
        this.style.color = "#999";
    });

    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = "display:flex;gap:12px;justify-content:center;";
    actionsRow.appendChild(closeBtn);
    actionsRow.appendChild(downloadLink);

    modal.appendChild(iconBox);
    modal.appendChild(titleEl);
    modal.appendChild(descEl);
    modal.appendChild(actionsRow);

    overlay.appendChild(modal);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });

    document.body.appendChild(overlay);
}

browser.runtime.onMessage.addListener((message) => {
    if (message && message.type === "showInstallModal") {
        showInstallDialog();
    }
});
