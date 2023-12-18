/*
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleWrite.cpp
    Ported to Arduino ESP32 by Evandro Copercini
*/
#include <M5Core2.h>
#include <Adafruit_NeoPixel.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEAdvertising *pAdvertising;

std::string stdBleName;
String bleName = "10";

int r,g,b,w;
//bool isReceived=false;

int ledPin = 32;
int ledBrightness = 200;
int ledLength = 360;//150 for 5m

Adafruit_NeoPixel strip(ledLength, ledPin , NEO_GRBW + NEO_KHZ800);

static void showRGBW();
static void setLight();

class MyCallbacks: public BLECharacteristicCallbacks {
    
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      if (value.length() > 0) {
        Serial.println("*********");
        Serial.print("New value2: ");
        for (int i = 0; i < value.length(); i++){
          String s = String(int(value[i]));
          Serial.print(s);
        }
        Serial.println();
        Serial.println("*********");
      }
      

      if (value.length() == 4) {
        r = int(value[0]);
        g = int(value[1]);
        b = int(value[2]);
        w = int(value[3]);

        showRGBW();
        setLight();

          r=0;
          g=0;
          b=0;
          w=0;
        //setLight(0,255,0,255);
        //isReceived = true;
      }
    }
};

void setup() {
  M5.begin();
  M5.Lcd.fillScreen(BLACK);
  Serial.begin(115200);
  setupLED();

  /*
  strip.fill(strip.Color(255,255,255,255));
  strip.show();
  */
  r=0;
  g=255;
  b=0;
  w=255;
  
  setLight();

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

  pCharacteristic->setValue("Hello World");
  pService->start();

  //BLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising = pServer->getAdvertising();
  pAdvertising->setScanResponse(true);
  pAdvertising->start();
}

void loop() {
  // put your main code here, to run repeatedly:
  pAdvertising->start();
  delay(2000);
  /*
  if(isReceived){
    showRGBW();
    isReceived = false;
  }
  */
}
