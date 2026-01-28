@echo off
chcp 65001 >nul
cd /d "e:\tiku"

if exist ".git\index.lock" (
    echo Removing index.lock...
    del /f /q ".git\index.lock"
)

echo Adding files...
git add deploy-push.bat git-safe.bat "docs/index-lock-问题成因与处置.md"

echo Committing...
git commit -m "docs: index-lock analysis and bat scripts (ASCII-only for CMD)"

echo Pushing...
git push

echo.
echo Done. If index.lock error appears, run this script again from a new CMD (with Cursor closed).
pause
