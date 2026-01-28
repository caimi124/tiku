@echo off
chcp 65001 >nul
cd /d "e:\tiku"

if exist ".git\index.lock" (
    echo Removing index.lock...
    del /f /q ".git\index.lock"
)

echo Adding, committing, pushing...
git add components/ui/SmartContentRenderer.tsx
git commit -m "optimize disinfectant table layout reduce red highlight"
git push
echo.
echo Done. If index.lock error appears, delete E:\tiku\.git\index.lock and run again.
pause
