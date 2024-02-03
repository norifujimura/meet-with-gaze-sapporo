# Copyright 2019 Google LLC
import argparse
import cv2
import os

# from pycoral.adapters.common import input_size
# from pycoral.adapters.detect import get_objects
# from pycoral.utils.dataset import read_label_file
# from pycoral.utils.edgetpu import make_interpreter
# from pycoral.utils.edgetpu import run_inference

def main():
    # default_model_dir = './all_models'
    # default_model = 'mobilenet_ssd_v2_coco_quant_postprocess_edgetpu.tflite'
    # default_labels = 'coco_labels.txt'
    # parser = argparse.ArgumentParser()
    # parser.add_argument('--model', help='.tflite model path',default=os.path.join(default_model_dir,default_model))
    # parser.add_argument('--labels', help='label file path',default=os.path.join(default_model_dir, default_labels))
    # parser.add_argument('--top_k', type=int, default=3,help='number of categories with highest score to display')
    # parser.add_argument('--camera_idx', type=int, help='Index of which video source to use. ', default = 0)
    # parser.add_argument('--threshold', type=float, default=0.1,help='classifier score threshold')
    #args = parser.parse_args()

    #print('Loading {} with {} labels.'.format(args.model, args.labels))
    #interpreter = make_interpreter(args.model)
    #interpreter.allocate_tensors()
    #labels = read_label_file(args.labels)
    #inference_size = input_size(interpreter)

    #cap = cv2.VideoCapture(args.camera_idx)
    cap = cv2.VideoCapture(0)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        cv2_im = frame

        cv2_im_rgb = cv2.cvtColor(cv2_im, cv2.COLOR_BGR2RGB)
        #cv2_im_rgb = cv2.resize(cv2_im_rgb, inference_size)
        #run_inference(interpreter, cv2_im_rgb.tobytes())
        #objs = get_objects(interpreter, args.threshold)[:args.top_k]
        #cv2_im = append_objs_to_img(cv2_im, inference_size, objs, labels)

        cv2.imshow('frame', cv2_im)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
