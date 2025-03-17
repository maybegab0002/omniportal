@echo off
echo Deploying Omni Portal to GitHub Pages with custom domain...

REM Check if .env file exists
if not exist .env (
  echo Error: .env file not found!
  echo Please create a .env file with your Supabase credentials:
  echo VITE_SUPABASE_URL=your_supabase_url
  echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  exit /b 1
)

REM Load environment variables from .env file
for /f "tokens=*" %%a in (.env) do set %%a

REM Check if Supabase credentials are set
if "%VITE_SUPABASE_URL%"=="" (
  echo Error: VITE_SUPABASE_URL not found in .env file!
  exit /b 1
)

if "%VITE_SUPABASE_ANON_KEY%"=="" (
  echo Error: VITE_SUPABASE_ANON_KEY not found in .env file!
  exit /b 1
)

REM Set custom domain build mode
set BUILD_MODE=CUSTOM_DOMAIN

REM Run the deployment
echo Using Supabase URL: %VITE_SUPABASE_URL%
echo Using custom domain: omniportals.ph
echo Building with custom domain configuration (BUILD_MODE=CUSTOM_DOMAIN)

npm run deploy

echo Deployment complete! Your site should be available at https://omniportals.ph
echo Note: It may take a few minutes for DNS changes to propagate.
