//#include <M5Unified.h>
#include <M5Core2.h>
#include <Adafruit_NeoPixel.h>
//const int TIMEOUT = 30000;

//binary
uint8_t* bin;

const int len = 1201;
int rLen = 0;
int count = 0;
//https://qiita.com/hikoalpha/items/c4931230bebdf3c3955b
uint8_t buf[len];

//static void showValue(const void* mem, uint32_t len);

//https://arduino.stackexchange.com/questions/8457/serial-read-vs-serial-readbytes

//LED
int ledPin = 32;
int ledBrightness = 200;
int ledLength = 300;  //150 for 5m

Adafruit_NeoPixel strip(ledLength, ledPin, NEO_GRBW + NEO_KHZ800);

int vBreathTop = 100;
int vCounter = 0;
bool vDirection = true;
uint8_t red=  100;
uint8_t green = 50;
uint8_t blue = 50;

int degCounter = 0;


RTC_TimeTypeDef RTCtime;
RTC_TimeTypeDef RTCtime_Now;
char timeStrbuff[64];

//static void HslToRgb(double hue, double saturation, double lightness);

void setup() {
  M5.begin();
  Serial.begin(115200);
  setupLED();

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextSize(2);
  M5.Lcd.println("OK");
  demo();

  HslToRgb(0.0,0.7,0.3);

  RTCtime.Hours   = 00;  // Set the time.  设置时间
  RTCtime.Minutes = 00;
  RTCtime.Seconds = 00;

  RTCtime_Now.Hours   = 00;
  RTCtime_Now.Minutes = 00;
  RTCtime_Now.Seconds = 00;

  M5.Rtc.SetTime(&RTCtime_Now);
}

void loop() {

  if(360<degCounter){
    degCounter = 0;
  }

  degCounter+=1;

  if(vBreathTop<vCounter){
    vDirection = false;
    vCounter = vBreathTop;
  }

  if(0>vCounter){
    vDirection = true;
    vCounter = 0;
  }

  //bleathOne(vCounter);
  //bleathTwo(vCounter,hCounter);
  //bleathSin(200,degCounter);
  bleathSin2(200,degCounter);

  if(vDirection){
      vCounter++;
  }else{
      vCounter--;
  }

  M5.Lcd.setCursor(0, 140);
  M5.Rtc.GetTime(&RTCtime_Now);  // Gets the current time.  获取当前时间
  sprintf(timeStrbuff,
          "RTC Time Now is %02d:%02d:%02d",  // Stores real-time time data to
                                              // timeStrbuff.
          // 将实时时间数据存储至timeStrbuff
          RTCtime_Now.Hours, RTCtime_Now.Minutes, RTCtime_Now.Seconds);
  M5.Lcd.println(
      timeStrbuff);  // Screen printing output timeStrbuff.  输出timeStrbuff

  double minuteRatio = RTCtime_Now.Minutes/60.0;

  HslToRgb(minuteRatio,0.7,0.3);

  delay(10);
  
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
}

/*
void serialEvent() {
    //https://arduinogetstarted.com/reference/serial-readbytesuntil
  // check if data is available
  if (Serial.available() > 0) {
    char c = char(255);
    rLen = Serial.readBytesUntil(c, buf, len);
    if(rLen==(len-1)){
      showValue();
      showLED();
    }
    
    Serial.flush();
  }
}
*/

/*
void serialEvent() {

  uint8_t character= 255;

  rLen = Serial.readBytesUntil(char(255), buf, len);
  //Serial.readBytes(buf, len);
  
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
  
  //Serial.flush();
  //showValue();
  
  
}
*/


void showValue(){

  M5.Lcd.fillRect(0,100,320,120, BLACK);

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
    int x = round(i/4);
    if(x>300){
      x = 300;
    }
    //M5.Lcd.drawLine(x, 120,x,240,wColor); 
    if(w>0){
      M5.Lcd.fillRect(x-1, 120,4,120, wColor);
    }
    
  }

  M5.Lcd.setTextSize(2);
  M5.Lcd.println(rLen, DEC);
  
}

float degToRad(float deg){
  float rad = (deg * 71) / 4068;
  return rad;
}


