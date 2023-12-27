// index.js

const server = require('ws').Server;
const ws = new server({ port: 8888 });

ws.on('connection', socket => {
  console.log('connected!');

  socket.on('message', ms => {

    msg=ms.toString();
    console.log("user sent:",msg)
    //console.log(ms);
  });

  socket.on('close', () => {
    console.log('good bye.');
  });
});