void setupLED(){
  strip.updateLength(ledLength);
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(ledBrightness);
}

void showLED(){
  for(int i = 0;i<len;i++){
    int w;
    w = buf[i];
    uint16_t wColor = 0;
    wColor = M5.Lcd.color565(w, w, w);
    uint32_t  c = strip.Color(w,w,w,w);
    strip.setPixelColor(i, c);         //  Set pixel's color (in RAM)
  }
  strip.show();  
}

void demo(){
  for(int i=0; i<ledLength;i++){

    int w=60;

    uint32_t  c = strip.Color(w,w,w,w);
    strip.setPixelColor(i, c);         //  Set pixel's color (in RAM)
  }
  strip.show();  
}