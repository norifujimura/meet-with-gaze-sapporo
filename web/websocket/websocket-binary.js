var mx,my,rx,ry;
var state = "init";
var socket;
var id;//for interval check

var l= 320;

var sByteArray = new Uint8Array(l*4);
var rByteArray = new Uint8Array(l*4);
var rDataView;

function myLog(msg){
  console.log(msg);
}

function setup() {
  createCanvas(320,240);
  noStroke();
  //rectMode(CENTER);
  frameRate(10);
  id = setInterval(check, 1000);
  connect();

  sByteArray.fill(0);
  rByteArray.fill(0);
  rDataView = new DataView(rByteArray.buffer);
}

function check(){
  var now = socket.readyState;
  if(now == 0){
    document.getElementById("socket").innerHTML = "WS Connecting";
  }
  if(now == 1){
    document.getElementById("socket").innerHTML = "WS Open";
  }
  if(now == 2){
    document.getElementById("socket").innerHTML = "WS Closing";
  }
  if(now == 3){
    document.getElementById("socket").innerHTML = "WS Closed";
    if(state == "closed"){
      connect();
    }
  }
}

function connect(){
  //socket = new WebSocket("ws://192.168.86.22:8888");
  socket = new WebSocket("ws://localhost:8889");
  socket.binaryType = "arraybuffer";

  state = "connecting";
  document.getElementById("state").innerHTML = "Connecting";

  socket.addEventListener("open", (event) => {
    socket.bufferType = "arraybuffer";//for binary
    //socket.send("Hello Server!");
    state = "connected";
    
    //document.getElementById("socket").className = "btn btn-success";
    document.getElementById("state").innerHTML = "Connected";
  });

  /*
    // Listen for messages
  socket.addEventListener("message", (event) => {
    myLog("Message from server ", event.data);

    receive(event.data);
  });
  */

  // Listen for messages
  socket.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("ArrayBuffer");
      // binary frame
      //const view = new DataView(event.data);
      rDataView = new DataView(event.data);

      drawTwo();
      //console.log(view.getInt32(0));
    } else {
      console.log("not ArrayBuffer");
      // text frame
      console.log(event.data);
    }
  });

  socket.addEventListener("close", () => {
    state = "closed";
    document.getElementById("state").innerHTML = "Closed";
  });

  socket.addEventListener("error", (error) =>  {
    state = "error";
    document.getElementById("state").innerHTML = "Error:"+error.data;
  });

}

function draw() {

  //background(230);
  fill(230);
  rect(0,0,320,120);

  if(0<mouseX && mouseX<320 && 0<mouseY && mouseY<120){
    mx = mouseX;
    my = mouseY;
    colorMode(HSB, 120);
    let c = color(my,100,100);
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    colorMode(RGB);
    fill(r, g, b);
    rect(mx,0, 1,120);
    sendData(r,g,b);
  }

  //fill(158, 122, 244);
  //rect(rx+160, ry+120, 10,10);

}

function drawTwo(){
  fill(230);
  rect(0,120,320,120);

  for(let i =0;i<l;i++){
    var r = rDataView.getUint8(i*4);
    var g = rDataView.getUint8(i*4+1);
    var b = rDataView.getUint8(i*4+2);
    //myLog(c);
    fill(r,g,b);
    rect(i,121, 1,120);
  }
}

function sendData(r,g,b){
  //myLog("sendData");

  document.getElementById("message").innerHTML = "value to send: "+mx;
  //sendOne(mx+160, my+120);
  if(state == "connected"){
    sByteArray.fill(0);

    for(let i =0;i<mx;i++){
      sByteArray[i*4] = r;
      sByteArray[i*4+1] = g;
      sByteArray[i*4+2] = b;
    }

    myLog("Send length:"+sByteArray.length);

    for(let i=0;i<l;i++){
      myLog(sByteArray[i]+",");
    }

    socket.send(sByteArray.buffer);
  }
}

function receive(value){
  myLog("Receive");

  rByteArray = new Uint8Array(value, 0, value.length);
  //if ( value instanceof ArrayBuffer ) {
    
    //rByteArray = new Uint8Array(value.arrayBuffer());
    myLog("R:"+value.toString());
  //}
}
