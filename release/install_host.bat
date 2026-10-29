@echo off
chcp 65001 >nul
echo [iDownerGo Firefox Native Host Setup]

set "TARGET_DIR=%~dp0"
set "EXE_PATH=%LOCALAPPDATA%\MediaBridge\idownergo\service\iDownerGoDownloadService.exe"

if not exist "%EXE_PATH%" (
    echo [警告] 找不到 iDownerGo 桌面版服務元件:
    echo "%EXE_PATH%"
    echo 請確認電腦已安裝官方 iDownerGo 軟體。
    pause
    exit /b 1
)

set "JSON_PATH=%TARGET_DIR%native_host_manifest.json"
set "ESCAPED_EXE=%EXE_PATH:\=\\%"

(
echo {
echo   "name": "com.idownergo.bridge",
echo   "description": "iDownerGo Browser Bridge - Native Messaging Host (Unofficial Firefox Build)",
echo   "path": "%ESCAPED_EXE%",
echo   "type": "stdio",
echo   "allowed_extensions": [
echo     "idownergo-unofficial@community-bridge"
echo   ]
echo }
) > "%JSON_PATH%"

reg add "HKCU\Software\Mozilla\NativeMessagingHosts\com.idownergo.bridge" /ve /t REG_SZ /d "%JSON_PATH%" /f >nul

if %errorlevel% equ 0 (
    echo [成功] 原生主機設定與登錄檔註冊成功！
    echo 註冊機碼: HKCU\Software\Mozilla\NativeMessagingHosts\com.idownergo.bridge
    echo Manifest: %JSON_PATH%
    echo 執行路徑: %EXE_PATH%
) else (
    echo [失敗] 寫入登錄檔失敗，請確認權限或嘗試以管理員身分執行。
)
pause
