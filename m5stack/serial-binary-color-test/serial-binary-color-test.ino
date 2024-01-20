//#include <M5Unified.h>
#include <M5Core2.h>
const int TIMEOUT = 3000;

//binary
//binary
uint8_t* bin;


const int len = 300;
int count = 0;
//https://qiita.com/hikoalpha/items/c4931230bebdf3c3955b
uint8_t buf[len*2];

//static void showValue(const void* mem, uint32_t len);

//https://arduino.stackexchange.com/questions/8457/serial-read-vs-serial-readbytes



String inputString = "";      // a String to hold incoming data
bool stringComplete = false;  // whether the string is complete

void setup() {
  M5.begin();
  Serial.begin(500000);
  M5.Lcd.fillScreen(BLACK);
}

void loop() {
  /*
  unsigned long timeout = millis() + TIMEOUT;
  uint8_t inIndex = 0;
  while ( ((int32_t)(millis() - timeout) < 0) && (inIndex < (sizeof(inData)/sizeof(inData[0])))) {
      if (Serial.available() > 0) {
          // read the incoming byte:
          inData[inIndex] = Serial.read();
          if (inIndex == length) {
              break;
          }
      }
  }
  */

  delay(10);
}


void serialEvent() {
  Serial.readBytes(buf, len*2);
  
  /*
  uint8_t index= 0;

  while(Serial.available()>0){
    buf[index] = Serial.read();
    if(buf[index] == 255){
      break;
    }
    //Serial.readBytes(buf, len);
    index++;
  }
  */

  /*
  while(Serial.available()>0){
      //buf[index] = Serial.read();
      Serial.readBytes(buf, len);
     //index++;
  }
  */
  Serial.flush();
  
  showValue();
}


void showValue(){

  M5.Lcd.fillRect(0,120,320,120, BLACK);
  
  for(int i = 0;i<len;i++){
    int r,g,b,w;
    r = buf[i*2];
    w = buf[i*2+1];
    /*
    if(w == 254){
      uint16_t rgbColor = 0;
      rgbColor = M5.Lcd.color565(255, 255, 255);
      //rgbColor = M5.Lcd.color565(10,10,10);

      M5.Lcd.drawLine(i, 100,i,240,rgbColor); 
    }else{
      uint16_t rgbColor = 0;
      rgbColor = M5.Lcd.color565(0,0,0);
      //rgbColor = M5.Lcd.color565(10,10,10);

      M5.Lcd.drawLine(i, 100,i,240,rgbColor); 
    }
    */
  
    uint16_t rgbColor = 0;
    rgbColor = M5.Lcd.color565(r, r, r);
    M5.Lcd.drawLine(i, 120,i,180,rgbColor); 

    uint16_t wColor = 0;
    wColor = M5.Lcd.color565(w, w, w);
    M5.Lcd.drawLine(i, 180,i,240,wColor); 


  }

  M5.Lcd.setTextSize(2);
  M5.Lcd.print("Received ");
  
}


