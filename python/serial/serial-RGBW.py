import cv2
import numpy as np
import serial
import time

def mouse_event(event, x, y, flags, param):
    global start_time,fps_text_location
    end_time = time.time()

    time_diff = end_time - start_time #sec
    fps = 1.0 / time_diff
        
    start_time = time.time()
    
    cv2.rectangle(canvas, (0,0), (width,height), (0, 0, 0), cv2.FILLED, cv2.LINE_AA)
    fps_text = 'FPS = ' + str(int(fps))
    cv2.putText(canvas, fps_text, fps_text_location, cv2.FONT_HERSHEY_PLAIN,
                1, (0, 0, 255), 1)

    #last array is for stop char
    data = [0] * (length*4+1) 
    
    if 100<y:
        if 0<x and x<length:
            brightness = y-100
            data[x*4+3] = brightness
            cv2.rectangle(canvas, (x,100), (x+1,356), (brightness,brightness,brightness), cv2.FILLED, cv2.LINE_AA)
        if length<x and x<(length*2):
            xTemp = x-300
            red = y - 100
            data[xTemp*4] = red
            cv2.rectangle(canvas, (x,100), (x+1,356), (0,0,red), cv2.FILLED, cv2.LINE_AA)
            
    cv2.imshow("X", canvas)
            
    
    data[length*4] = 255
    send_binary =bytes(data)

    ser.write(send_binary)
    
    time.sleep(0.01)

#60LEDs per 1m 
width = 600 # length*2
height = 356 # 
length = 300
fps_text_location = (10, 50)
start_time = time.time()

ser = None

try:
    ser = serial.Serial('/dev/tty.wchusbserial54BB0211361', 500000) # No13
    print(ser.portstr)
except serial.SerialException as e:
    print("SerialError", e)
    try:
        ser = serial.Serial('/dev/tty.usbserial-02258F8C', 500000) # 02
        print(ser.portstr)
    except serial.SerialException as e:
        print("SerialError", e)
        try:
            ser = serial.Serial('/dev/cu.usbserial-022D5C74', 500000) # 06
            print(ser.portstr)
        except serial.SerialException as e:
            print("SerialError", e)
            try:
                ser = serial.Serial('/dev/cu.wchusbserial54780117081', 500000) # 08
                print(ser.portstr)
            except serial.SerialException as e:
                print("SerialError", e)
                try:
                    ser = serial.Serial('/dev/cu.wchusbserial54780264591', 500000) # 07
                    print(ser.portstr)
                except serial.SerialException as e:
                    print("SerialError", e)
                    try:
                        ser = serial.Serial('/dev/ttyACM0', 500000) # 07
                        print(ser.portstr)
                    except serial.SerialException as e:
                        print("SerialError", e)
                        try:
                            ser = serial.Serial('/dev/ttyAMA0', 500000) # 07
                            print(ser.portstr)
                        except serial.SerialException as e:
                            print("SerialError", e)

#last array is for stop char
data = [0] * (length*4+1) #for RGBW
#print(data)
data[length*4] = 255
#print(data)
# convert list to bytearray

canvas = np.zeros((height,width,3), np.uint8)
cv2.putText(canvas, "hello", (10, 20),
               cv2.FONT_HERSHEY_PLAIN, 1.5,
               (255, 255, 255), 1, cv2.LINE_AA)

cv2.startWindowThread()
cv2.imshow("X", canvas)
cv2.setMouseCallback("X", mouse_event)
key = cv2.waitKey(0)

if key == ord('q'):            #qを押した時の処理
    cv2.waitKey(1)
    cv2.destroyAllWindows()  
    ser.close()
    cv2.waitKey(1)