@echo off
chcp 65001 >nul
cd /d "e:\tiku"

if exist ".git\index.lock" (
    echo [git-safe] Removing index.lock...
    del /f /q ".git\index.lock"
)

git %*
