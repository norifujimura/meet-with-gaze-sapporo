let faceapi;
let video;
let detections;
let isUpdate = true;

var videoBuffer;
var perspectiveBuffer;
var isometricBuffer;
var lightBuffer;
var isoCam,persCam;
var zoom = 1.0;

//Logitech camera
/*
let videoWidth = 1920;
let videoHeight =1080;
let displayRatio = 0.5;
let angleOfView = 78;
*/

//Sanwa camera
/*
let videoWidth = 1920;
let videoHeight =1080;
let displayRatio = 0.4;
let angleOfView = 150;
*/

//Apple facetime camera on M1 macbook pro
let videoWidth = 640;
let videoHeight = 480;
let displayRatio = 0.75;
let angleOfView = 54;

var fiveMetersDistance;
var fiveMetersHeight;

let displayWidth;
let displayHeight;


//Screen means where 1pixel equals phisical 1mm
let screenDistance = 0;//screenDistance will be calculated in Setup()
let lightDistance = -100;//distance from zero point to LED bar
let eyeLineLength = 5000;//500cm
let lightLength = 1000;//100cm

let faces=[];
let isFlipY = true;

var stats;//for stats UI

let state = 'init';//init,video, perspective,iso,light

let headWidth = 157;//mm  https://www.airc.aist.go.jp/dhrt/head/index.html

// relative path to your models from window.location.pathname
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
  minConfidence: 0.75,
  Mobilenetv1Model: "models",
  FaceLandmarkModel: "models",
  FaceRecognitionModel: "models",
};

function setup() {
  console.log("setup()");
  frameRate(30);
  angleMode(DEGREES);

  stats = new Stats();
  stats.showPanel(0);// 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  //screen: where 1pixel corresponds 1mm
  //
  screenDistance = (videoWidth/2.0)/tan(angleOfView/2.0);
  fiveMetersDistance = 2500 /tan(angleOfView/2.0);
  fiveMetersHeight = 5000 * videoHeight / videoWidth;
  document.getElementById("message2").textContent  = "5meter depth:"+ fiveMetersDistance;

  displayWidth = videoWidth * displayRatio;
  displayHeight = videoHeight* displayRatio;

  createCanvas(displayWidth*2, displayHeight*2);

  videoBuffer = createGraphics(videoWidth, videoHeight);

  perspectiveBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  perspectiveBuffer.normalMaterial();
  //perspectiveBuffer.debugMode();

  persCam = perspectiveBuffer.createCamera();
  persCam.setPosition(0,0,-screenDistance);
  persCam.lookAt(0, 0, 0);

  isometricBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  isometricBuffer.normalMaterial();

  isoCam= isometricBuffer.createCamera();
  isoCam.ortho(-videoWidth,videoWidth,-videoHeight,videoHeight,0,20000);
  isoCam.setPosition(-1000,-1000,1000);
  //isoCam.lookAt(0, 0, 500);
  isoCam.lookAt(0, 0, 0);

  lightBuffer = createGraphics(videoWidth, videoHeight);

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

  textAlign(CENTER);
}

function modelReady() {
  console.log("ready!");
  console.log(faceapi);
  message("Model is ready");
  state = 'video';
  //faceapi.detect(gotResults);
}

function draw(){
  
  //console.log("capture w:"+video.width);
  //console.log("capture h:"+video.height);

  stats.begin();
  if(!isUpdate){
    faces = [];
    stats.end();
    return;
  }
  //faceapi.detect(gotResults);
  
  if(detections!=undefined){
    if (detections.length > 0) {
      console.log("defections length:"+detections.length);
      processDetections();
      calcIntersections();
    }
  }

  drawVideoBuffer();
  drawPerspectiveBuffer();
  drawIsometricBuffer();
  drawLightBuffer();

  // Paint the off-screen buffers onto the main canvas
  image(videoBuffer, 0, 0,displayWidth,displayHeight);
  image(perspectiveBuffer, 0, displayHeight,displayWidth,displayHeight);
  image(isometricBuffer, displayWidth, 0,displayWidth,displayHeight);
  image(lightBuffer, displayWidth,displayHeight,displayWidth,displayHeight);
  //detections = undefined;
  //this should be at the end of the loop to make it optimized. 
  //Give detector a room to culc before next loop starts.
  isUpdate = false;
  faceapi.detect(gotResults);
  stats.end();
}

