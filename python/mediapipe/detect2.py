import argparse
import sys
import time

import cv2
import mediapipe as mp
import numpy as np
from typing import List, Tuple

from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2

from body import Body


#1 do inference 
#2 convert the results to the list of Body objects
# https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/python#video
def process_bodies(
    result:vision.PoseLandmarkerResult,
    width:int,
    height:int,
    visibility_threshold: float = 0.8
)-> List[Body]:

    # https://github.com/googlesamples/mediapipe/blob/main/examples/pose_landmarker/python/%5BMediaPipe_Python_Tasks%5D_Pose_Landmarker.ipynb
    bodies = []
    #for landmarks in result.pose_landmarks:
    for id in range(len(result.pose_landmarks)):
        # print(type(person))
        landmarks = result.pose_landmarks[id]
        world_landmarks = result.pose_world_landmarks[id]

        #key points
        body = Body(landmarks,world_landmarks,visibility_threshold,width,height)
        body.process()
        bodies.append(body)  
    return bodies

def draw_bodies(
    image: np.ndarray,
    list_bodies: List[Body],
) -> np.ndarray:
    for body in list_bodies:
        index = 0
        for part in body.parts:
            if(part.isExist):
                cv2.circle(image, part.pos, 10, part.color, thickness=-1)
            index = index+1
        cv2.rectangle(image,(body.bound.x,body.bound.y),(body.bound.x+body.bound.w,body.bound.y+body.bound.h), (255, 255, 255), 1)
    return image

'''
def draw_bodies(image: np.ndarray
) -> np.ndarray:
    if DETECTION_RESULT:
    # Draw landmarks.
        for pose_landmarks in DETECTION_RESULT.pose_landmarks:
            # Draw the pose landmarks.
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend([
                landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y,
                                                z=landmark.z) for landmark
                in pose_landmarks
            ])
            mp_drawing.draw_landmarks(
                image,
                pose_landmarks_proto,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing_styles.get_default_pose_landmarks_style())
    return image
'''

def draw_bodies_2(image: np.ndarray
) -> np.ndarray:
    if persons:
    # Draw landmarks.
        for person in persons.pose_landmarks:
            # Draw the pose landmarks.
            for landmark in person:
                 #print(type(landmark))
                pos = (int(landmark.x*width),int(landmark.y*height))
                # landmark: https://developers.google.com/mediapipe/api/solutions/java/com/google/mediapipe/tasks/components/containers/Landmark
                cv2.circle(image,pos, 5, (0,0,255), thickness=-1)
                #print(landmark.x)
    return image

def draw_bodies_3(image: np.ndarray,result:vision.PoseLandmarkerResult
) -> np.ndarray:
    if result:
    # Draw landmarks.
        for person in result.pose_landmarks:
            # Draw the pose landmarks.
            for landmark in person:
                 #print(type(landmark))
                pos = (int(landmark.x*width),int(landmark.y*height))
                # landmark: https://developers.google.com/mediapipe/api/solutions/java/com/google/mediapipe/tasks/components/containers/Landmark
                cv2.circle(image,pos, 5, (0,0,255), thickness=-1)
                #print(landmark.x)
    return image


# draw in x-z plane

def draw_bodies_world(image: np.ndarray
) -> np.ndarray:
    if DETECTION_RESULT:
        ratio = 100
    # Draw landmarks.
        for person in DETECTION_RESULT.pose_world_landmarks:
            # Draw the pose landmarks.
            for landmark in person:
                 #print(type(landmark))
                pos = (int(landmark.x*ratio),int(landmark.y*ratio))
                # landmark: https://developers.google.com/mediapipe/api/solutions/java/com/google/mediapipe/tasks/components/containers/Landmark
                cv2.circle(image,pos, 5, (255,0,255), thickness=-1)
                #print(landmark.x)
    return image

