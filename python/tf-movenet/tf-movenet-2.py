import cv2
import numpy as np
import serial
import time
import logging
import sys
import utils

from typing import List, Tuple
from data import Person

from ml import Classifier
from ml import Movenet
from ml import MoveNetMultiPose
from ml import Posenet

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
        self.leds[index].w = white
    def set_red(self,index,red):
        self.leds[index].r = red
        
class Ledss:
    def __init__(self,length,depth):
        self.length = length
        self.leds = []
        self.ledss = []
        self.index = 0;
        self.depth = depth
        
        for i in range(length):
            led = Led()
            self.leds.append(led)
        for i in range(depth):
            leds = Leds(length)
            self.ledss.append(leds)
    def process(self):
        self.index+=1
        if self.index==self.depth:
            self.index = 0
            
        # culc averate
        depth = self.depth
        for i in range(self.length):
            r=0
            g=0
            b=0
            w=0
            
            for h in range(depth):
                leds_temp = self.ledss[h]
                led_temp = leds_temp.leds[i]
                r+= led_temp.r
                g+= led_temp.g
                b+= led_temp.b
                w+= led_temp.w
            self.leds[i].r = int(r/depth)
            self.leds[i].g = int(g/depth)
            self.leds[i].b = int(b/depth)
            self.leds[i].w = int(w/depth)
                
    def clear(self):
        self.ledss[self.index].clear()
    def set_white(self,index,white):
        self.ledss[self.index].set_white(index,white)
    def set_red(self,index,red):
        self.ledss[self.index].set_red(index,red)
        

class Part:
    def __init__(self,):
        self.isExist = False
        self.pos=(0,0)
    
class Bound:
    def __init__(self):
        self.x=0
        self.y=0
        self.w=0
        self.h=0

class Body(object):
    def __init__(self,person):
        self.person= person
        self.id = person.id
        self.keypoints = person.keypoints   
        self.bound = Bound()

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
    
    def process(self):
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
        self.bound.w = maxx-minx
        self.bound.h = maxy-miny
                
        
#1 do inference 
#2 convert the results to the list of Body objects
def process_bodies(
    list_persons: List[Person],
    keypoint_threshold: float = 0.1,
    instance_threshold: float = 0.1,
)-> List[Body]:
    
    bodies = []
    for person in list_persons:
        # print(type(person))
        
        if person.score < instance_threshold:
            continue
        #key points
        body = Body(person)
        for i in range(len(body.keypoints)):
            point = body.keypoints[i]
            if point.score >= keypoint_threshold:
                if(i==0):
                    body.nose.pos = point.coordinate
                    body.nose.isExist = True
                if(i==1):
                    body.leye.pos = point.coordinate
                    body.leye.isExist = True
                if(i==2):
                    body.reye.pos = point.coordinate
                    body.reye.isExist = True
                if(i==3):
                    body.lear.pos = point.coordinate
                    body.lear.isExist = True
                if(i==4):
                    body.rear.pos = point.coordinate
                    body.rear.isExist = True
                if(i==5):
                    body.lshoulder.pos = point.coordinate
                    body.lshoulder.isExist = True
                if(i==6):
                    body.rshoulder.pos = point.coordinate
                    body.rshoulder.isExist = True
                if(i==7):
                    body.lelbow.pos = point.coordinate
                    body.lelbow.isExist = True
                if(i==8):
                    body.relbow.pos = point.coordinate
                    body.relbow.isExist = True
                if(i==9):
                    body.lhand.pos = point.coordinate
                    body.lhand.isExist = True
                if(i==10):
                    body.rhand.pos = point.coordinate
                    body.rhand.isExist = True
                if(i==11):
                    body.lhip.pos = point.coordinate
                    body.lhip.isExist = True
                if(i==12):
                    body.rhip.pos = point.coordinate
                    body.rhip.isExist = True
                if(i==13):
                    body.lknee.pos = point.coordinate
                    body.lknee.isExist = True
                if(i==14):
                    body.rknee.pos = point.coordinate
                    body.rknee.isExist = True
                if(i==15):
                    body.lfoot.pos = point.coordinate
                    body.lfoot.isExist = True
                if(i==16):
                    body.rfoot.pos = point.coordinate
                    body.rfoot.isExist = True
        body.process()
        bodies.append(body)  
    return bodies

def draw_bodies(
    image: np.ndarray,
    list_bodies: List[Body],
) -> np.ndarray:
    for body in list_bodies:
        id_text = 'id = ' + str(body.id)
        cv2.putText(image, id_text, (body.bound.x,body.bound.y), cv2.FONT_HERSHEY_PLAIN, 1,(127, 127, 127), 1)
        if(body.nose.isExist):
            cv2.circle(image, body.nose.pos, 10, (0,0,255), thickness=-1)
        if(body.leye.isExist):
            cv2.circle(image, body.leye.pos, 10, (127,127,255), thickness=-1)
        if(body.reye.isExist):
            cv2.circle(image, body.reye.pos, 10, (127,127,255), thickness=-1)
        if(body.lear.isExist):
            cv2.circle(image, body.lear.pos, 10, (127,127,200), thickness=-1)
        if(body.rear.isExist):
            cv2.circle(image, body.rear.pos, 10, (127,127,200), thickness=-1)
        if(body.lshoulder.isExist):
            cv2.circle(image, body.lshoulder.pos, 10, (127,127,200), thickness=-1)
        if(body.rshoulder.isExist):
            cv2.circle(image, body.rshoulder.pos, 10, (127,127,200), thickness=-1)
            
        index = 0
        for part in body.parts:
            if index>6:
                if(part.isExist):
                    cv2.circle(image, part.pos, 10, (200,127,127), thickness=-1)
            index = index+1
            
            
        #print("startp:",body.bounding_box_start_point[0],body.bounding_box_start_point[1])
        cv2.rectangle(image,(body.bound.x,body.bound.y),(body.bound.x+body.bound.w,body.bound.y+body.bound.h), (255, 255, 255), 1)
    return image