function gotResults(err, result) {
  
  if (err) {
    console.log(err);
    return;
  }
  // console.log(result)
  detections = result;
  isUpdate = true;
}

function drawVideoBuffer(){

  if(isFlipY){
    videoBuffer.push();
    videoBuffer.scale(-1, 1);
    videoBuffer.image(video, -videoWidth, 0);
    videoBuffer.pop();
    //videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  }else{
    videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  }

  drawBox(videoBuffer);
  //drawParts(videoBuffer);
  drawLandmarks(videoBuffer);
  drawOrientations(videoBuffer);
}

//Perspective
function drawPerspectiveBuffer(){
  //draw center point
  perspectiveBuffer.background(220);
  perspectiveBuffer.translate(0,0,0);
  perspectiveBuffer.box(10);
  //

  drawCoordinates(perspectiveBuffer);
  drawVideoScreen(perspectiveBuffer);
  drawCamera(perspectiveBuffer);
  drawLight(perspectiveBuffer);

  drawFaceBoxes(perspectiveBuffer);
  drawEyeLines(perspectiveBuffer);
  drawIntersections(perspectiveBuffer);
  
  //drawMeshOriginalPoints(perspectiveBuffer);
  /*
  drawMeshPoints(perspectiveBuffer);
  drawFaceBoxes(perspectiveBuffer);
  drawEyeLines(perspectiveBuffer);
  */
  
  //drawMeshsOriginal(perspectiveBuffer);
  //drawKeyPoints(perspectiveBuffer);
  //drawFaceBoxes(perspectiveBuffer);
  //drawEyes(perspectiveBuffer);
  //drawCenteredMesh(perspectiveBuffer);
  //drawPoints(perspectiveBuffer);
}

//Isometric
function drawIsometricBuffer(){
  isometricBuffer.background(220);
  isometricBuffer.translate(0,0,0);
  isometricBuffer.box(10);

  drawCoordinates(isometricBuffer);
  drawVideoScreen(isometricBuffer);
  drawCamera(isometricBuffer);
  drawLight(isometricBuffer);

  drawFaceBoxes(isometricBuffer);
  drawEyeLines(isometricBuffer);
  drawIntersections(isometricBuffer);

  //drawMeshOriginalPoints(isometricBuffer);
  /*
  drawMeshPoints(isometricBuffer);
  drawFaceBoxes(isometricBuffer);
  drawEyeLines(isometricBuffer);
  */

  //drawMeshs(isometricBuffer);
  //drawFaceBoxes(isometricBuffer);
  //drawEyes(isometricBuffer);
  //drawCamera(isometricBuffer);

  //drawLight(isometricBuffer);

  //drawIntersections(isometricBuffer);

  //drawCenteredMesh(isometricBuffer);
  //drawPoints(isometricBuffer);
  //drawLed(isometricBuffer);
}

function drawLightBuffer(){
}

function processDetections(){
  faces=[];
  for (let i = 0; i < detections.length; i += 1) {
    faces.push(processDetection(detections[i]));
  }
}

function flipY(value){
  return videoWidth - value;
}

