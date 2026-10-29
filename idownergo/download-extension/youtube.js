"use strict";

/**
 * iDownerGo Firefox Extension (Unofficial Port)
 * Specifically handles download button injection on YouTube watch and shorts pages.
 */

function injectWatchBtnStyle() {
    const styleId = nsId("itd_watch_btn_style");
    const btnId = nsId("itdl-watch-btn");
    if (document.getElementById(styleId) || !document.head) return;

    const cssText = `
        /* YouTube Native Action Button Style (Icon-only circle button) */
        #${btnId} {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            padding: 0 !important;
            margin: 0 6px 0 0 !important;
            cursor: pointer !important;
            border: none !important;
            border-radius: 18px !important;
            box-sizing: border-box !important;
            vertical-align: middle !important;
            user-select: none !important;
            text-decoration: none !important;
            box-shadow: none !important;
            outline: none !important;
            background-color: var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1)) !important;
            color: var(--yt-spec-text-primary, #f1f1f1) !important;
            transition: background-color 0.2s cubic-bezier(0.05, 0, 0, 1) !important;
        }
        #${btnId}:hover {
            background-color: var(--yt-spec-button-chip-background-hover, rgba(255, 255, 255, 0.2)) !important;
        }
        #${btnId}:active {
            background-color: rgba(255, 255, 255, 0.25) !important;
        }
        #${btnId} svg {
            width: 20px !important;
            height: 20px !important;
            fill: currentColor !important;
            display: block !important;
            pointer-events: none !important;
        }
    `;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);
}

function createWatchBtn() {
    const btn = document.createElement("button");
    btn.id = nsId("itdl-watch-btn");
    btn.type = "button";
    btn.setAttribute("title", "Download with iDownerGo");
    btn.setAttribute("aria-label", "Download with iDownerGo");

    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 2h14v2H5v-2z"/>
        </svg>
    `;

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDownloadClick();
    });

    return btn;
}

function tryInjectWatchBtn() {
    const watchBtnId = nsId("itdl-watch-btn");
    const floatBtnId = nsId("itdl-btn");

    if (window.location.pathname !== "/watch") return;
    if (document.getElementById(watchBtnId)) return;

    const container = document.querySelector("#above-the-fold #top-level-buttons-computed");
    if (!container) return;

    const floatBtn = document.getElementById(floatBtnId);
    if (floatBtn) {
        floatBtn.remove();
    }

    injectWatchBtnStyle();
    container.insertBefore(createWatchBtn(), container.firstChild);
}

let previousHref = null;
function handleUrlChange() {
    const currentHref = window.location.href;
    if (currentHref === previousHref) return;
    previousHref = currentHref;

    const watchBtnId = nsId("itdl-watch-btn");
    const floatBtnId = nsId("itdl-btn");

    if (window.location.pathname === "/watch") {
        const floatBtn = document.getElementById(floatBtnId);
        if (floatBtn) floatBtn.remove();
        const watchBtn = document.getElementById(watchBtnId);
        if (watchBtn) watchBtn.remove();
        tryInjectWatchBtn();
    } else if (currentHref.indexOf("/shorts/") !== -1) {
        const watchBtn = document.getElementById(watchBtnId);
        if (watchBtn) watchBtn.remove();
        const floatBtn = document.getElementById(floatBtnId);
        if (floatBtn) floatBtn.remove();
        createDlBtn();
    } else {
        const watchBtn = document.getElementById(watchBtnId);
        if (watchBtn) watchBtn.remove();
        const floatBtn = document.getElementById(floatBtnId);
        if (floatBtn) floatBtn.remove();
    }
}

// Initial injection
handleUrlChange();
tryInjectWatchBtn();

// Observe YouTube DOM changes (SPA player navigation)
let watchDebounceTimer = null;
if (document.body) {
    const observer = new MutationObserver(() => {
        if (watchDebounceTimer) clearTimeout(watchDebounceTimer);
        watchDebounceTimer = setTimeout(() => {
            tryInjectWatchBtn();
        }, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener("yt-navigate-finish", handleUrlChange);
window.addEventListener("popstate", handleUrlChange);
setInterval(handleUrlChange, 500);
