//#include <M5Core2.h>

void setupLED(){
  strip.updateLength(ledLength);
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(ledBrightness);
}

void setLight(){
  String s = "light:"+String(r)+","+String(g)+","+String(b)+","+String(w);
  Serial.println(s);
  strip.fill(strip.Color(r, g, b, w));
  strip.show();
}

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
    //blended = M5.Lcd.alphaBlend(128, rgbColor, whiteColor);
  
    M5.Lcd.fillRect(0,40, 320, 240-82, blended); 
}

void showLED(const void *mem, uint32_t len){
  bin = (uint8_t*) mem;
  for(int i=0; i<len;i++){
    int index = i;

    int w;
    w = bin[index];
    uint32_t  c = strip.Color(w,w,w,w);
    strip.setPixelColor(i, c);         //  Set pixel's color (in RAM)
  }
  strip.show();  
}
/*
void showValue(const void *mem, uint32_t len){

  M5.Lcd.fillRect(0,100,320,120, BLACK);
  bin = (uint8_t*) mem;
  for(int i = 0;i<len;i++){
    int index = i;

    int w;
    w = bin[index];

    uint16_t rgbColor = 0;
    rgbColor = M5.Lcd.color565(w, w, w);

    M5.Lcd.drawLine(i, 100,i,240,rgbColor); 
  }
}
*/
/*
void colorWipeTwo(int r,int g,int b,int w, int wait) {

  for(int i=0; i<strip.numPixels(); i++) { // For each pixel in strip...
  //for(int i=0; i<LED_COUNT;i++){
    int counter = 0;
    for(int j=i; j>0; j--) {
      int rTwo = r-counter;
      if(rTwo<0){
        rTwo = 0;
      }
      int gTwo = g-counter;
      if(gTwo<0){
        gTwo = 0;
      }
      int bTwo = b-counter;
      if(bTwo<0){
        bTwo = 0;
      }
     int wTwo = w-counter;
      if(wTwo<0){
        wTwo = 0;
      }

      uint32_t  c = strip.Color(  rTwo,   gTwo,   bTwo, wTwo);
      strip.setPixelColor(j, c);         //  Set pixel's color (in RAM)
      //counter++;

      int step = 288/strip.numPixels();
      counter+=step;
    }

    strip.show();                          //  Update strip to match
    delay(wait);                           //  Pause for a moment
  }
}
*/
