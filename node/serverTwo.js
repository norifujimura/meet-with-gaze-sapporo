const server = require('ws').Server;
const ws = new server({ port: 8888 });

ws.on('connection', socket => {
  socket.on('message', ms => {
    msg=ms.toString();
    ws.clients.forEach(client => {
    //echo the message
      //console.log(msg);
      client.send(msg);
    });
  });

  socket.on('close', () => {
    console.log('good bye.');
  });
});