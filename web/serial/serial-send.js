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

var l= 1201;

var sByteArray = new Uint8Array(l);
var writer;
var counter;

function setup(){
    console.log("Setup")
    frameRate(25)
    createCanvas(l,255);
    noStroke();
    fill(0);
    rect(0,0,l,255);

    sByteArray.fill(0);
}

function draw(){
    console.log("Draw");
   // const data = new Uint8Array([r, g, b, w]); // hello
    //await writer.write(data);


    if(0<mouseX && mouseX<l && 0<mouseY && mouseY<255){
        mx = mouseX;
        my = mouseY;


        fill(255);
        rect(mx,0, 1,120);

        sByteArray.fill(0);
        //var tempx = round(mx/3*2);
        //sByteArray[tempx] = 254;

        /*
        var c = my;
        if(c==255){
            c = 244;
        }
        sByteArray[mx]= c;
        sByteArray[l] = 255;
        */

        sByteArray[mx]= my;
        sByteArray[l-1] = 255;

        if(writer!=undefined){
            //writer.write(sByteArray.buffer);
            writer.write(sByteArray);
        }

        fill(0);
        rect(0,0,l,255);

        fill(my);
        rect(mx,0,1,255);
      //writer.write(sByteArray.buffer);
    }

    /*
    if(counter>l || counter==l){
        counter = 0;
    }
    sByteArray.fill(127);
    sByteArray[counter]= 254;
    sByteArray[l]= 255;

    if(writer!=undefined){
        writer.write(sByteArray.buffer);
    }

    fill(254);
    rect(counter,0,1,120);

    counter++;
    */
}

async function closePort(){
    // Allow the serial port to be closed later.
    writer.releaseLock();

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
    await port.open({ baudRate: 500000 });

    //const writer = port.writable.getWriter();

    writer = port.writable.getWriter();

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