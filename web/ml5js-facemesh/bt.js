
var characteristicOne,characteristicTwo;

function checkBTConnection(){
  if(characteristicOne==undefined){
    document.getElementById("one").className = "btn btn-primary";
  }else{
    document.getElementById("one").className = "btn btn-success";
  }
  if(characteristicTwo==undefined){
    document.getElementById("two").className = "btn btn-primary";
  }else{
    document.getElementById("two").className = "btn btn-success";
  }
}

//BLE
async function connect(isOne) {

    try {
      log('Requesting Bluetooth Device...');
      //https://webbluetoothcg.github.io/web-bluetooth/#dom-requestdeviceoptions-optionalservices
      
      let options = {};
      options.acceptAllDevices = true;

      options.optionalServices=['4fafc201-1fb5-459e-8fcc-c5c9c331914b'];

      const device = await navigator.bluetooth.requestDevice(options);
  
      log('Connecting to GATT Server...');
      const server = await device.gatt.connect();
  
      log('Getting Service...');
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
  
      log('Getting Characteristic...');
      //const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      if(isOne){
        characteristicOne = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      }else{
        characteristicTwo = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      }
  
      log('Reading Message');
      var value;
      if(isOne){
        characteristicOne = await characteristic.readValue();
      }else{
        characteristicTwo = await characteristic.readValue();
      }
        //value is DataView
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

      var enc = new TextDecoder();

      log('> Message is ' + enc.decode(value) + ':txt');

      //let message = Uint8Array.of(1);
      let message = new Uint8Array([2,4,8,16,32,64]);
      if(isOne){
        await characteristicOne.writeValue(message);
      }else{
        await characteristicTwo.writeValue(message);
      }
      
    } catch(error) {
      log('Argh! ' + error);
    }
  }

  function log(msg){
    console.log(msg);
  }

  async function send(v){
    if(characteristicOne!=undefined){
      console.log("send:"+v);

      // -600 to + 600  to  -256 to +256

      var ratio = 256/600;

      var plusMinus= 0;
      var value= 0;
      if(v<0){
        plusMinus= 1;
        value = round(v * ratio * -1);
      }else{
        plusMinus= 2;
        value = round(v * ratio);
      }

      let message = new Uint8Array([plusMinus,value]);
      try {
          await characteristicOne.writeValue(message);
        } catch (error) {
          log('Argh! ' + error);
        }
    }

    /*
    var rgbw = this.rgbw;

    if(rgbw.w<255){

      if(isOne){
        if(characteristicOne!=undefined){
          console.log("send One:"+rgbw.r);
          let message = new Uint8Array([rgbw.r,rgbw.g,rgbw.b,rgbw.w]);
          try {
              await characteristicOne.writeValue(message);
            } catch (error) {
              log('Argh! ' + error);
            }
        }
      }else{
        if(characteristicTwo!=undefined){
          console.log("send Two:"+rgbw.r);
          let message = new Uint8Array([rgbw.r,rgbw.g,rgbw.b,rgbw.w]);
          try {
              await characteristicTwo.writeValue(message);
            } catch (error) {
              log('Argh! ' + error);
            }
        }
      }
    }
    */
  }

  async function sendTest(isOne){
    if(isOne){
      if(characteristicOne!=undefined){
        console.log("send One:1,2,3,4");
        let message = new Uint8Array([1,2,3,4]);
        try {
            await characteristicOne.writeValue(message);
          } catch (error) {
            log('Argh! ' + error);
          }
      }
    }else{
      if(characteristicTwo!=undefined){
        console.log("send Two:1,2,3,4");
        let message = new Uint8Array([1,2,3,4]);
        try {
            await characteristicTwo.writeValue(message);
          } catch (error) {
            log('Argh! ' + error);
          }
      }
    } 
  }