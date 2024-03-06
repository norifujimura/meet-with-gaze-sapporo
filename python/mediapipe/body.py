from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2

class Part:
    def __init__(self,):
        self.isExist = False
        self.pos=(0,0)
        self.world_pos=(0,0,0)
        self.color  = (255,255,255)

    def init(self,point,world_point,width,height,color):
        self.pos = (int(point.x*width),int(point.y*height))
        self.world_pos = (world_point.x,world_point.y,world_point.z)
        self.color = color
        self.isExist = True

class Bound:
    x=0
    y=0
    w=0
    h=0
    
class Body(object):
    def __init__(self,landmarks,world_landmarks,visibility_threshold,width,height):
        self.landmarks = landmarks
        self.world_landmarks = world_landmarks
        self.visibility_threshold = visibility_threshold
        self.width = width
        self.height = height
    bound = Bound()
    
    # for landmark in person:

    nose=Part()
    leye=Part()
    reye=Part()
    lear=Part()
    rear=Part()
    lshoulder=Part()
    rshoulder=Part()
    lelbow = Part()
    relbow = Part()
    lhand = Part()
    rhand = Part()
    lhip = Part()
    rhip = Part()
    lknee = Part()
    rknee = Part()
    lfoot = Part()
    rfoot = Part()
    parts = [nose,leye,reye,lear,rear,lshoulder,rshoulder,lelbow,relbow,lhand,rhand,lhip,rhip,lknee,rknee,lfoot,rfoot]

    
    def process(self):
        nose_color = (0,0,255)
        eye_color = (127,127,255)
        left_color = (255,127,127)
        right_color = (127,255,127)
        # Draw the pose landmarks.
        for i in range(len(self.landmarks)):
            point = self.landmarks[i]
            world_point = self.world_landmarks[i]
            width = self.width
            height = self.height
            
            #print("Visibility:"+str(point.visibility))
            
            if point.visibility >= self.visibility_threshold:
                #nose
                if(i==0): 
                    self.parts[0].init(point,world_point,width,height,nose_color)
                #l-eye
                if(i==2): 
                    self.parts[1].init(point,world_point,width,height,eye_color)
                #r-eye
                if(i==5): 
                    self.parts[2].init(point,world_point,width,height,eye_color)
                #l-ear
                if(i==7): 
                    self.parts[3].init(point,world_point,width,height,left_color)
                #r-ear
                if(i==8): 
                    self.parts[4].init(point,world_point,width,height,right_color)
                #l-shoulder
                if(i==11): 
                    self.parts[5].init(point,world_point,width,height,left_color)
                #r-shoulder
                if(i==12): 
                    self.parts[6].init(point,world_point,width,height,right_color)
                #l-elbow
                if(i==13): 
                    self.parts[7].init(point,world_point,width,height,left_color)
                #r-elbow
                if(i==14): 
                    self.parts[8].init(point,world_point,width,height,right_color)
                #l-hand
                if(i==15): 
                    self.parts[9].init(point,world_point,width,height,left_color)
                #r-hand
                if(i==16): 
                    self.parts[10].init(point,world_point,width,height,right_color)
                #l-hip
                if(i==23): 
                    self.parts[11].init(point,world_point,width,height,left_color)
                #r-hip
                if(i==24): 
                    self.parts[12].init(point,world_point,width,height,right_color)
                #l-knee
                if(i==25): 
                    self.parts[13].init(point,world_point,width,height,left_color)
                #r-knee
                if(i==26): 
                    self.parts[14].init(point,world_point,width,height,right_color)
                #l-foot
                if(i==27): 
                    self.parts[15].init(point,world_point,width,height,left_color)
                #r-foot
                if(i==28): 
                    self.parts[16].init(point,world_point,width,height,right_color)
            
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