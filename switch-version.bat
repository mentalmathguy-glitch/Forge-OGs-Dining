@echo off
setlocal
echo ===================================================
echo       LU Food Compass - Design Version Switcher
echo ===================================================
echo [1] Option 1: Modern Listco Layout (Current Live)
echo [2] Option 2: Classic 24h Timeline Schedule Bars
echo [3] Option 3: Atmospheric Parallax Layout
echo [4] Option 4: Test V1 Listco Layout
echo ===================================================
set /p choice="Choose a design version to set as active index.html (1-4): "

if "%choice%"=="1" (
    copy /Y "app-versions\option-1-current-live-listco\index.html" "index.html" >nul
    echo Set Option 1 (Listco Layout) as active index.html!
)
if "%choice%"=="2" (
    copy /Y "app-versions\option-2-classic-timeline-bars\index.html" "index.html" >nul
    echo Set Option 2 (Classic Timeline Bars) as active index.html!
)
if "%choice%"=="3" (
    copy /Y "app-versions\option-3-parallax-atmospheric\index.html" "index.html" >nul
    echo Set Option 3 (Atmospheric Parallax) as active index.html!
)
if "%choice%"=="4" (
    copy /Y "app-versions\option-4-test-v1-listco\index.html" "index.html" >nul
    echo Set Option 4 (Test V1 Listco) as active index.html!
)

echo Done! Refresh your browser / app.
pause
