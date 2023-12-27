var mx,my;
var state = "init";

function setup() {
  createCanvas(320,240);
  noStroke();
  rectMode(CENTER);
  frameRate(20);
}

function draw() {
  checkBTConnection();


  mx = round(mouseX-160);
  my = round(mouseY-120);
  background(230);
  fill(244, 122, 158);
  rect(mx+160, my+120, 10,10);

  sendData();
}

function sendData(){
  //myLog("sendData");
  if(monitor == null){
    monitor = document.getElementById("monitor");
  }

  monitor.innerHTML = "value to send: "+mx+":"+my;
  //sendOne(mx+160, my+120);
  if(state == "connected" || state == "ready"){
    sendTwo(mx, my);
    state = "sent";
  }

  if(state == "sent"){
    receive();
  }
  
}
