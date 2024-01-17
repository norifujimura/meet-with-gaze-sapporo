let lightLength = 5000; //5m
let lightNum = 300; //60 per m

var stateBinary = "init";
let port = 8889;
var socketBinary;
var idBinary;//for interval check

var sByteArray = new Uint8Array(lightNum);
var rByteArray = new Uint8Array(lightNum);
var rDataView;

function setupBinaryServer() {
    id = setInterval(checkBinary, 1000);
    connectBinary();

    sByteArray.fill(0);
    rByteArray.fill(0);
    rDataView = new DataView(rByteArray.buffer);
}

function checkBinary(){
    var now = socketBinary.readyState;

    if(now == 0){
        document.getElementById("socketBinary").innerHTML = "WS Connecting";
    }
    if(now == 1){
        document.getElementById("socketBinary").innerHTML = "WS Open";
    }
    if(now == 2){
        document.getElementById("socketBinary").innerHTML = "WS Closing";
    }
    if(now == 3){
        document.getElementById("socketBinary").innerHTML = "WS Closed";
        if(state == "closed"){
            connectBinary();
        }
    }
}

function connectBinary(){
    //socket = new WebSocket("ws://192.168.86.22:8888");
    socketBinary = new WebSocket("ws://localhost:8889");
    socketBinary.binaryType = "arraybuffer";

    stateBinary = "connecting";
    document.getElementById("socketBinary").innerHTML = "Connecting";

    socketBinary.addEventListener("open", (event) => {
        socketBinary.bufferType = "arraybuffer";//for binary
        //socket.send("Hello Server!");
        stateBinary = "connected";
        
        //document.getElementById("socket").className = "btn btn-success";
        document.getElementById("socketBinary").innerHTML = "Connected";
    });

    /*
        // Listen for messages
    socket.addEventListener("message", (event) => {
        myLog("Message from server ", event.data);

        receive(event.data);
    });
    */

    // Listen for messages
    socketBinary.addEventListener("message", (event) => {
        if (event.data instanceof ArrayBuffer) {
        console.log("ArrayBuffer");
        // binary frame
        //const view = new DataView(event.data);
        rDataView = new DataView(event.data);

        drawRCVData(lightBuffer);
        //console.log(view.getInt32(0));
        } else {
        console.log("not ArrayBuffer");
        // text frame
        console.log(event.data);
        }
    });

    socketBinary.addEventListener("close", () => {
        state = "closed";
        document.getElementById("socketBinary").innerHTML = "Closed";
    });

    socketBinary.addEventListener("error", (error) =>  {
        state = "error";
        document.getElementById("socketBinary").innerHTML = "Error:"+error.data;
    });

}

function processLight(){
    if(stateBinary == "connected"){
        sByteArray.fill(0);
        for (let i = 0; i < faces.length; i += 1) {
            let f=faces[i];
            if(f.isValid){
              if(f.hasIntersect == false){
                  continue;
              }
              //f.intersect.x
              writeSendData(f.intersect.x);
            }
        }
        socketBinary.send(sByteArray.buffer);
    }
}

function writeSendData(mm){
    let pos = lightLength/2 + mm;
    var ratio = lightLength / lightNum;
    var index = round(pos /ratio);
    sByteArray[index] = 255;
}

function drawSendData(g){
  g.fill(127);
  g.rect(0,0,videoWidth,videoHeight/2);

  var ratio = videoWidth / lightNum;

  for(let i=0;i<lightNum;i++){
    var c = sByteArray[i];
    g.fill(c);
    g.rect(ratio * i,0, ratio,videoHeight/2);
  }
}

function drawRCVData(g){
    g.fill(200);
    g.rect(0,videoHeight/2,videoWidth,videoHeight/2);

    var ratio = videoWidth / lightNum;

    for(let i=0;i<lightNum;i++){
        //var c = rByteArray[i];
        var c = rDataView.getUint8(i);
        g.fill(c);
        g.rect(ratio * i,videoHeight/2, ratio,videoHeight/2);
    } 
}







