/*
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleWrite.cpp
    Ported to Arduino ESP32 by Evandro Copercini
*/
//#include <M5Unified.h>
#include <M5Core2.h>
//#include <Adafruit_NeoPixel.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEAdvertising *pAdvertising;

std::string stdBleName;
String bleName = "08";

//JSON

DynamicJsonDocument doc(1024);

int x,y;
/*

//bool isReceived=false;

int ledPin = 32;
int ledBrightness = 200;
int ledLength = 360;//150 for 5m

Adafruit_NeoPixel strip(ledLength, ledPin , NEO_GRBW + NEO_KHZ800);


static void showRGBW();
static void setLight();
*/
static void showValue();
static void parseReceivedJson(uint8_t *payload);
static void parseReceivedJson2(uint8_t *payload);
static void sendAlive(BLECharacteristic *pCharacteristic);

class MyCallbacks: public BLECharacteristicCallbacks {
    
    void onWrite(BLECharacteristic *pCharacteristic) {

      Serial.println("onWrite");
      //char json[] = pCharacteristic->getValue();
      std::string values = pCharacteristic->getValue();

      /*
      if (values.length() == 2){

        x=int(values[0]);
        y=int(values[1]);
        
        showValue();
      }
      */

      
      //https://forum.arduino.cc/t/esp32-arduino-ble-how-to-read-hex-data/893030/11
      uint8_t* rawValues = pCharacteristic->getData();

      parseReceivedJson(rawValues);
      //parseReceivedJson2(json);

      //Serial.println(*rawValues,HEX);

      //ref https://note.com/katsushun89/n/nbd3201ed7536

      x = doc["x"];
      y = doc["y"];
      
      showValue();
      sendAlive(pCharacteristic);
      



      /*
      if (values.length() > 0) {
        Serial.println("*********");
        Serial.print("New value2x: ");
        for (int i = 0; i < values.length(); i++){
          String s = String(int(values[i]))+";";
          Serial.print(s);
        }
        Serial.println();
        Serial.println("*********");
      }
      

      if (values.length() == 2){

        int plusMinus=int(values[0]);
        int  v=int(values[1]);

        
        if(plusMinus==1){
          value = -1*v;
        }else if (plusMinus==2){
          value = v;
        }
        
        showValue();
        
       
        //showRGBW();
        //setLight();
        //setLight(0,255,0,255);
        //isReceived = true;
      }
      */
    }
};

void setup() {

  //auto cfg = M5.config();
  //M5.begin(cfg); 
  M5.begin();

  M5.Lcd.fillScreen(BLACK);
  Serial.begin(115200);
  //setupLED();

  //value=0;
  x=0,y=0;
  
  //setLight();

  stdBleName = bleName.c_str();

  showName();
  
  Serial.println("1- Download and install an BLE scanner app in your phone");
  Serial.println("2- Scan for BLE devices in the app");
  Serial.println("3- Connect to MyESP32");
  Serial.println("4- Go to CUSTOM CHARACTERISTIC in CUSTOM SERVICE and write something");
  Serial.println("5- See the magic =)");

  //https://github.com/nkolban/ESP32_BLE_Arduino/blob/master/src/BLEDevice.h
  
  BLEDevice::init(stdBleName);
  //BLEDevice::init("03");
  BLEServer *pServer = BLEDevice::createServer();

  BLEService *pService = pServer->createService(SERVICE_UUID);
   

  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic->setCallbacks(new MyCallbacks());

  //pCharacteristic->setValue("Hello World");
  pService->start();

  //BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising = pServer->getAdvertising();
  pAdvertising->setScanResponse(true);
  pAdvertising->start();

  pCharacteristic->setValue("Hello World");
}

void loop() {
  // put your main code here, to run repeatedly:
  pAdvertising->start();
  delay(60);
  /*
  if(isReceived){
    showRGBW();
    isReceived = false;
  }
  */
}






