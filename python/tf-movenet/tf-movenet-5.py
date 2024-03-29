import cv2
import numpy as np
import serial
import time
import logging
import sys
import utils
import math

#from operator import attrgetter

from typing import List, Tuple
from data import Person

from ml import Classifier
from ml import Movenet
from ml import MoveNetMultiPose
from ml import Posenet

width = 1024
height = 720
#width = 1920
#height = 1080
#camera_id = "video2-720p-20fps.mp4"
#camera_id = "video0-10fps.mp4"
camera_id =0

class SerialLed:

    def __init__(self):
        self.ser = None
        self.connect()
        
    def connect(self):
        try:
            self.ser = serial.Serial('/dev/tty.wchusbserial54BB0211361', 500000) # No13
            print(self.ser.portstr)
        except serial.SerialException as e:
            print("SerialError", e)
            try:
                self.ser = serial.Serial('/dev/tty.usbserial-02258F8C', 500000) # 02
                print(self.ser.portstr)
            except serial.SerialException as e:
                print("SerialError", e)
                try:
                    self.ser = serial.Serial('/dev/cu.usbserial-022D5C74', 500000) # 06
                    print(self.ser.portstr)
                except serial.SerialException as e:
                    print("SerialError", e)
                    try:
                        self.ser = serial.Serial('/dev/cu.wchusbserial54780117081', 500000) # 08
                        print(self.ser.portstr)
                    except serial.SerialException as e:
                        print("SerialError", e)
                        try:
                            self.ser = serial.Serial('/dev/cu.wchusbserial54780264591', 500000) # 07
                            print(self.ser.portstr)
                        except serial.SerialException as e:
                            print("SerialError", e)
                            try:
                                self.ser = serial.Serial('/dev/ttyACM0', 500000) # 07
                                print(self.ser.portstr)
                            except serial.SerialException as e:
                                print("SerialError", e)
                                try:
                                    self.ser = serial.Serial('/dev/ttyAMA0', 500000) # 07
                                    print(self.ser.portstr)
                                except serial.SerialException as e:
                                    print("SerialError", e)
                                    try:
                                        self.ser = serial.Serial('/dev/ttyUSB0', 500000) # 07
                                        print(self.ser.portstr)
                                    except serial.SerialException as e:
                                        print("SerialError", e)

    def send(self,data,led_length):
        
        for dataum in data:
            if dataum == 255:
                dataum = 254
                
        data[led_length*4] = 255
        send_binary =bytes(data)
        if self.ser:
            self.ser.write(send_binary)
        else:
            self.connect()
    def close(self):
        if self.ser!=None:
            self.ser.close()

class Led:
    def __init__(self):
        self.r=0
        self.g=0
        self.b=0
        self.w=0
    
    def clear(self):
        self.r=0
        self.g=0
        self.b=0
        self.w=0        

class Leds:
    def __init__(self,length):
        self.length = length
        self.leds = []
        for i in range(length):
            led = Led()
            self.leds.append(led)
    def clear(self):
        for led in self.leds:
            led.clear()
    def set_white(self,index,white):
        if index>0 and index<self.length:
            self.leds[index].w = white
    def set_red(self,index,red):
        if index>0 and index<self.length:
            self.leds[index].r = red
    def set_green(self,index,green):
        if index>0 and index<self.length:
            self.leds[index].g = green
    def set_color(self,index,r,g,b):
        if index>0 and index<self.length:
            self.leds[index].r = r
            self.leds[index].g = g
            self.leds[index].b = b

class Part:
    def __init__(self,):
        self.isExist = False
        self.pos=(0,0)
        
    def center(self,a,b):
        x = round((a[0]+b[0])/2)
        y = round((a[1]+b[1])/2)
        return (x,y)
    
class Bound(Part):
    def __init__(self):
        self.x=0
        self.y=0
        self.w=0
        self.h=0
        self.x2=0
        self.y2=0
        self.l_u = (0,0)
        self.r_d = (0,0)
        
    def process(self):
        self.l_u = (self.x,self.y)
        self.r_d = (self.x2,self.y2)
        self.pos = self.center(self.l_u,self.r_d)
        
