#!/bin/sh


#script_dir=$(cd $(dirname $0); pwd)
#echo $script_dir

echo "Start http server"
#python -m http.server 8888 &
screen -d -m python -m http.server 8888
echo "Http server has started"