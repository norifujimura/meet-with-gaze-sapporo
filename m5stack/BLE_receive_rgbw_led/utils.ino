#include <M5Core2.h>

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
  
    M5.Lcd.fillRect(0,40, 320, 240-82, whiteColor); 
}

void showName(){
    Serial.println(bleName);

    M5.Lcd.setCursor(0, 240-240);
    M5.Lcd.setTextSize(4);
    M5.Lcd.print(bleName);
}