class Head(Part):
    def __init__(self,):
        self.color  = (64,64,255)
        
        self.head = None
        self.heading = 0
        self.eye_line_length_mm = 1500 #in mm
        self.eye_line_length_pixel = 0 
        self.eye_line_pos=(0,0)
        
        self.eyes_pos=(0,0)
        
        self.ear_to_shoulder_mm = 184 #mm
        self.pixel_per_mm = 1
        self.history = []
        self.history_length = 10

    def init(self,nose,eye_l,eye_r,ear_l,ear_r,shoulder_l,shoulder_r):

        #2D screen pos
        self.pos = self.center(ear_l.pos,ear_r.pos)
        self.eyes_pos = self.center(eye_l.pos,eye_r.pos)
        
        self.isExist = True
        
        #culc heading by 2D
        a = np.array([self.pos[0], self.pos[1]])
        b = np.array([self.eyes_pos[0], self.eyes_pos[1]])
        vec = a - b
        self.heading =   math.degrees(np.arctan2(vec[0], vec[1])) +90
        # self.heading =   -1 * math.degrees(np.arctan2(vec[0], vec[1])) +90
        
        #culc shoulder to ear distance
        
        shoulder_center_pos = self.center(shoulder_l.pos,shoulder_r.pos)
        
        ear_to_shoulder_pixel = math.dist(self.pos,shoulder_center_pos)
        self.pixel_per_mm =   ear_to_shoulder_pixel / self.ear_to_shoulder_mm #pixel_per_mm
        self.eye_line_length_pixel = self.eye_line_length_mm * self.pixel_per_mm
        

        #culc eye line
        radians = math.radians(self.heading)
        eye_line_x = self.pos[0]+int(np.cos(radians)*self.eye_line_length_pixel)
        eye_line_y = self.pos[1]+int(np.sin(radians)*self.eye_line_length_pixel)
        self.eye_line_pos = (eye_line_x,eye_line_y)
        self.history.append({"heading":self.heading,"pixel_per_mm":self.pixel_per_mm})
        
        
    def update(self,history,pixel_per_mm):
        self.history = history
        self.history.append({"heading":self.heading,"pixel_per_mm":pixel_per_mm})
        
        if len(self.history)>self.history_length:
            del self.history[1]
            
        #self.heading_history.sort()
        #self.heading = self.heading_history[int(len(self.heading_history)/2)]
        
        '''
        #Median filter
        self.heading = self.heading_history[round(len(self.heading_history)/2)]["heading"]
        self.pixel_per_mm = self.heading_history[round(len(self.heading_history)/2)]["pixel_per_mm"]
        '''
        
        #Mean filter
        headings = []
        pixel_per_mms = []
        
        for history in self.history:
            headings.append(history["heading"])
            pixel_per_mms.append(history["pixel_per_mm"])
        #print("headeing length")
        #print(len(headings))
        self.heading = sum(headings)/len(headings)
        self.pixel_per_mm = sum(pixel_per_mms)/len(pixel_per_mms)
        
        self.eye_line_length_pixel = self.eye_line_length_mm * self.pixel_per_mm
        
        #culc eye line
        radians = math.radians(self.heading)
        eye_line_x = self.pos[0]+int(np.cos(radians)*self.eye_line_length_pixel)
        eye_line_y = self.pos[1]+int(np.sin(radians)*self.eye_line_length_pixel)
        self.eye_line_pos = (eye_line_x,eye_line_y)
        
