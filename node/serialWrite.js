const { SerialPort } = require('serialport')

//
//   /dev/tty.usbserial-54780102541
const DEVICE_PATH = '/dev/tty.wchusbserial54780102541'
//const DEVICE_PATH = '/dev/tty.usbserial-54780102541'


var sByteArray = new Uint8Array(1201);

SerialPort.list();
//const serialport = new SerialPort({ path: DEVICE_PATH, baudRate: 9600 })

sByteArray.fill(100);
sByteArray[1200]=255;

/*
var sp = new SerialPort({
    path: DEVICE_PATH,
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    autoOpen: false,
    //parser: serialport.parsers.readline("\n")   // ※修正：パースの単位を改行で行う
});
*/

var sp = new SerialPort({
    path: DEVICE_PATH,
    baudRate: 500000,
    autoOpen: false,
    //parser: serialport.parsers.readline("\n")   // ※修正：パースの単位を改行で行う
});


open();

function open () {
    sp.open(function (error){
        if (error) {
            console.log('Error while opening the port ' + error);
            setTimeout(open, 10000); // next attempt to open after 10s
        } else {
            console.log('CST port open');
            sp.write(sByteArray);
        }
    });
}

sp.on('open', function() {
    function send() {

        sp.write(sByteArray, function (err) {
            if (err)
                console.log('Error on write: ' +  err.message)

            sp.drain(() => console.log('DONE'));
        });
    }

    setInterval(send, 1000);
});


/*
var sp = new SerialPort({
    path: DEVICE_PATH,
    baudRate: 500000,
});
*/

/*
sp.open(function (error) {
    if (error) {
        console.log('Error while opening the port ' + error);
    } else {
        console.log('CST port open');
        sp.write(sByteArray);
        
        sp.write(sByteArray, function (err, result) {
            if (err) {
                console.log('Error while sending message : ' + err);
            }
            if (result) {
                console.log('Response received after sending message : ' + result);
            }    
        });
        
    }              
});
*/


//sp.write(sByteArray)

/*
setTimeout(test, 4000);

function test(){
    sp.write('ROBOT POWER ON\n')
    sp.write('ROBOT POWER ON\n')
}
*/


