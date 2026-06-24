@echo off

echo --- 1. kill ---
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do taskkill /F /PID %%a 2>nul
echo Da giai phong cac port.

echo --- 2. chay ---
start "AuraPass Backend Server" cmd /c "cd backend && npm run dev"
start "AuraPass Client App" cmd /c "cd client && npm run dev"
start "AuraPass Admin App" cmd /c "cd admin && npm run dev"
echo Dang khoi dong server va frontend...

echo --- 3. ket noi ---
ping 127.0.0.1 -n 6 >nul
start http://localhost:5173
start http://localhost:5175

echo Khoi chay AuraPass thanh cong!
exit