class Body(Part):
    def __init__(self,person,id,
                 keypoint_threshold: float = 0.1,
                instance_threshold: float = 0.1
                ):
        self.hip_to_shoulder_mm = 530 #mm
        self.hip_to_shoulder_pixels = None
        self.pixel_per_mm = 1
        
        self.person= person
        #self.id = person.id
        self.id = None
        self.id_initial = id
        self.center_x = 0
        self.keypoints = person.keypoints   
        self.bound = Bound()
        self.bound_upper = Bound()

        self.nose=Part()
        self.leye=Part()
        self.reye=Part()
        self.lear=Part()
        self.rear=Part()
        self.lshoulder=Part()
        self.rshoulder=Part()
        self.lelbow = Part()
        self.relbow = Part()
        self.lhand = Part()
        self.rhand = Part()
        self.lhip = Part()
        self.rhip = Part()
        self.lknee = Part()
        self.rknee = Part()
        self.lfoot = Part()
        self.rfoot = Part()
        self.parts = [
            self.nose,
            self.leye,
            self.reye,
            self.lear,
            self.rear,
            self.lshoulder,
            self.rshoulder,
            self.lelbow,
            self.relbow,
            self.lhand,
            self.rhand,
            self.lhip,
            self.rhip,
            self.lknee,
            self.rknee,
            self.lfoot,
            self.rfoot
        ]
        
        #self.isExist = False
        
        self.shoulder_center = Part()
        self.hip_center = Part()
        
        self.head = None
        self.disntances_to_previous = []
        
        #boundary functions
        self.min_x = 0
        self.max_x = 0
        self.isWrap = False
        
        for i in range(len(self.keypoints)):
            point = self.keypoints[i]
            if point.score >= keypoint_threshold:
                self.parts[i].pos = point.coordinate
                self.parts[i].isExist = True
                
        if self.lshoulder.isExist and self.rshoulder.isExist and self.lhip.isExist and self.rhip.isExist:
            self.isExist = True
        else:
            self.isExist = False
            
        if self.isExist==True:
            
            #culc bound box
            minx = 10000
            miny = 10000
            maxx = 0
            maxy = 0

            for part in self.parts:
                if(part.isExist):
                    x = part.pos[0]
                    y = part.pos[1]
                    if maxx<x:
                        maxx = x
                    if maxy<y:
                        maxy = y
                    if x<minx:
                        minx = x
                    if y<miny:
                        miny = y
            self.bound.x = minx
            self.bound.y = miny
            self.bound.x2 = maxx
            self.bound.y2 = maxy
            self.bound.w = maxx-minx
            self.bound.h = maxy-miny
            self.bound.process()

            #culc bound box-upper half
            minx = 10000
            miny = 10000
            maxx = 0
            maxy = 0

            for i in range(7):
                part = self.parts[i]
                if(part.isExist):
                    x = part.pos[0]
                    y = part.pos[1]
                    if maxx<x:
                        maxx = x
                    if maxy<y:
                        maxy = y
                    if x<minx:
                        minx = x
                    if y<miny:
                        miny = y
            self.bound_upper.x = minx
            self.bound_upper.y = miny
            self.bound_upper.x2 = maxx
            self.bound_upper.y2 = maxy
            self.bound_upper.w = maxx-minx
            self.bound_upper.h = maxy-miny

            self.bound_upper.process()

            self.pos = self.bound.pos

            #culc head and headings
            if self.nose.isExist and self.lear.isExist and self.rear.isExist and self.lshoulder.isExist and self.rshoulder.isExist:

                self.head = Head()
                self.head.init(self.nose,self.leye,self.reye,self.lear,self.rear,self.lshoulder,self.rshoulder)
                
                self.shoulder_center.pos = self.center(self.lshoulder.pos,self.rshoulder.pos)
                self.hip_center.pos = self.center(self.lhip.pos,self.rhip.pos)
                self.hip_to_shoulder_pixels = math.dist(self.shoulder_center.pos,self.hip_center.pos)
                self.pixel_per_mm = self.hip_to_shoulder_pixels / self.hip_to_shoulder_mm
                
                
            if self.head == None:
                self.isExist = False  
                
    def update(self,history):
        if self.head!=None:
            self.head.update(history,self.pixel_per_mm)
            
    def processBounds(self):
        minx = 10000
        maxx = 0
        
        #bound_upper.x. bound_upper.x2  head.eye_line_pos [0]
        temps = []
        temps.append(self.bound_upper.x)
        temps.append(self.bound_upper.x2)
        temps.append(self.head.eye_line_pos [0])
        
        for x in temps:
                if maxx<x:
                    maxx = x
                if x<minx:
                    minx = x
        self.max_x = maxx
        self.min_x = minx

def draw_body(
    image: np.ndarray,
    body: Body,
) -> np.ndarray:
    if body != None:
        diameter_in_mm = 100
        diameter = round(body.pixel_per_mm * diameter_in_mm)
        
        if(body.nose.isExist):
            cv2.circle(image, body.nose.pos, diameter, (0,0,255), thickness=-1)
        if(body.leye.isExist):
            cv2.circle(image, body.leye.pos, diameter, (127,127,255), thickness=-1)
        if(body.reye.isExist):
            cv2.circle(image, body.reye.pos, diameter, (127,127,255), thickness=-1)
        if(body.lear.isExist):
            cv2.circle(image, body.lear.pos, diameter, (127,127,200), thickness=-1)
        if(body.rear.isExist):
            cv2.circle(image, body.rear.pos, diameter, (127,127,200), thickness=-1)
            
        if(body.lshoulder.isExist):
            cv2.circle(image, body.lshoulder.pos, diameter, (127,200,200), thickness=-1)
        if(body.rshoulder.isExist):
            cv2.circle(image, body.rshoulder.pos, diameter, (127,200,200), thickness=-1)
            
        if(body.lhip.isExist):
            cv2.circle(image, body.lhip.pos, diameter, (127,200,200), thickness=-1)
        if(body.rhip.isExist):
            cv2.circle(image, body.rhip.pos, diameter, (127,200,200), thickness=-1)
            
        index = 0
        for part in body.parts:
            if index>6 and index!=11 and index!=12:
                if(part.isExist):
                    cv2.circle(image, part.pos, diameter, (200,127,127), thickness=-1)
            index = index+1
            
            
        #print("startp:",body.bounding_box_start_point[0],body.bounding_box_start_point[1])
        #cv2.rectangle(image,(body.bound.x,body.bound.y),(body.bound.x+body.bound.w,body.bound.y+body.bound.h), (127,127,127), 1)
        cv2.rectangle(image,body.bound_upper.l_u,body.bound_upper.r_d, (255, 255, 255), 1)
        
        id_text = 'id:' + str(body.id)
        color = (255,255,255)
        '''
        if body.id_late == 0:
            color = (255,0,0)
        if body.id_late == 1:
            color = (0, 255, 0)
        if body.id_late == 2:
            color = (0, 0, 255)
        if body.id_late == 3:
            color = (255, 127,127)
        if body.id_late == 4:
            color = (127, 255,127)
        if body.id_late == 5:
            color = (127, 127,255)
            '''
            
        cv2.putText(image, id_text, body.bound_upper.pos, cv2.FONT_HERSHEY_PLAIN, 4,color, 1)
        
        #head
        head = body.head
        cv2.circle(image, head.pos, 50, color, thickness=1)
        #head_width_text = '{:.2f}'.format(head.head_width)
        #cv2.putText(image, head_width_text, head.pos, cv2.FONT_HERSHEY_PLAIN, 2, head.color, 1)
        
        #heading
        cv2.arrowedLine(image, head.pos, head.eye_line_pos, color, thickness=2)
    
    return image

