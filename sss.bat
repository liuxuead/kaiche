@echo off
cd /d D:\H5\tunshi
echo 启动本地服务器...
echo 手机访问地址：http://192.168.24.83:8080
python -m http.server 8080 --bind 0.0.0.0
pause