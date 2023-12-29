/*
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleWrite.cpp
    Ported to Arduino ESP32 by Evandro Copercini
*/
//#include <M5Unified.h>
#include <M5Core2.h>
//#include <Adafruit_NeoPixel.h>

#include <WiFi.h>
#include <WebSocketsClient.h>

#include <ArduinoJson.h>

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

WebSocketsClient webSocket;
String wsState;

//JSON
DynamicJsonDocument doc(1024);

//SSID of your network
char ssid[] = "akiko_network";
//password of your WPA Network
char pwd[] = "akobagus";

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
static void showWiFiState();
static void showWsState();
static void parseReceivedJson(uint8_t *payload);
static void parseReceivedJson2(uint8_t *payload);
static void sendAlive();

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
      wsState = "WStype_DISCONNECTED";
			break;
		case WStype_CONNECTED:
			Serial.printf("[WSc] Connected to url: %s\n", payload);
			//webSocket.sendTXT("Connected");
      wsState = "WStype_CONNECTED";
			break;
		case WStype_TEXT:
			//Serial.printf("[WSc] get text: %s\n", payload);
        parseReceivedJson(payload);
        //ref https://note.com/katsushun89/n/nbd3201ed7536

        x = doc["x"];
        y = doc["y"];

        wsState = "WStype_TEXT";
      
        //showValue();
        //sendAlive();
			break;
		case WStype_BIN:
      wsState = "WStype_BIN";
		case WStype_ERROR:	
      wsState = "WStype_ERROR";		
		case WStype_FRAGMENT_TEXT_START:
      wsState = "WStype_FRAGMENT_TEXT_START";	
		case WStype_FRAGMENT_BIN_START:
      wsState = "WStype_FRAGMENT_BIN_START";	
		case WStype_FRAGMENT:
      wsState = "WStype_FRAGMENT";
		case WStype_FRAGMENT_FIN:
      wsState = "WStype_FRAGMENT_FIN";
			break;
	}
}

void setupWiFi()
{
 WiFi.begin(ssid, pwd);

 // Wait some time to connect to wifi
 for(int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
     Serial.print(".");
     delay(1000);
 }

 // Check if connected to wifi
 if(WiFi.status() != WL_CONNECTED) {
     Serial.println("No Wifi!");
     return;
 }

 Serial.println("Connected to Wifi, Connecting to server.");
	// server address, port and URL
	webSocket.begin("192.168.86.22", 8888, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

	// use HTTP Basic Authorization this is optional remove if not needed
	//webSocket.setAuthorization("user", "Password");

	// try ever 5000 again if connection has failed
	webSocket.setReconnectInterval(1000);
}


void setup() {

  Serial.begin(115200);
  delay(500);

  M5.begin();
  setupWiFi();

  M5.Lcd.fillScreen(BLACK);

  //setupLED();

  //value=0;
  x=0,y=0;
}

void loop() {
  delay(0);
  webSocket.loop();
  //M5.update();
  M5.Lcd.clear();
  showWiFiState();
  showWsState();
  showValue();
}






