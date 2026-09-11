@echo off

REM Remove previous selected files
if exist selected-files rmdir /S /Q selected-files

REM Create fresh folders
mkdir selected-files
mkdir selected-files\lib

REM =========================
REM BACKEND
REM =========================

REM Config
copy /Y backend\src\config\*.js selected-files\ >nul

REM Controllers
copy /Y backend\src\controllers\*.js selected-files\ >nul

REM Jobs
copy /Y backend\src\jobs\*.js selected-files\ >nul

REM Middleware
copy /Y backend\src\middlewares\*.js selected-files\ >nul

REM Models
copy /Y backend\src\models\*.js selected-files\ >nul

REM Routes
copy /Y backend\src\routes\*.js selected-files\ >nul

REM Server
copy /Y backend\src\server.js selected-files\ >nul

REM Utils
copy /Y backend\src\utils\*.js selected-files\ >nul

REM =========================
REM FRONTEND
REM =========================

copy /Y frontend\src\lib\*.js selected-files\lib\ >nul

echo.
echo ========================================
echo All latest files copied successfully!
echo ========================================
echo.
pause