def draw_segments(image: np.ndarray
) -> np.ndarray:
    if (output_segmentation_masks and DETECTION_RESULT):
        if DETECTION_RESULT.segmentation_masks is not None:
            segmentation_mask = DETECTION_RESULT.segmentation_masks[0].numpy_view()
            mask_image = np.zeros(image.shape, dtype=np.uint8)
            mask_image[:] = mask_color
            condition = np.stack((segmentation_mask,) * 3, axis=-1) > 0.1
            visualized_mask = np.where(condition, mask_image, image)
            image= cv2.addWeighted(image, overlay_alpha,
                                            visualized_mask, overlay_alpha,
                                            0)
    return image

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Global variables to calculate FPS
#COUNTER, FPS = 0, 0
#START_TIME = time.time()
#DETECTION_RESULT = None
persons = None

"""Continuously run inference on images acquired from the camera.

Args:
  model: Name of the pose landmarker model bundle.
  num_poses: Max number of poses that can be detected by the landmarker.
  min_pose_detection_confidence: The minimum confidence score for pose
    detection to be considered successful.
  min_pose_presence_confidence: The minimum confidence score of pose
    presence score in the pose landmark detection.
  min_tracking_confidence: The minimum confidence score for the pose
    tracking to be considered successful.
  output_segmentation_masks: Choose whether to visualize the segmentation
    mask or not.
  camera_id: The camera id to be passed to OpenCV.
  width: The width of the frame captured from the camera.
  height: The height of the frame captured from the camera.
"""
    
camera_id = 0 # 1 for webcam on Mac
width = 1280 #1280 for webcam for mac
height= 720 # 720 for Webcam for mac

model = 'pose_landmarker_lite.task'
num_poses = 3
min_pose_detection_confidence = 0.5
min_pose_presence_confidence = 0.5
min_tracking_confidence = 0.5
output_segmentation_masks = False
fps = 0


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

cv2.startWindowThread()
cv2.imshow(model, image)

'''
# Visualization parameters
row_size = 50  # pixels
left_margin = 24  # pixels
text_color = (0, 0, 0)  # black
font_size = 1
font_thickness = 1
fps_avg_frame_count = 10
overlay_alpha = 0.5
mask_color = (100, 100, 0)  # cyan
'''

def callback_result(result: vision.PoseLandmarkerResult,
                unused_output_image: mp.Image, timestamp_ms: int):
    global persons
    persons = result
    # print(type(result))
    '''
    # Calculate the FPS
    if COUNTER % fps_avg_frame_count == 0:
        FPS = fps_avg_frame_count / (time.time() - START_TIME)
        START_TIME = time.time()

    DETECTION_RESULT = result
    COUNTER += 1
    '''
    
# Initialize the pose landmarker model
base_options = python.BaseOptions(model_asset_path=model)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.LIVE_STREAM,
    num_poses=num_poses,
    min_pose_detection_confidence=min_pose_detection_confidence,
    min_pose_presence_confidence=min_pose_presence_confidence,
    min_tracking_confidence=min_tracking_confidence,
    output_segmentation_masks=output_segmentation_masks,
    result_callback=callback_result)
detector = vision.PoseLandmarker.create_from_options(options)

start_time = time.time()

# Continuously capture images from the camera and run inference
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

    # Convert the image from BGR to RGB as required by the TFLite model.
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

    # Run pose landmarker using the model.
    detector.detect_async(mp_image, time.time_ns() // 1_000_000)
    current_frame = image
    
    if persons:
        bodies = process_bodies(persons,width,height,0.9)
        current_frame = draw_bodies(current_frame,bodies)
        current_frame = draw_segments(current_frame)
    
    #current_frame = draw_bodies(current_frame)
    
    #current_frame = draw_bodies_world(current_frame)
    
    
    # Show the FPS
    #fps_text = 'FPS = ' + str(int(fps))
    fps_text = 'FPS = {:.1f}'.format(fps)
    text_location = (10,40)
    cv2.putText(current_frame, fps_text, text_location, cv2.FONT_HERSHEY_PLAIN,
                2, (255,255,255), 1)

    cv2.imshow('pose_landmarker', current_frame)

    time.sleep(0.1)
    key = cv2.waitKey(1)

    if key == ord('q'):            #qを押した時の処理
        cv2.waitKey(1)
        cv2.destroyAllWindows()  
        cap.release()
        cv2.waitKey(1)
        break