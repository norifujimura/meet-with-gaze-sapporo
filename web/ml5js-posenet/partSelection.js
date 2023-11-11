// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let videoWidth = 1920;
let videoHeight =1080;

var videoBuffer;

function setup() {
  createCanvas(videoWidth, videoHeight);

  videoBuffer = createGraphics(videoWidth, videoHeight);

  var constraints = {
    video: {
      /*
        deviceId: {
          label:'16MP USB Camera'
        },
        */
       /*
        label:{
          exact:'16MP USB Camera'
        },
        */
        mandatory: {
          minWidth: videoWidth,
          minHeight: videoHeight
        },
      },
      audio: false
    };

  //video = createCapture(VIDEO);
  video = createCapture(constraints);

  //video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, {outputStride:8, quantBytes:4}, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function mousePressed(){
  console.log(JSON.stringify(poses))
}

function draw() {
  //image(video, 0, 0, videoWidth/2, videoHeight/2,videoWidth,videoHeight);

  videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  strokeWeight(2);
  image(videoBuffer, 0, 0,videoWidth/2,videoHeight/2);

  // For one pose only (use a for loop for multiple poses!)
  if (poses.length > 0) {
    const pose = poses[0].pose;

    // Create a pink ellipse for the nose
    fill(213, 0, 143);
    const nose = pose.nose;
    ellipse(nose.x/2, nose.y/2, 10, 10);

    // Create a yellow ellipse for the right eye
    fill(255, 215, 0);
    const rightEye = pose.rightEye;
    ellipse(rightEye.x/2, rightEye.y/2, 10, 10);

    // Create a yellow ellipse for the right eye
    fill(255, 215, 0);
    const leftEye = pose.leftEye;
    ellipse(leftEye.x/2, leftEye.y/2, 10, 10);
  }

  
}