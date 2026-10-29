# iDownerGo Firefox Extension (Unofficial Port)

[繁體中文](#繁體中文) | [English](#english)

---

## 繁體中文

本專案為 **iDownerGo 桌面下載軟體** 的非官方 Mozilla Firefox 瀏覽器擴充功能移植版（Manifest V3），提供與原版 Chrome 擴充功能一致的影音一鍵呼叫下載體驗。

> **免責聲明**：本專案為社群第三方開源移植，並非 iDownerGo 官方出品。所有 iDownerGo 相關商標、著作權及專利均屬原開發團隊所有。

### 核心特性

- **YouTube 原生風格按鈕**：在 YouTube 影片頁面的控制按鈕旁，無縫注入符合 YouTube 原生 UI 的膠囊型下載按鈕。
- **全站一鍵呼叫**：在支援的影音網站（Facebook、Instagram、Bilibili、TikTok 等），點擊 Firefox 右上角工具列圖示即可直接將當前網址傳送至桌面版。
- **Firefox MV3 非同步標準架構**：採用非持久性（Non-persistent）Background Scripts 與現代 Promise API。
- **安全性與效能優化**：移除了原版龐大混淆程式碼與第三方多餘追蹤腳本，嚴格限制 Content Scripts 注入範圍（僅在 YouTube 執行），並加入嚴格的 URL 與來源驗證。
- **自動更新機制**：支援自託管（Self-hosted）`update_url`，透過 GitHub Release 自動接收擴充功能版本更新。

### 系統需求

- **作業系統**：Windows 10 / 11 (64-bit)
- **瀏覽器**：Mozilla Firefox 109 或更高版本
- **桌面應用**：需已預先安裝官方 [iDownerGo 桌面版軟體](https://idownergo.com/)

---

### 安裝步驟

#### 步驟 1：註冊本機原生通訊主機 (Native Messaging Host)
因為 Firefox 具有嚴格的安全沙箱機制，擴充功能無法直接呼叫外部 EXE，必須在 Windows 登錄檔登記原生通訊設定：

1. 下載本專案或 Release 中的 `install_host.bat`。
2. 雙擊執行 `install_host.bat`（或以管理員身分執行）。
3. 腳本會自動偵測本機 `%LOCALAPPDATA%\MediaBridge\idownergo` 的安裝路徑並註冊至 `HKCU\Software\Mozilla\NativeMessagingHosts\com.idownergo.bridge`。

#### 步驟 2：安裝 Firefox 擴充功能

- **方式 A（正式發布 / 簽署版本）**：
  至本專案的 [Releases](https://github.com/ppundsh/idownergo_firefox_extension/releases) 下載最新 `idownergo-firefox.xpi`，直接將檔案拖曳進 Firefox 瀏覽器視窗中即可安裝。
- **方式 B（開發者測試載入）**：
  1. 開啟 Firefox，在網址列前往 `about:debugging#/runtime/this-firefox`。
  2. 點擊 **「載入暫時附加元件…」**。
  3. 選取本專案目錄中的 `idownergo/download-extension/manifest.json` 或 `release/idownergo-firefox.xpi`。

---

## English

This project is an unofficial Mozilla Firefox extension (Manifest V3) ported from the **iDownerGo Desktop Downloader**, providing the same seamless one-click video download capability as the original Chrome extension.

> **Disclaimer**: This is an independent, community-driven open-source project and is not affiliated with or endorsed by iDownerGo. All trademarks, copyrights, and brand names belong to their respective owners.

### Key Features

- **Native YouTube UI Integration**: Injects a sleek download button natively into YouTube's player action bar matching YouTube's theme variables.
- **One-Click Toolbar Trigger**: Click the extension icon in the Firefox toolbar on any supported video site (Facebook, Instagram, Bilibili, TikTok, etc.) to immediately launch iDownerGo with the current page URL.
- **Modern Firefox MV3 Architecture**: Built entirely on non-persistent background scripts and native Promise-based `browser.*` APIs.
- **Enhanced Security & Performance**: Stripped all heavy obfuscations, removed unused tracking assets, and restricted content script injection strictly to YouTube pages with robust origin and URL validation.
- **Self-Hosted Auto Updates**: Fully configured with `update_url` pointing to GitHub releases for seamless update distribution.

### System Requirements

- **OS**: Windows 10 / 11 (64-bit)
- **Browser**: Mozilla Firefox 109 or later
- **Desktop Software**: Official [iDownerGo Desktop App](https://idownergo.com/) installed on your machine.

---

### Installation Guide

#### Step 1: Register Native Messaging Host
Due to Firefox sandbox restrictions, the extension communicates with the desktop app via Native Messaging:

1. Download `install_host.bat` from this repository or from the [Releases](https://github.com/ppundsh/idownergo_firefox_extension/releases) page.
2. Double-click `install_host.bat` to run.
3. The script automatically detects the local installation under `%LOCALAPPDATA%\MediaBridge\idownergo` and registers the registry key at `HKCU\Software\Mozilla\NativeMessagingHosts\com.idownergo.bridge`.

#### Step 2: Install the Firefox Extension

- **Option A (Signed Release .xpi)**:
  Download `idownergo-firefox.xpi` from [Releases](https://github.com/ppundsh/idownergo_firefox_extension/releases) and drag-and-drop the file into any Firefox window to install.
- **Option B (Temporary Developer Load)**:
  1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
  2. Click **"Load Temporary Add-on..."**.
  3. Select `idownergo/download-extension/manifest.json` or `release/idownergo-firefox.xpi`.

---

## Packaging from Source

To package the extension into an `.xpi` file compatible with Mozilla Add-on developer portal (avoiding Windows backslash separator errors):

```powershell
cd idownergo\download-extension
tar -a -c -f ..\..\release\idownergo-firefox.xpi *
```
