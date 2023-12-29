//import WebSocket, { WebSocketServer } from 'ws';

const server = require('ws').Server;
const wss = new server({ port: 8888 });
//ws.binaryType = 'arraybuffer';

//https://github.com/websockets/ws?tab=readme-ov-file#sending-binary-data

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
      }
    });
  });

  ws.on('close', () => {
    console.log('good bye.');
  });

});
