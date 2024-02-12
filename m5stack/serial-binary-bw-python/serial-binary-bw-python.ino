//#include <M5Unified.h>
#include <M5Core2.h>
const int TIMEOUT = 30000;

//binary
//binary
uint8_t* bin;


const int len = 150;
int rLen = 0;
int count = 0;
//https://qiita.com/hikoalpha/items/c4931230bebdf3c3955b
uint8_t buf[(len+1)];

//static void showValue(const void* mem, uint32_t len);

//https://arduino.stackexchange.com/questions/8457/serial-read-vs-serial-readbytes



String inputString = "";      // a String to hold incoming data
bool stringComplete = false;  // whether the string is complete

void setup() {
  M5.begin();
  Serial.begin(115200);// up tp 500000
  M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setTextSize(2);
  M5.Lcd.println("OK");
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



  

  //delay(1);
}
/*
void serialEvent() {
  M5.Lcd.println("rcv0");
    //https://arduinogetstarted.com/reference/serial-readbytesuntil
  // check if data is available
  if (Serial.available() > 0) {
    char c = char(255);
     M5.Lcd.println("rcv1");
    rLen = Serial.readBytesUntil(c, buf, len);
     M5.Lcd.println("rLen"+rLen);
      M5.Lcd.println("len"+len);
     M5.Lcd.println("rcv2");
    if(rLen==len){
      showValue();
    }
    Serial.flush();
  }
}
*/


void serialEvent() {
  M5.Lcd.println("se");
    //https://arduinogetstarted.com/reference/serial-readbytesuntil
  // check if data is available
  if (Serial.available() > 0) {
    char c = char(255);
    rLen = Serial.readBytesUntil(c, buf, (len+1));
    if(rLen==len){
      showValue();
    }
    M5.Lcd.print("se2 rLen:");
    M5.Lcd.println(rLen,DEC);
    //M5.Lcd.println("rLen:"+rLen);
    
    Serial.flush();
  }
}



void showValue(){

  M5.Lcd.fillRect(0,120,320,120, BLACK);

  /*
  for(int i = 0;i<len;i++){
    int w;
    w = buf[i];
    
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
    
    uint16_t rgbColor = 0;
    rgbColor = M5.Lcd.color565(w, w, w);
    //rgbColor = M5.Lcd.color565(10,10,10);

    int x = i;
    if(x>319){
      x = 319;
    }

    M5.Lcd.drawLine(x, 100,x,240,rgbColor); 
  }
  */

  for(int i = 0;i<len;i++){
    int w;
    w = buf[i];
    uint16_t wColor = 0;
    wColor = M5.Lcd.color565(w, w, w);

    /*
    int x = i;
    */
    /*
    int x = round(i/4);
    if(x>300){
      x = 300;
    }
    */
    //M5.Lcd.drawLine(x, 120,x,240,wColor); 
    if(w>0){
      M5.Lcd.fillRect(i, 120,1,120, wColor);
    }
    
  }

  M5.Lcd.setTextSize(2);
  M5.Lcd.println(rLen, DEC);
  
}


