#!/bin/sh
script_dir=$(cd $(dirname $0); pwd)
echo $script_dir
script_dir+="/serverString.js"
echo "Start websocket string server"
node $script_dir &
echo "Webscoket string server has started"