#include <M5Core2.h>

/*
void showRGBW(){
    String s = String(r)+","+String(g)+","+String(b)+","+String(w);
    Serial.println(s);

    M5.Lcd.setCursor(0, 240-40);
    M5.Lcd.setTextSize(2);
    M5.Lcd.print(s);

    uint16_t rgbColor = 0;
    rgbColor = M5.Lcd.color565(r, g, b);
    uint16_t whiteColor = 0;
    whiteColor = M5.Lcd.color565(w,w,w);
    
    uint16_t blended = 0;
    blended = M5.Lcd.alphaBlend(128, rgbColor, whiteColor);
  
    M5.Lcd.fillRect(0,40, 320, 240-82, blended); 
}
*/

void sendAlive(){
  webSocket.sendTXT("alive");
}

void parseReceivedJson(uint8_t *payload){
 char *json = (char *)payload;
 DeserializationError error = deserializeJson(doc, json);
 
 if (error) {
   Serial.print(F("deserializeJson() failed: "));
   Serial.println(error.c_str());
   return;
 }
  //deserializeJson(doc, json);
 //JsonObject obj = doc.as<JsonObject>();
}

void parseReceivedJson2(char json[]){
  DeserializationError error = deserializeJson(doc, json);
 
 if (error) {
   Serial.print(F("deserializeJson() failed: "));
   Serial.println(error.c_str());
   return;
 }
  
  //deserializeJson(doc, json);
 //JsonObject obj = doc.as<JsonObject>();

}

void showWiFiState(){
  //https://www.arduino.cc/reference/en/libraries/wifi/wifi.status/

  M5.Lcd.setTextSize(2);

  M5.Lcd.setCursor(0, 40);
  M5.Lcd.print("SSID:");
  M5.Lcd.print(ssid);

  M5.Lcd.setCursor(0, 60);

  if(WiFi.status() == WL_CONNECTED) {
    M5.Lcd.print("WL_CONNECTED");
  }

  if(WiFi.status() == WL_IDLE_STATUS) {
    M5.Lcd.print("WL_IDLE_STATUS");
  }

  if(WiFi.status() == WL_CONNECT_FAILED) {
    M5.Lcd.print("WL_CONNECT_FAILED");
  }

  if(WiFi.status() == WL_CONNECTION_LOST) {
    M5.Lcd.print("WL_CONNECTION_LOST");
  }

  if(WiFi.status() == WL_DISCONNECTED) {
    M5.Lcd.print("WL_DISCONNECTED");
  }

  if(WiFi.status() == WL_NO_SSID_AVAIL) {
    M5.Lcd.print("WL_NO_SSID_AVAIL");
  }

  if(WiFi.status() == WL_SCAN_COMPLETED) {
    M5.Lcd.print("WL_SCAN_COMPLETED");
  }
}

void showWsState(){
  //https://www.arduino.cc/reference/en/libraries/wifi/wifi.status/

  M5.Lcd.setTextSize(2);

  M5.Lcd.setCursor(0, 80);
  M5.Lcd.print(wsState);
}

void showValue(const void *mem, uint32_t len){

  M5.Lcd.fillRect(0,100,320,120, BLACK);
  bin = (uint8_t*) mem;
  for(int i = 0;i<len/4;i++){
    int index = i*4;

    int r,g,b,w;
    r = bin[index];
    g = bin[index+1];
    b = bin[index+2];
    w = bin[index+3];

    uint16_t rgbColor = 0;
    rgbColor = M5.Lcd.color565(r, g, b);

    M5.Lcd.drawLine(i, 100,i,240,rgbColor); 
  }
}

void showValue(){

  M5.Lcd.fillRect(x+160, y+120, 4, 4, WHITE);

  M5.Lcd.setCursor(0, 240-40);
  M5.Lcd.setTextSize(2);
  
  M5.Lcd.print(x);
  M5.Lcd.print(":");
  M5.Lcd.print(y);
  M5.Lcd.print(" ");
}

/*
void showValue(){

  M5.Lcd.clear();

  String s = String(value);
  Serial.println(s);

  M5.Lcd.setCursor(0, 240-40);
  M5.Lcd.setTextSize(2);
  M5.Lcd.print(s);
  M5.Lcd.print(" ");

  M5.Lcd.drawLine(0, 120, 320,120,DARKGREY); 

  int x = 0, y = 0;


  if(-160<value && value<0){
    //right
    x = -1*value + 160;
    y = 118;
    M5.Lcd.fillRect(x, y, 4, 4, WHITE);
  }else if(0<value && value<160){
    //left
    x = 160 - value;
    y = 118;
    M5.Lcd.fillRect(x, y, 4, 4, WHITE);
  }
  
  uint16_t rgbColor = 0;
  rgbColor = M5.Lcd.color565(r, g, b);
  uint16_t whiteColor = 0;
  whiteColor = M5.Lcd.color565(w,w,w);
  
  uint16_t blended = 0;
  blended = M5.Lcd.alphaBlend(128, rgbColor, whiteColor);

  M5.Lcd.fillRect(0,40, 320, 240-82, blended); 
  
}
*/
