#!/bin/sh

script_dir=$(cd $(dirname $0); pwd)
echo $script_dir

echo lsof -nti:8888 | xargs kill -9

echo "Start http server"
python -m http.server 8888 &
# starting simple HTTP server with Python in background
#screen -d -m python -m http.server 7777 

# killing process running with screen in background
#kill -9 `top -n 1 | pgrep screen`

echo "Http server has started"ls