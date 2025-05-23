void setupLED(){
  strip.updateLength(ledLength);
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(ledBrightness);
}

void showLED(){
  /*
  for(int i=0; i<(len-1);i++){
    int index = round(i/4);

    int w;
    w = buf[i];

    uint32_t  c = strip.Color(w,w,w,w);
    strip.setPixelColor(index, c);         //  Set pixel's color (in RAM)
  }
  */
  for(int i=0; i<len;i++){
    //int index = round(i/4);

    int w;
    w = buf[i];

    uint32_t  c = strip.Color(0,0,0,w);
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