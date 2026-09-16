@echo off
echo ===================================================
echo       LU Food Compass - Local Live Server
echo ===================================================
echo.
echo Direct Links:
echo   - Local PC : http://localhost:8080
echo   - iPhone / Mobile on Campus Wi-Fi : http://10.104.218.229:8080
echo   - iPhone via Tailscale : http://100.99.188.42:8080
echo.
echo Press Ctrl+C to stop the server.
echo ===================================================
python -m http.server 8080 --bind 0.0.0.0 --directory "C:\Users\User\Desktop\LU-Food-Compass"
