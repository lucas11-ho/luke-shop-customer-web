@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1 || (echo ERROR: Node.js is required.& pause & exit /b 1)
call npm run verify
set CODE=%ERRORLEVEL%
if not "%CODE%"=="0" (echo FAILURE: verify returned %CODE%.& pause& exit /b %CODE%)
echo PASS: Luke Shop Customer Web v0.5.0 source verification.
pause
endlocal
