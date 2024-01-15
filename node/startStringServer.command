#!/bin/sh
script_dir=$(cd $(dirname $0); pwd)
echo $script_dir
#script_dir+="/serverString.js"
script_dir+="/startStringServer.sh"
echo "Start websocket string server"
#node $script_dir 
source  $script_dir
echo "Webscoket string server has started"