let faceapi;
let video;
let detections;

let videoWidth = 640;
let videoHeight =480;

var stats;

//let canvas, ctx;

//var videoBuffer;

// relative path to your models from window.location.pathname
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  Mobilenetv1Model: "models",
  FaceLandmarkModel: "models",
  FaceRecognitionModel: "models",
};

function setup() {
  console.log("setup()");
  //createCanvas(360, 270);

  stats = new Stats();
  stats.showPanel(0);// 0: fps, 1: ms, 2: mb, 3+: custom

  createCanvas(videoWidth, videoHeight);

  //canvas = createCanvas(videoWidth, videoHeight);
  //ctx = canvas.getContext("2d");

  //videoBuffer = createGraphics(videoWidth, videoHeight);

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

  // load up your video
  //video = createCapture(VIDEO);
  video = createCapture(constraints);
  //video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas
  faceapi = ml5.faceApi(video, detectionOptions, modelReady);
  textAlign(RIGHT);
}

function modelReady() {
  console.log("ready!");
  console.log(faceapi);
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  stats.end();
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;

  // background(220);
  background(255);

  //ctx.drawImage(video, 0, 0, width, height);
  image(video, 0, 0, width, height);

  if (detections) {
    if (detections.length > 0) {
      drawBox(detections);
      drawParts(detections);
      drawLandmarks(detections);
    }
  }
  faceapi.detect(gotResults);
  stats.begin();
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i += 1) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;

    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    rect(x, y, boxWidth, boxHeight);
  }
}

function drawLandmarks(detections) {

  ellipseMode(CENTER);
  fill(100);
  stroke(100);

  for (let i = 0; i < detections.length; i += 1) {
    //console.log(detections[i]);
    var detection = detections[i];
    for (let j = 0; j < detection.landmarks.positions.length; j += 1) {
      var position = detection.landmarks.positions[j];

      //0 and 16 for ears
      //30 for nose tip

      if(j==0 || j== 16){
        fill(255);
        stroke(255);
        ellipse(position.x, position.y, 4, 4);
      }else if(j==30){
        fill(255,0,0);
        stroke(255,0,0);
        ellipse(position.x, position.y, 4, 4);
      }else{
        fill(100);
        stroke(100);
        ellipse(position.x, position.y, 2, 2);
      }
      
    }
  }
}

function drawParts(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);

  for (let i = 0; i < detections.length; i += 1) {
    //console.log(detections[i]);
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    //const z = feature[i]._z;
    //console.log("z:"+z)
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}
