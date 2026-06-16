@echo off
REM AlgerMusic 多平台编译脚本 (Windows)
REM 用法: build.bat [platform]
REM platform: win | mac | linux | apk | all

setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0"
set "BUILD_OUTPUT=%PROJECT_DIR%build-output"

REM 创建输出目录
if not exist "%BUILD_OUTPUT%" mkdir "%BUILD_OUTPUT%"

echo ================================================
echo AlgerMusic v5.1.2 多平台编译脚本
echo ================================================
echo.

REM 获取编译平台，默认 all
set "PLATFORM=%1"
if "%PLATFORM%"=="" set "PLATFORM=all"

REM 编译前端
echo [1/5] 正在编译前端资源...
call npm run build
if !errorlevel! equ 0 (
    echo ✓ 前端编译完成
) else (
    echo ✗ 前端编译失败
    exit /b 1
)
echo.

REM Windows 编译
if "%PLATFORM%"=="win" goto :build_windows
if "%PLATFORM%"=="all" goto :build_windows
goto :skip_windows

:build_windows
echo [2/5] 正在编译 Windows 版本...
call npm run build:win
if exist "%PROJECT_DIR%dist" (
    xcopy /E /I /Y "%PROJECT_DIR%dist\*" "%BUILD_OUTPUT%" >nul 2>&1
    echo ✓ Windows 版本编译完成
    echo   输出: %BUILD_OUTPUT%\AlgerMusicPlayer-*.exe
)
echo.

:skip_windows
if "%PLATFORM%"=="win" goto :end

REM APK 编译 (仅在 Windows 上，如果安装了 Android SDK)
if "%PLATFORM%"=="apk" goto :build_apk
if "%PLATFORM%"=="all" goto :build_apk
goto :skip_apk

:build_apk
echo [5/5] 正在编译 Android APK...
call npx cap sync android
pushd "%PROJECT_DIR%android"
call gradlew.bat clean assembleRelease
popd
if exist "%PROJECT_DIR%android\app\build\outputs\apk\release\app-release.apk" (
    copy /Y "%PROJECT_DIR%android\app\build\outputs\apk\release\app-release.apk" "%BUILD_OUTPUT%\AlgerMusicPlayer-v5.1.2.apk" >nul
    echo ✓ APK 版本编译完成
    echo   输出: %BUILD_OUTPUT%\AlgerMusicPlayer-v5.1.2.apk
)
echo.

:skip_apk
echo ================================================
echo 编译完成！
echo 输出目录: %BUILD_OUTPUT%
echo ================================================
echo.
echo 文件列表:
dir /B "%BUILD_OUTPUT%" | findstr /V "^$"
echo.

:end
endlocal
