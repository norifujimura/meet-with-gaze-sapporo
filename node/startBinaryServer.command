#!/bin/sh
script_dir=$(cd $(dirname $0); pwd)
echo $script_dir
script_dir+="/serverBinary.js"
#script_dir+="/startBinaryServer.sh"
echo "Start websocket binary server"
node $script_dir 
#source  $script_dir
echo "Webscoket binary server has started"
