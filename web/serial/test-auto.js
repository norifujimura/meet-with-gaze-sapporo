
var fps = 40;

var writer=null;
var rElem,gElem,bElem,wElem;
var port;
var state = "init";

navigator.serial.addEventListener("connect", (event) => {
    console.log("Connect");
    // TODO: Automatically open event.target or warn user a port is available.
    const { usbProductId, usbVendorId } = port.getInfo();
    console.log("usbProductId "+usbProductId);
    console.log("usbVendorId "+usbVendorId);

    writer = port.writable.getWriter();

});
  
navigator.serial.addEventListener("disconnect", (event) => {
    console.log("Disconnect");
    // TODO: Remove |event.target| from the UI.
    // If the serial port was opened, a stream error would be observed as well.
    // Allow the serial port to be closed later.
    writer.releaseLock();
});


function setup(){
    console.log("Setup")
    frameRate(fps);

    rElem = document.getElementById('r'); // input要素
    rElem.addEventListener('input', onR,false); 
    gElem = document.getElementById('g'); // input要素
    gElem.addEventListener('input', onG,false); 
    bElem = document.getElementById('b'); // input要素
    bElem.addEventListener('input', onB,false); 
    wElem = document.getElementById('w'); // input要素
    wElem.addEventListener('input', onW,false); 



     //navigator.serial.addEventListener("connect", conneced());
     openPortAuto();
}

const onR = (e) =>{
    r= parseInt(e.target.value);
}

const onG = (e) =>{
    g= parseInt(e.target.value);
}

const onB = (e) =>{
    b= parseInt(e.target.value);
}

const onW = (e) =>{
    w= parseInt(e.target.value);
}

function draw(){
    console.log("Draw");
    const data = new Uint8Array([r, g, b, w]); // hello
    //await writer.write(data);
    if(writer!=null){
        writer.write(data);
    }
}

async function closePort(){
    writer.close();
    writer.forget();
}

async function openPortAuto(){
    console.log("Open");
    //https://stackoverflow.com/questions/70194330/web-serial-api-port-open-without-user-gesture

    // Get all serial ports the user has previously granted the website access to.
    const ports = await navigator.serial.getPorts();

    console.log("Ports lemgth:"+ports.length);

    // Assuming the first one is the one you want to open...
    port = ports[0];

    const { usbProductId, usbVendorId } = port.getInfo();
    console.log("usbProductId "+usbProductId);
    console.log("usbVendorId "+usbVendorId);

    // Open serial port without user gesture.
    await port.open({ baudRate: 9600 });
}






