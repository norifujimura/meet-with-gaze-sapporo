#!/bin/sh
script_dir=$(cd $(dirname $0); pwd)
echo $script_dir
script_dir+="/serverString.js"
node $script_dir &
echo "やっほー！"