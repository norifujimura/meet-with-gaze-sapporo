var mx,my,rx,ry;
var state = "init";
var socket;
var timerThresh =5000;
var connectTimerStartTime;

function myLog(msg){
  console.log(msg);
}

function setup() {
  createCanvas(320,240);
  noStroke();
  rectMode(CENTER);
  frameRate(10);
  connect();
}

function connect(){
  socket = new WebSocket("ws://192.168.86.22:8888");
  state = "connecting";
  document.getElementById("monitorOne").innerHTML = "Connecting";


  socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
    state = "connected";

    //document.getElementById("socket").className = "btn btn-success";
    document.getElementById("monitorOne").innerHTML = "Connected";
  });

    // Listen for messages
  socket.addEventListener("message", (event) => {
    myLog("Message from server ", event.data);
    receive(event.data);
  });

  socket.addEventListener("close", () => {
    state = "closed";
    document.getElementById("monitorOne").innerHTML = "Closed";
  });

  socket.addEventListener("error", (error) =>  {
    state = "error";
    document.getElementById("monitorOne").innerHTML = "Error:"+error.data;
  });

}

function draw() {


  background(230);

  if(0<mouseX && mouseX<320 && 0<mouseY && mouseY<240){
    mx = round(mouseX-160);
    my = round(mouseY-120);
    fill(244, 122, 158);
    rect(mx+160, my+120, 10,10);
    sendData();
  }

  fill(158, 122, 244);
  rect(rx+160, ry+120, 10,10);


}

function sendData(){
  //myLog("sendData");

  document.getElementById("monitorTwo").innerHTML = "value to send: "+mx+":"+my;
  //sendOne(mx+160, my+120);
  if(state == "connected"){
    send(mx, my);
  }
}

function send(vOne,vTwo){
  myLog("sendTwo:"+vOne+" two:"+vTwo);

  let myObj = { x: vOne, y:vTwo };
  let myString = JSON.stringify(myObj);
  myLog("message:"+myString);
  socket.send(myString);
}

function receive(value){

  const obj = JSON.parse(value);

  myLog("X:"+obj.x+" Y:"+obj.y);
  rx = obj.x;
  ry = obj.y;
}
