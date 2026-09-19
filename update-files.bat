@echo off

REM Remove previous selected files
if exist selected-files rmdir /S /Q selected-files

REM Create fresh folders
mkdir selected-files
mkdir selected-files\lib
mkdir selected-files\pages
mkdir selected-files\customer
mkdir selected-files\farmer
mkdir selected-files\admin
mkdir selected-files\components

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

copy /Y frontend\src\api\*.js selected-files\lib\ >nul
copy /Y frontend\src\hooks\*.js selected-files\lib\ >nul

copy /Y frontend\src\forms\*.jsx selected-files\pages\ >nul
copy /Y frontend\src\pages\*.jsx selected-files\pages\ >nul
copy /Y frontend\src\pages\admin\*.jsx selected-files\admin\ >nul
copy /Y frontend\src\pages\customer\*.jsx selected-files\customer\ >nul
copy /Y frontend\src\pages\farmer\*.jsx selected-files\farmer\ >nul

copy /Y frontend\src\components\notification\NotificationBell.jsx selected-files\components\ >nul
copy /Y frontend\src\components\notification\NotificationCard.jsx selected-files\components\ >nul
copy /Y frontend\src\components\notification\Notificationspage.jsx selected-files\components\ >nul
copy /Y frontend\src\components\notification\notificationTypes.js selected-files\components\ >nul
copy /Y frontend\src\components\notification\timeAgo.js selected-files\components\ >nul

copy /Y frontend\src\components\profile\shared\*.jsx selected-files\components\ >nul
copy /Y frontend\src\components\review\*.jsx selected-files\components\ >nul

copy /Y frontend\src\components\*.jsx selected-files\components\ >nul

echo.
echo ========================================
echo All latest files copied successfully!
echo ========================================
echo.
pause