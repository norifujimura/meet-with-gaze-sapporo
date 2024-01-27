//static void HslToRgb(double hue, double saturation, double lightness, uint8_t &red, uint8_t &green, uint8_t &blue);

void HslToRgb(double h, double s, double l) {
  double r, g, b;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    auto q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    auto p = 2 * l - q;
    r = hue_to_rgb(p, q, h + 1 / 3.0);
    g = hue_to_rgb(p, q, h);
    b = hue_to_rgb(p, q, h - 1 / 3.0);
  }
  red   = static_cast<uint8_t>(r * 255);
  green = static_cast<uint8_t>(g * 255);
  blue  = static_cast<uint8_t>(b * 255);
}

double hue_to_rgb(double p, double q, double t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6.0) return p + (q - p) * 6 * t;
  if (t < 1 / 2.0) return q;
  if (t < 2 / 3.0) return p + (q - p) * (2 / 3.0 - t) * 6;
  return p;
}