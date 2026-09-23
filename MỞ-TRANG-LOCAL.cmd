@echo off
cd /d "%~dp0"
start "VN/34 Collection" "http://localhost:8080"
node local-server.js