def paint_bounds(
    image: np.ndarray,
    list_bodies: List[Body],
) -> np.ndarray:
    if len(list_bodies)>0:
        body = list_bodies[0]
        cv2.rectangle(image,(body.bound.x,0),(body.bound.x+body.bound.w,body.bound.y+body.bound.h), (255, 255, 255), thickness = -1)
    return image

def draw_bodies_line(
    image: np.ndarray,
    list_bodies: List[Body],
) -> np.ndarray:
    temp_height = int(height/2)
    for body in list_bodies:
        cv2.rectangle(image,(body.bound.x,temp_height),(body.bound.x + body.bound.w,temp_height), (255, 255, 255), 2)
        cv2.rectangle(image,(body.leye.pos[0],temp_height),(body.leye.pos[0]+10,temp_height), (255, 0,0), 2)
        cv2.rectangle(image,(body.reye.pos[0],temp_height),(body.reye.pos[0]+10,temp_height), (255, 0,0), 2)
        
        id_text = 'id = ' + str(body.id)
        cv2.putText(image, id_text,(body.bound.x,temp_height), cv2.FONT_HERSHEY_PLAIN, 1,(127, 127, 127), 1)
    return image

def process_leds():
    interval = width/led_length
    #leds_temp = [0] * led_length
    ledss.clear()
    for body in bodies:
        start = body.bound.x
        end = body.bound.x+body.bound.w
        start_led = int(start/interval)
        end_led = int(end/interval)
        l_eye = int(body.leye.pos[0]/interval)
        r_eye = int(body.reye.pos[0]/interval)
        
        for num in range(start_led,end_led):
            ledss.set_white(num,254)
        ledss.set_red(l_eye,254)
        ledss.set_red(r_eye,254)
    ledss.process()

def draw_leds(image: np.ndarray) -> np.ndarray:
    temp_height = int(height/4)
    interval = width/led_length
    for index in range(led_length):
        led = ledss.leds[index]
        cv2.circle(image, (int(interval*index), temp_height), 2, (led.w, led.w, led.w), thickness=-1)
        cv2.circle(image, (int(interval*index), temp_height-6), 2, (led.b, led.g, led.r), thickness=-1)
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

# Initialize the pose estimator selected.
if model in ['movenet_lightning', 'movenet_thunder']:
    pose_detector = Movenet(model)
    pose_detector_two = Movenet(model)
    pose_detector_three = Movenet(model)
elif model == 'posenet':
    pose_detector = Posenet(model)
    pose_detector_two = Posenet(model)
    pose_detector_three = Posenet(model)
else:
    sys.exit('ERROR: Model is not supported.')

width = 1024
height = 720
#width = 1920
#height = 1080
#camera_id = "video0-10fps.mp4"
camera_id =0

led_length = 150;  #5m 150
led_average = 5;

leds = Leds(led_length)
ledss = Ledss(led_length,led_average)

# Start capturing video input from the camera
cap = cv2.VideoCapture(camera_id)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

image = np.zeros((height, width,3), np.uint8)
cv2.putText(image, "hello", (10, 30),
               cv2.FONT_HERSHEY_PLAIN, 1.5,
               (255, 255, 255), 1, cv2.LINE_AA)

#cv2.startWindowThread()
cv2.imshow(model, image)
cv2.setMouseCallback(model,mouse_callback)

# Visualization parameters
#row_size = 20  # pixels
#left_margin = 24  # pixels
#text_color = (0, 0, 255)  # red
#font_size = 1
#font_thickness = 1
classification_results_to_show = 10
#fps_avg_frame_count = 10
#keypoint_detection_threshold_for_classifier = 0.1
#classifier = None

start_time = time.time()

keypoint_threshold=0.3
instance_threshold=0.3

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

    persons_one = [pose_detector.detect(image)]

    if len(persons_one)>0 :
        bodies_one = process_bodies(persons_one,keypoint_threshold,instance_threshold)
        
        # for 2nd round
        image = paint_bounds(image, bodies_one)
        persons_two = [pose_detector_two.detect(image)]
        if len(persons_two)>0 :
            bodies_two = process_bodies(persons_two,keypoint_threshold,instance_threshold)
    
            # for 3nd round
            image = paint_bounds(image, bodies_two)
            persons_three = [pose_detector_three.detect(image)]
            if len(persons_three)>0 :
                bodies_three = process_bodies(persons_three,keypoint_threshold,instance_threshold)
    
    #draw
    image_original= draw_bodies(image_original, bodies_one)
    image_original= draw_bodies(image_original, bodies_two)
    image_original= draw_bodies(image_original, bodies_three)
    #image = draw_bodies_line(image, bodies)
    #process_leds()
    #image = draw_leds(image)
    
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
    
    cv2.imshow(model, image_original)
    #time.sleep(0.02)
    key = cv2.waitKey(1)

    if key == ord('q'):            #qを押した時の処理
        cv2.waitKey(1)
        cv2.destroyAllWindows()  
        cap.release()
        cv2.waitKey(1)
        break