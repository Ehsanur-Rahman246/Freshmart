@echo off

if not exist selected-files mkdir selected-files

copy /Y backend\src\config\*.js selected-files\ >nul
copy /Y backend\src\controllers\*.js selected-files\ >nul
copy /Y backend\src\routes\*.js selected-files\ >nul
copy /Y backend\src\models\*.js selected-files\ >nul
copy /Y backend\src\middlewares\*.js selected-files\ >nul
copy /Y backend\src\server.js selected-files\ >nul
copy /Y backend\src\utils\*.js selected-files\ >nul
copy /Y frontend\src\lib\*.js selected-files\ >nul

echo.
echo Latest files copied successfully.
pause