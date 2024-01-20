//import WebSocket, { WebSocketServer } from 'ws';

const { SerialPort } = require('serialport')
const DEVICE_PATH = '/dev/tty.wchusbserial54780102541'

/*
var sp = new SerialPort({
    path: DEVICE_PATH,
    baudRate: 500000,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    //parser: serialport.parsers.readline("\n")   // ※修正：パースの単位を改行で行う
});
*/

var sp = new SerialPort({
  path: DEVICE_PATH,
  baudRate: 500000,
  autoOpen: false,
  //parser: serialport.parsers.readline("\n")   // ※修正：パースの単位を改行で行う
});

const server = require('ws').Server;
const wss = new server({ port: 8889 });
//ws.binaryType = 'arraybuffer';

//https://github.com/websockets/ws?tab=readme-ov-file#sending-binary-data

openSerial();

function openSerial () {
    sp.open(function (error){
        if (error) {
            console.log('Error while opening the port ' + error);
            setTimeout(openSerial, 10000); // next attempt to open after 10s
        } else {
            console.log('CST port open');
            //sp.write(sByteArray);
        }
    });
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  //var sByteArray = new Uint8Array(200);
  //sByteArray.fill(127);

  ws.on('message', function message(data) {
    //console.log(data);

    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {

      //exclude itself
      //https://github.com/websockets/ws?tab=readme-ov-file#sending-binary-data
      //if (client !== ws && client.readyState === ws.OPEN) {
        //client.send(sByteArray);
        client.send(data);
        sp.write(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('good bye.');
  });

});
