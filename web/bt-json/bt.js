
var characteristicOne;

function checkBTConnection(){
  //if(characteristicOne==undefined){
  if(state=="ready"){
    document.getElementById("one").className = "btn btn-success";
  }else{
    document.getElementById("one").className = "btn btn-primary";
  }
}

function log(msg){
  console.log(msg);
}

function myLog(msg){
  console.log(msg);
}

//BLE
async function connect() {
    try {
      myLog('Requesting Bluetooth Device...');
      //https://webbluetoothcg.github.io/web-bluetooth/#dom-requestdeviceoptions-optionalservices
      
      let options = {};
      options.acceptAllDevices = true;

      options.optionalServices=['4fafc201-1fb5-459e-8fcc-c5c9c331914b'];

      const device = await navigator.bluetooth.requestDevice(options);
  
      myLog('Connecting to GATT Server...');
      const server = await device.gatt.connect();
  
      myLog('Getting Service...');
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
  
      myLog('Getting Characteristic...');
      //const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      characteristicOne = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
  
      state = "connected";
      /*
      myLog('Reading Message');
      var value;
      //characteristicOne = await characteristic.readValue();
      value = await characteristic.readValue();
        //value is DataView
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

      var enc = new TextDecoder();

      myLog('> Message is ' + enc.decode(value) + ':txt');

      //let message = Uint8Array.of(1);
      let message = new Uint8Array([2,4,8,16,32,64]);
      await characteristicOne.writeValue(message);
      */

      //state = "connected";
      
    } catch(error) {
      myLog('Argh! ' + error);
    }
  }



  async function sendOne(vOne,vTwo){
    if(characteristicOne!=undefined){
      console.log("send one:"+vOne+" two:"+vTwo);

      //let myObj = { x: vOne, y:vTwo };
      //let myString = JSON.stringify(myObj);

      //let message = new TextEncoder().encode(myString);
      let message = new Uint8Array([vOne,vTwo]);
      myLog("message:"+message);

      try {
          await characteristicOne.writeValue(message);
        } catch (error) {
          myLog('Argh! ' + error);
        }
    }
  }

  async function sendTwo(vOne,vTwo){
    if(characteristicOne!=undefined){
      myLog("sendTwo:"+vOne+" two:"+vTwo);

      let myObj = { x: vOne, y:vTwo };
      let myString = JSON.stringify(myObj);

      let message = new TextEncoder().encode(myString);
      //let message = new Uint8Array([vOne,vTwo]);
      myLog("message:"+message);

      try {
          await characteristicOne.writeValue(message);
        } catch (error) {
          myLog('Argh! ' + error);
        }
    }
  }

  async function receive(){
      myLog("Wait for message");
      var value;
      //characteristicOne = await characteristic.readValue();
      value = await characteristicOne.readValue();
        //value is DataView
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

      var enc = new TextDecoder();

      myLog('> Message is ' + enc.decode(value) + ':txt');

      state = "ready";

      //let message = Uint8Array.of(1);
      //let message = new Uint8Array([2,4,8,16,32,64]);
      //await characteristicOne.writeValue(message);
  }

  async function sendTest(isOne){
    if(isOne){
      if(characteristicOne!=undefined){
        console.log("send One:1,2,3,4");
        let message = new Uint8Array([1,2,3,4]);
        try {
            await characteristicOne.writeValue(message);
          } catch (error) {
            myLog('Argh! ' + error);
          }
      }
    }else{
      if(characteristicTwo!=undefined){
        console.log("send Two:1,2,3,4");
        let message = new Uint8Array([1,2,3,4]);
        try {
            await characteristicTwo.writeValue(message);
          } catch (error) {
            myLog('Argh! ' + error);
          }
      }
    } 
  }

  /*
  async function send(vOne,vTwo){

    if(btCharacteristic!=undefined){
      console.log("send one:"+vOne+" two:"+vTwo);

      //let myObj = { x: vOne, y:vTwo };
      //let myString = JSON.stringify(myObj);

      //let message = new TextEncoder().encode(myString);
      let message = new Uint8Array([100,100]);
      console.log("message:"+message);
      try {
          await btCharacteristic.writeValue(message);
        } catch (error) {
          log('Argh! ' + error);
        }
    }
  }

  async function sendTest(){
    if(btCharacteristic!=undefined){
      console.log("send One:1,2,3,4");
      let message = new Uint8Array([1,2,3,4]);
      try {
          await btCharacteristic.writeValue(message);
        } catch (error) {
          log('Argh! ' + error);
        }
    }
  }
  */