def process_leds():
    interval = width/led_length
    #leds_temp = [0] * led_length
    leds.clear()
    for body in bodies:
        
        #shoulder bound
        start = body.bound_upper.x
        end = body.bound_upper.x2
        start_led = int(start/interval)
        end_led = int(end/interval)
        for num in range(start_led,end_led):
            leds.set_white(num,127)
            
        #eye balls
        l_eye = int(body.leye.pos[0]/interval)
        r_eye = int(body.reye.pos[0]/interval)
        leds.set_red(l_eye,127)
        leds.set_red(r_eye,127)
        
        #eye line
        eye_center= body.head.pos[0]
        eye_tip = body.head.eye_line_pos[0]
        eye_center_led = int(eye_center/interval)
        eye_tip_led = int(eye_tip/interval)
        
        if body.isWrap:
            white = 127
        else:
            white = 254
        for num in range(eye_center_led,eye_tip_led):
            leds.set_white(num,white)
            
        for num in range(eye_tip_led,eye_center_led):
            leds.set_white(num,white)
            
        #boundary func
        if body.isWrap:
            min_x_led = int(body.min_x/interval)
            max_x_led = int(body.max_x/interval)

            for num in range(min_x_led,max_x_led):
                leds.set_color(num,127,127,254)

    #leds.process()

def draw_leds(image: np.ndarray) -> np.ndarray:
    temp_height = int(height/4)
    interval = width/led_length
    for index in range(led_length):
        led = leds.leds[index]
        cv2.circle(image, (int(interval*index), temp_height), 2, (led.w, led.w, led.w), thickness=-1)
        cv2.circle(image, (int(interval*index), temp_height-6), 2, (led.b, led.g, led.r), thickness=-1)
    return image

def send_leds():
    #last array is for stop char
    data = [0] * (led_length*4+1)
    for index in range(led_length):
            led = leds.leds[index]
            data[index*4] = led.r
            data[index*4+1] = led.g
            data[index*4+2] = led.b
            data[index*4+3] = led.w
    if ser!=None:
        ser.send(data,led_length)

def paint_bounds(
    image: np.ndarray,
    body: Body,
) -> np.ndarray:
    if body != None:
        cv2.rectangle(image,(body.bound.x,0),(body.bound.x+body.bound.w,body.bound.y+body.bound.h), (255, 255, 255), thickness = -1)
    return image

def mouse_callback(event,x,y,flags,param):
    global screen_fit
    print("mouse_callback 0")
    if event == cv2.EVENT_LBUTTONDOWN :
        screen_fit = not screen_fit
        if screen_fit:
             print("screen fit")
        else: 
             print("screen unfit")

#utils.visualize
# Draw keypoints and edges on input image
#image = utils.visualize(image, persons)
        
screen_fit = False
model = 'movenet_lightning'
#pose_detector = MoveNetMultiPose(model,'bounding_box',512)

detectors_num = 5
pose_detectors = []
persons_lists = []
bodies= []

# Initialize the pose estimator selected.
if model in ['movenet_lightning', 'movenet_thunder']:
    for i in range(detectors_num):
        pose_detectors.append(Movenet(model))
