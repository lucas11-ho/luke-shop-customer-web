@echo off
setlocal
cd /d "%~dp0"
echo =============================================================
echo Luke Shop Customer Web v0.5.0 - Storefront Renderer v3
echo =============================================================
where node >nul 2>&1 || (echo ERROR: Node.js is required.& pause & exit /b 1)
for /f "tokens=*" %%i in ('node -p "process.versions.node"') do set NODEVER=%%i
for /f "tokens=*" %%i in ('node -p "Number(process.versions.node.split('.')[0])"') do set NODEMAJOR=%%i
echo Node: %NODEVER%
if %NODEMAJOR% LSS 24 (echo ERROR: Node.js 24 or newer is required.& pause & exit /b 1)
if not exist .env (
  copy /y .env.example .env >nul
  echo Created .env from .env.example
)
echo.
echo [1/4] Installing dependencies...
call npm install --no-audit --no-fund
if errorlevel 1 (echo ERROR: npm install failed.& pause & exit /b 1)
echo [2/4] Verifying source...
call npm run verify
if errorlevel 1 (echo ERROR: verify failed.& pause & exit /b 1)
echo [3/4] Building production bundle...
call npm run build
if errorlevel 1 (echo ERROR: production build failed.& pause & exit /b 1)
echo [4/4] Starting Customer Web on http://localhost:4174 ...
echo Press Ctrl+C to stop.
call npm run dev
endlocal