function processDetection(detection){
  let f = new faceClass();

  const alignedRect = detection.alignedRect;

  f.box.two.w = alignedRect._box._width;
  f.box.two.h = alignedRect._box._height;

  if(isFlipY){
    f.box.two.x = flipY(alignedRect._box._x + f.box.two.w);
  }else{
    f.box.two.x = alignedRect._box._x;
  }
  f.box.two.y = alignedRect._box._y;

  //landmarks
  for (let j = 0; j < detection.landmarks.positions.length; j += 1) {
    var position = detection.landmarks.positions[j];

    var tempX =0;
    var tempY = detection.landmarks.positions[j].y;
    if(isFlipY){
      tempX = flipY(detection.landmarks.positions[j].x);
    }else{
      tempX = detection.landmarks.positions[j].x;
    }

    f.landmarks.push({x:tempX,y:tempY});

    //0 and 16 for ears
    //30 for nose tip

    if(j==0){
      f.rightEar = {x:tempX,y:tempY};
    }else if(j==16){
      f.leftEar = {x:tempX,y:tempY};
    }else if(j==30){
      f.noseTip = {x:tempX,y:tempY};
    }
  }

  //var w = leftEar.x - rightEar.x;
  f.center.two.x = (f.rightEar.x + f.leftEar.x)/2.0;
  f.center.two.y = (f.rightEar.y + f.leftEar.y)/2.0;
  
  f.width.original = dist(f.rightEar.x,f.rightEar.y,f.leftEar.x,f.leftEar.y);
  

  //calc rotation
  var x = f.center.two.x - f.rightEar.x;
  var y = f.center.two.x - f.noseTip.x;
  f.rotation =  -1* atan2(y,x) + 180.0;
  
  //calc true width 
  //trueW = originalW / cosTheta
  f.width.two = f.width.original / cos(f.rotation);
  f.height.two = f.box.two.h;

  //ThreeD
  f.ratio =  headWidth / f.width.two;
  
  //console.log("headWidth:"+ f.width.two + " ratio:"+ f.ratio );

  //convert ml5js coordinates to video and  p5js coordinates
  var twoX = f.center.two.x - videoWidth/2;
  var twoY = f.center.two.y - videoHeight/2;

  f.center.three.x = twoX * f.ratio;
  f.center.three.y = twoY * f.ratio;
  f.center.three.z = screenDistance * f.ratio;

  f.height.three = f.height.two / f.ratio;

  return f;
}

//Calc intersection
function calcIntersections(){
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
      let rot = f.rotation+180;
      f.eyeLine.deltax = sin(rot) * eyeLineLength;
      f.eyeLine.deltaz = cos(rot) * eyeLineLength;
    
      f.eyeLine.x = f.center.three.x + f.eyeLine.deltax;
      f.eyeLine.y = 0;
      f.eyeLine.z = f.center.three.z + f.eyeLine.deltaz;
      //calcIntersect(x1, y1, x2, y2, x3, y3, x4, y4)
      f.intersect = calcIntersect(-lightLength/2,lightDistance,lightLength/2,lightDistance,f.center.three.x,f.center.three.z,f.eyeLine.x,f.eyeLine.z);
  }
}

function drawFaceBoxes(g) {
  g.angleMode(DEGREES);
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
      g.push();
        g.noFill();
        g.stroke(127,127,127);
        g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
        g.rotateY(f.rotation);
        g.box(headWidth,f.height.three,headWidth);
      g.pop();
  }
}

function drawEyeLines(g){
  //let length = 10000;
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];

      g.push();
        g.noFill();
        g.stroke(255,255,255);
        g.strokeWeight(4);

        g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
        g.rotateY(f.rotation+180);
        g.line(0,0,0,0,0,eyeLineLength);
        //g.line(f.center.three.x,f.center.three.y,f.center.three.z,f.eyeLine.x,0,f.eyeLine.z);
      g.pop();

  }
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

    //console.log("rot:"+f.rotation)

    g.push();
      g.angleMode(DEGREES);
      g.translate(f.box.two.x, f.box.two.y);
      g.rect(0, 2, f.width.two, 4);

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
    g.textSize(20);
    g.text(f.rotation, f.box.two.x+100, f.box.two.y+100);
  }
}

function drawLandmarks(g) {

  g.ellipseMode(CENTER);
  g.fill(100);
  g.noStroke();

  for (let i = 0; i < faces.length; i += 1) {
    var f = faces[i];
    for (let j = 0; j < f.landmarks.length; j += 1) {
      var pos = f.landmarks[j];
      //0 and 16 for ears
      //30 for nose tip

      if(j==0 || j== 16){
        g.fill(255);
        //g.stroke(255);
        g.ellipse(pos.x,pos.y, 4, 6);
      }else if(j==30){
        g.fill(255,0,0);
        //stroke(255,0,0);
        g.ellipse(pos.x,pos.y, 4, 6);
      }else{
        g.fill(127);
        //stroke(100);
        g.ellipse(pos.x, pos.y, 4, 6);
      }
    }
  }
}




