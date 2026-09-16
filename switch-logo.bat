@echo off
setlocal
echo ====================================================================
echo                   LU Food Compass - Logo Switcher
echo ====================================================================
echo --- 4 NEWEST CLEAN OPTION 6 RE-ITERATIONS ---
echo [1] Option 22: Pristine Option 6 Remake (Diagonal Fork/Knife, Flawless Dial) [Active]
echo [2] Option 23: Option 6 with Vertical Gold Needle (Fork North, Knife South)
echo [3] Option 24: Option 6 with Symmetrical Twin Top Cutlery (11 & 1 o'clock)
echo [4] Option 25: Option 6 with Balanced Crossed Cutlery Star
echo.
echo --- PREVIOUS ITERATIONS ---
echo [5] LU Option 21: Clean SE Dial
echo [6] LU Option 20: Clean Diagonal Axis with Crisp U
echo [7] Option A (Opt 16): Pure Vertical Needle + Collegiate LU
echo [8] Option B (Opt 17): Clean Diagonal Axis
echo [9] Option C (Opt 18): Crossed Gold Cutlery Compass Star
echo [10] Option D (Opt 19): Textless Gold Bezel with Dual Cutlery
echo.
echo --- EARLIER MONOGRAM OPTIONS ---
echo [11] LU Option 6 (Original with extra handle)
echo [12] LU Option 5: Precision Electric Cyan Dial
echo [13] LU Option 7: Modern White & Gold LU with Cyan Halo
echo [14] LU Option 8: Dual-Ring Gold & Cyan LU
echo.
echo --- LEGACY / ABSTRACT OPTIONS ---
echo [15] Geometric Compass Rose (No text)
echo [16] Original Forge OGs Legacy Logo
echo ====================================================================
set /p choice="Choose a logo option (1-16): "

if "%choice%"=="1" (
    copy /Y "logo-options\lu-option-22-pristine-opt6-remake\*" "." >nul
    echo Applied Option 22 (Pristine Option 6 Remake)!
)
if "%choice%"=="2" (
    copy /Y "logo-options\lu-option-23-vertical-gold-cutlery-needle\*" "." >nul
    echo Applied Option 23 (Vertical Gold Needle)!
)
if "%choice%"=="3" (
    copy /Y "logo-options\lu-option-24-twin-top-cutlery-bezel\*" "." >nul
    echo Applied Option 24 (Symmetrical Twin Top Cutlery)!
)
if "%choice%"=="4" (
    copy /Y "logo-options\lu-option-25-crossed-cutlery-star\*" "." >nul
    echo Applied Option 25 (Crossed Cutlery Star)!
)
if "%choice%"=="5" (
    copy /Y "logo-options\lu-option-21-clean-se-dial\*" "." >nul
    echo Applied LU Option 21!
)
if "%choice%"=="6" (
    copy /Y "logo-options\lu-option-20-clean-diagonal-crisp-u\*" "." >nul
    echo Applied LU Option 20!
)
if "%choice%"=="7" (
    copy /Y "logo-options\lu-option-16-pure-vertical-needle\*" "." >nul
    echo Applied Option A (Opt 16)!
)
if "%choice%"=="8" (
    copy /Y "logo-options\lu-option-17-clean-diagonal-gold-axis\*" "." >nul
    echo Applied Option B (Opt 17)!
)
if "%choice%"=="9" (
    copy /Y "logo-options\lu-option-18-crossed-gold-cutlery-star\*" "." >nul
    echo Applied Option C (Opt 18)!
)
if "%choice%"=="10" (
    copy /Y "logo-options\lu-option-19-gold-bezel-textless-dual-cutlery\*" "." >nul
    echo Applied Option D (Opt 19)!
)
if "%choice%"=="11" (
    copy /Y "logo-options\lu-option-6-collegiate-gold-bezel\*" "." >nul
    echo Applied Original Option 6!
)
if "%choice%"=="12" (
    copy /Y "logo-options\lu-option-5-precision-cyan-dial\*" "." >nul
    echo Applied Option 5!
)
if "%choice%"=="13" (
    copy /Y "logo-options\lu-option-7-modern-white-cyan-bezel\*" "." >nul
    echo Applied Option 7!
)
if "%choice%"=="14" (
    copy /Y "logo-options\lu-option-8-collegiate-dual-ring\*" "." >nul
    echo Applied Option 8!
)
if "%choice%"=="15" (
    copy /Y "logo-options\option-1-cyan-amber-compass\*" "." >nul
    echo Applied Geometric Compass Option 1!
)
if "%choice%"=="16" (
    copy /Y "logo-options\original-forge-logo\*" "." >nul
    echo Restored Original Logo!
)

echo Done! Refresh your browser / app.
pause
