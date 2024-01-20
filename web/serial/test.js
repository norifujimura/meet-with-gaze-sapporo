
navigator.serial.addEventListener("connect", (event) => {
    console.log("Connect");
    // TODO: Automatically open event.target or warn user a port is available.
});
  
navigator.serial.addEventListener("disconnect", (event) => {
    console.log("Disconnect");
    // TODO: Remove |event.target| from the UI.
    // If the serial port was opened, a stream error would be observed as well.
    // Allow the serial port to be closed later.
    writer.releaseLock();
});

var fps = 40;

var writer=null;
var rElem,gElem,bElem,wElem;

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
    /*
    const data = new Uint8Array([r, g, b, w]); // hello
    //await writer.write(data);
    if(writer!=null){
        writer.write(data);
    }
    */
}

async function sendButton(){
    if(writer!=null){
        //writer.write("TestPrint\n");
        const data = new Uint8Array([104, 101, 108, 108, 111,10]); // hello
        await writer.write(data);

    }
}

async function closePort(){


    writer.close();
    writer.forget();
}

async function openPort(){
    console.log("Open");
    // Prompt user to select any serial port.
    const port = await navigator.serial.requestPort();
    // Wait for the serial port to open.

    const { usbProductId, usbVendorId } = port.getInfo();
    console.log("usbProductId "+usbProductId);
    console.log("usbVendorId "+usbVendorId);
    await port.open({ baudRate: 115200});

    //const writer = port.writable.getWriter();

    writer = port.writable.getWriter();

    const data = new Uint8Array([104, 101, 108, 108, 111,10]); // hello
    await writer.write(data);


    // Allow the serial port to be closed later.
    //writer.releaseLock();

    //const data = new Uint8Array([104, 101, 108, 108]); // hello
    //await writer.write(data);

    // Allow the serial port to be closed later.
    //writer.releaseLock();

    /*

    //const reader = port.readable.getReader();

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    // Listen to data coming from the serial device.
    var buffer = "";
    startTime = new Date();
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
        }
        // value is a Uint8Array.

        var v = value.replace("�", "");

        //pass if empty
        if(v != ''){
            if(v.slice( -1 ) == '\n'){
                //add is it ends with \n
                v = buffer + v;
                v = v.replace("\n", "");

                var valueArray = v.split(",");

                var basePressure = parseFloat(valueArray[0]);
                var pressure = parseFloat(valueArray[1]);
                if(basePressure  != null){
                    updateData(basePressure, pressure);
                }
                
                //string += v;
                //console.log(v+"\n");
                //console.log("base:"+basePressure+" pressure:"+pressure+"\n");

                buffer = "";
            }else{
                //wait if not 
                buffer = v;
            }
        }
    }
    */
}

