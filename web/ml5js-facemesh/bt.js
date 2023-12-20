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

  async function send(isOne){
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
  }