elif model == 'posenet':
    for i in range(detectors_num):
        pose_detectors.append(Posenet(model))
else:
    sys.exit('ERROR: Model is not supported.')

led_length = 300 
leds = Leds(led_length)

ser = SerialLed()

# Start capturing video input from the camera
cap = cv2.VideoCapture(camera_id)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

image = np.zeros((height, width,3), np.uint8)
#cv2.putText(image, "hello", (10, 30),cv2.FONT_HERSHEY_PLAIN, 1.5,(255, 255, 255), 1, cv2.LINE_AA)

#cv2.startWindowThread()
cv2.imshow(model, image)
cv2.setMouseCallback(model,mouse_callback)

start_time = time.time()

keypoint_threshold=0.3
instance_threshold=0.3

#mot_tracker = Sort()

while cap.isOpened():
    end_time = time.time()
    
    time_diff = end_time - start_time #sec
    fps = 1.0 / time_diff
        
    start_time = time.time()
    
    success, image = cap.read()
    if not success:
      sys.exit(
          'ERROR: Unable to read from webcam. Please verify your webcam settings.'
      )

    image = cv2.flip(image, 1)
    image_original = np.copy(image)
    
    # loop of detectors
    previous_bodies = bodies
    persons_lists = []
    bodies = []
    
    for i in range(detectors_num):
        persons_lists.append( [pose_detectors[i].detect(image)])
        #person = list_persons[0]
        if len(persons_lists[i])>0 :
            body = Body(persons_lists[i][0],i,keypoint_threshold,instance_threshold)
            if body.isExist:
                bodies.append(body)
                image = paint_bounds(image,body)
            
    #simple tracking
      
    distance_thresh = 300
    for previous_body in previous_bodies:
        disntances_to_previous = []
        for body in bodies:
            distance = math.dist(body.head.pos,previous_body.head.pos)
            if distance<distance_thresh:
                disntances_to_previous.append({'id':body.id_initial,"distance":distance})
        
        #assign id from most closest
        if len(disntances_to_previous) == 0:
            continue
        else:
            disntances_to_previous.sort(key=lambda x: x['distance'])
            id = disntances_to_previous[0]["id"]
            for body in bodies:
                if body.id_initial == id:
                    body.id = previous_body.id
                    body.update(previous_body.head.history)
                       
    #get max ID num of current bodies
    ids=[]
    max_id = 0
    
    for body in bodies:
        if body.id == None:
            ids.append(0)
        else:
            ids.append(body.id)
    if len(ids)>0:
        ids.sort(reverse=True)
        max_id = ids[0]
    else:
        max_id = 0
    
    #check new bodies and give is if it is not given yet
    for body in bodies:
        if body.id == None:
            body.id = (max_id+1)
            max_id = max_id+1
            if max_id >99:
                max_id = 0
                
    #Boundary functions          
    for body in bodies:
        body.isWrap = False
        body.processBounds()
    for body in bodies:
        for pair in bodies:
            if body.id == pair.id:
                continue
            #wrap 1
            if(body.min_x<pair.min_x and pair.min_x<body.max_x):
                body.isWrap = True
                pair.isWrap = True
                
            #wrap 2
            if(body.min_x<pair.max_x and pair.max_x<body.max_x):
                body.isWrap = True
                pair.isWrap = True
        
    #draw
    for body in bodies:
        image_original= draw_body(image_original, body)
        
    #image = draw_bodies_line(image, bodies)
    process_leds()
    image_original = draw_leds(image_original)
    send_leds()
    
    if screen_fit:
        h = image_original.shape[0]
        w = image_original.shape[1]
        ratio = 800 / w
        image_original = cv2.resize(image_original , (int(w * ratio), int(h * ratio)))
        
    # Show the FPS
    fps_text = 'FPS = ' + str(int(fps))
    text_location = (10,20)
    cv2.putText(image_original,fps_text, text_location, cv2.FONT_HERSHEY_PLAIN,
                2, (127,127,255), 1)
    
    # Show the IDs
    ids_text = 'IDs = ' + str(int(len(bodies)))
    text_location = (10,40)
    cv2.putText(image_original,ids_text, text_location, cv2.FONT_HERSHEY_PLAIN,
                2, (127,127,255), 1)
    
    cv2.imshow(model, image_original)
    #time.sleep(0.02)
    key = cv2.waitKey(1)

    if key == ord('q'):            #qを押した時の処理
        cv2.waitKey(1)
        cv2.destroyAllWindows()  
        cap.release()
        if ser!=None:
            ser.close()
        cv2.waitKey(1)
        break