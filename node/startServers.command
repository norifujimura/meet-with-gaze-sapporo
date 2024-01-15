#!/bin/sh
script_dir=$(cd $(dirname $0); pwd)
echo $script_dir

string_server=$(cd $(dirname $0); pwd)
string_server+="/startStringServer2.sh"

echo "Call shell"
source  $string_server
echo "Called shell"

web_server=$(cd $(dirname $0); pwd)
web_server+="/startWebServer.sh"

echo "Call webServer"
source  $web_server 
echo "Called webServer"

