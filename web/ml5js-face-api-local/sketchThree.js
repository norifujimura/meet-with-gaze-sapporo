let faceapi;
let video;
let detections;

var videoBuffer;

let videoWidth = 640;
let videoHeight =480;

var stats;

let faces=[];
let flipY = true;

//let canvas, ctx;

//var videoBuffer;

// relative path to your models from window.location.pathname
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  minConfidence: 0.1,
  Mobilenetv1Model: "models",
  FaceLandmarkModel: "models",
  FaceRecognitionModel: "models",
};

function setup() {
  console.log("setup()");
  frameRate(40);
  angleMode(DEGREES);

  stats = new Stats();
  stats.showPanel(0);// 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  createCanvas(videoWidth, videoHeight);
  videoBuffer = createGraphics(videoWidth, videoHeight);

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

function draw(){
  
  //console.log("capture w:"+video.width);
  //console.log("capture h:"+video.height);

  stats.begin();
  faceapi.detect(gotResults);

  if(flipY){
    videoBuffer.push();
    videoBuffer.scale(-1, 1);
    videoBuffer.image(video, -videoWidth, 0);
    videoBuffer.pop();
    //videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  }else{
    videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  }
  
  if(detections!=undefined){
    
    if (detections.length > 0) {
      console.log("defections length:"+detections.length);
      drawBox(videoBuffer);
      drawParts(videoBuffer);
      drawLandmarks(videoBuffer);

      processDetections();

      drawOrientations(videoBuffer);
    }
  }

  // Paint the off-screen buffers onto the main canvas
  image(videoBuffer, 0, 0,videoWidth,videoHeight);

  //detections = undefined;

  stats.end();
}

function gotResults(err, result) {
  
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;
}

function processDetections(){
  faces=[];
  for (let i = 0; i < detections.length; i += 1) {
    faces.push(processDetection(detections[i]));
  }
}

function processDetection(detection){
  let f = new faceClass();

  const alignedRect = detection.alignedRect;

  f.box.two.w = alignedRect._box._width;
  f.box.two.h = alignedRect._box._height;

  if(flipY){
    f.box.two.x = videoWidth - alignedRect._box._x - f.box.two.w;
  }else{
    f.box.two.x = alignedRect._box._x;
  }
  f.box.two.y = alignedRect._box._y;

  if(flipY){
    f.rightEar.x = videoWidth - detection.landmarks.positions[0].x;
  }else{
    f.rightEar.x = detection.landmarks.positions[0].x;
  }
  f.rightEar.y = detection.landmarks.positions[0].y;
  
  if(flipY){
    f.leftEar.x = videoWidth - detection.landmarks.positions[16].x;
  }else{
    f.leftEar.x = detection.landmarks.positions[16].x;
  }
  f.leftEar.y = detection.landmarks.positions[16].y;

  if(flipY){
    f.noseTip.x = videoWidth - detection.landmarks.positions[30].x;
  }else{
    f.noseTip.x = detection.landmarks.positions[30].x;
  }
  f.noseTip.y = detection.landmarks.positions[30].y;

  //var w = leftEar.x - rightEar.x;
  f.center.two.x = (f.rightEar.x + f.leftEar.x)/2.0;
  f.center.two.y = (f.rightEar.y + f.leftEar.y)/2.0;
  
  f.width.original = dist(f.rightEar.x,f.rightEar.y,f.leftEar.x,f.leftEar.y);

  //atan2(y, x);
  /*
  
  var x = f.center.two.x - rightEar.x;
  var y = f.center.two.x - noseTip.x;
  */

  
  if(f.noseTip.x < f.center.two.x ){
    //right plus case
    var x = f.center.two.x - f.rightEar.x;
    var y = f.center.two.x - f.noseTip.x;
    f.rotation = atan2(y,x);
  }else if(f.noseTip.x > f.center.two.x ){
    //left minus case
    var x = f.leftEar.x - f.center.two.x;
    var y = f.noseTip.x - f.center.two.x;
    f.rotation = -1.0 * atan2(y,x);
  }else{
    f.rotation = 0;
  }

  return f;
}

function drawOrientations(g){
  for (let i = 0; i < faces.length; i += 1) {

    var f = faces[i];

    g.noFill();
    g.stroke(255,127,127);
    g.strokeWeight(2);
    g.circle(f.box.two.x, f.box.two.y, 60, 60);

    g.fill(127,255,127);
    g.noStroke();
    g.circle(f.center.two.x, f.center.two.y, 6, 6);

    console.log("rot:"+f.rotation)

    g.push();
      g.angleMode(DEGREES);
      g.translate(f.box.two.x, f.box.two.y);
      g.rotate(f.rotation);

      g.noFill();
      g.stroke(255,127,127);
      g.strokeWeight(2);
      g.rect(-5, 0, 10, 30);
    g.pop();
  }
}

function drawBox(g) {
  for (let i = 0; i < faces.length; i += 1) {
    var f = faces[i];
    g.noFill();
    g.stroke(161, 95, 251);
    g.strokeWeight(2);
    g.rect(f.box.two.x, f.box.two.y, f.box.two.w, f.box.two.h);
  }
}

function drawLandmarks(g) {

  g.ellipseMode(CENTER);
  g.fill(100);
  g.noStroke();

  for (let i = 0; i < detections.length; i += 1) {
    //console.log(detections[i]);
    var detection = detections[i];
    for (let j = 0; j < detection.landmarks.positions.length; j += 1) {
      var position = detection.landmarks.positions[j];

      var tempX =0;
      var tempY = detection.landmarks.positions[j].y;
      if(flipY){
        tempX = videoWidth - detection.landmarks.positions[j].x;
      }else{
        tempX = detection.landmarks.positions[j].x;
      }

      //0 and 16 for ears
      //30 for nose tip

      if(j==0 || j== 16){
        g.fill(255);
        //g.stroke(255);
        g.ellipse(tempX,tempY, 4, 4);
      }else if(j==30){
        g.fill(255,0,0);
        //stroke(255,0,0);
        g.ellipse(tempX,tempY, 4, 4);
      }else{
        g.fill(100);
        //stroke(100);
        g.ellipse(tempX, tempY, 4, 4);
      }
      
    }
  }
}

function drawParts(g) {
  g.noFill();
  g.stroke(161, 95, 251);
  g.strokeWeight(2);

  for (let i = 0; i < detections.length; i += 1) {
    //console.log(detections[i]);
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    drawPart(g,mouth, true);
    drawPart(g,nose, false);
    drawPart(g,leftEye, true);
    drawPart(g,leftEyeBrow, false);
    drawPart(g,rightEye, true);
    drawPart(g,rightEyeBrow, false);
  }
}

function drawPart(g,feature, closed) {
  g.beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    //const z = feature[i]._z;
    //console.log("z:"+z)
    g.vertex(x, y);
  }

  if (closed === true) {
    g.endShape(CLOSE);
  } else {
    g.endShape();
  }
}
