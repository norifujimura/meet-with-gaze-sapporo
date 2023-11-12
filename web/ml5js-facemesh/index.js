let facemesh;
let video;
let predictions = [];

var videoBuffer;
var threedBuffer;

/*
let videoWidth = 1920;
let videoHeight =1080;
*/

let videoWidth = 640;
let videoHeight =480;

let displayWidth;
let displayHeight;
let displayRatio = 0.5;

let faceWidthThreshold = 400;


let face={
  center:{
    x:0,
    y:0,
    z:0,
  },
  headCenter:{
    x:0,
    y:0,
    z:0,
  },
  eyeLine:{
    start:{},
    end:{},
  },
  led:{
    point:{},
  }
};



let state = 'init';//init,search,found

let isoMode = 'diagonal'; //diagonal,top

let eyeLineLength = 5000;
let ledDistance = 400;
let ledLength = 1000;

const options = {
  flipHorizontal: false, // boolean value for if the video should be flipped, defaults to false
  maxContinuousChecks: 100, // How many frames to go without running the bounding box detector. Only relevant if maxFaces > 1. Defaults to 5.
  detectionConfidence: 0.5, // Threshold for discarding a prediction. Defaults to 0.9.
  maxFaces: 10, // The maximum number of faces detected in the input. Should be set to the minimum number for performance. Defaults to 10.
  scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75.
  iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
  }

function setup() {

  displayWidth = videoWidth * displayRatio;
  displayHeight = videoHeight* displayRatio;

  createCanvas(displayWidth*2, displayHeight*2);
  angleMode(DEGREES); // Change the mode to 

  videoBuffer = createGraphics(videoWidth, videoHeight);

  perspectiveBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  
  //perspectiveBuffer.camera(0,0, 100, 0, 0, 0, 0, 1, 0);
  perspectiveBuffer.normalMaterial();
  perspectiveBuffer.debugMode();

  isometricBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  //isometricBuffer.debugMode();
  isometricBuffer.normalMaterial();
  //graphBuffer = createGraphics(videoWidth, videoHeight);

  //perspectiveBuffer.camera(0, 100, 500, 0, 0, 0, 0, 1, 0);

  isoCam= isometricBuffer.createCamera();
  //isoCam.ortho();
  

  mouseClicked(); 

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
      audio: true
    };

  //video = createCapture(VIDEO);
  video = createCapture(constraints);
  //video.size(videoWidth, videoHeight);

  facemesh = ml5.facemesh(video, options,modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  facemesh.on("face", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
}

function mouseClicked() {

  if(isoMode == "diagonal"){
    isoMode = "top";
  }else if(isoMode == "top"){
    isoMode = "far";
  }else if(isoMode == "far"){
    isoMode = "diagonal";
  }

  if(isoMode == "diagonal"){
    isoCam.ortho(-videoWidth/2,videoWidth/2,-videoHeight/2,videoHeight/2,0,10000);
    isoCam.setPosition(-100,-100,100);
    isoCam.lookAt(0, 0, 0);
  }else if(isoMode == "top"){
    isoCam.ortho(-videoWidth/2,videoWidth/2,-videoHeight/2,videoHeight/2,0,10000);
    isoCam.setPosition(0,-5000,-0.1);
    isoCam.lookAt(0, 0, 0);
  }else if(isoMode == "far"){
    isoCam.ortho(-videoWidth,videoWidth,-videoHeight,videoHeight,0,10000);
    isoCam.setPosition(0,-5000,-0.1);
    isoCam.lookAt(0, 0, 0);
  }
}

function draw() {

  console.log("predictions length:"+predictions.length);
  //perspectiveBuffer.orbitControl();
  //isometricBuffer.orbitControl();
  //normlizeScaledMesh();
  // Draw on your buffers however you like

  //https://learn.ml5js.org/#/reference/facemesh

  if(predictions.length == 0){
    state = 'search';
  }else{
    state = 'found';
  }

  if(state == 'search'){
    videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
    perspectiveBuffer.background(64);
    isometricBuffer.background(64);
  }else if(state == 'found'){
    processMesh();

    drawVideoBuffer();
    drawPerspectiveBuffer();
    drawIsometricBuffer();
  }

  // Paint the off-screen buffers onto the main canvas
  image(videoBuffer, 0, 0,displayWidth,displayHeight);
  image(perspectiveBuffer, 0, displayHeight,displayWidth,displayHeight);
  image(isometricBuffer, displayWidth, 0,displayWidth,displayHeight);
  //image(graphBuffer, videoWidth, videoHeight);
}

function drawVideoBuffer(){
  videoBuffer.image(video, 0, 0, videoWidth, videoHeight);
  // We call function to draw all keypoints
  drawVideoFace();
}

// A function to draw ellipses over the detected keypoints
function drawVideoFace() {
    // Draw facial keypoints.
    for (let j = 0; j < face.points.length; j += 1) {
        let x  = face.videoPoints[j].x;
        let y  = face.videoPoints[j].y;

        videoBuffer.fill(255, 255, 255);
        videoBuffer.ellipse(x, y, 5, 5);
    }
}

function processMesh(){

  //culc center
  let xMin = 1000;
  let xMax = -1000;
  let yMin = 1000;
  let yMax = -1000;
  let zMin = 1000;
  let zMax = -1000;

  let points = predictions[0].scaledMesh;

  face.videoPoints = [];
  face.points = [];
  face.headCenter= {};
  
  //convert ml5js coordinates to video and  p5js coordinates
  for (let j = 0; j < points.length; j += 1) {
    let [x, y,z] = points[j];

    face.videoPoints.push({x:x,y:y,z:z});

    x-=videoWidth/2;
    y-=videoHeight/2;

    face.points.push({x:x,y:y,z:-z});
  }
  
  //center 
  for (let j = 0; j < face.points.length; j += 1) {
    let p = face.points[j];

    if(p.x<xMin){
      xMin = p.x;
    }
    if(p.x>xMax){
      xMax = p.x;
    }
    if(p.y<yMin){
      yMin = p.y;
    }
    if(p.y>yMax){
      yMax = p.y;
    }
    if(p.z<zMin){
      zMin = p.z;
    }
    if(p.z>zMax){
      zMax = p.z;
    }
  }

  console.log("zMin=:"+zMin);
  console.log("zMax=:"+zMax);
  
  face.center.x = (xMax+xMin)/2.0;
  face.center.y = (yMax+yMin)/2.0;
  face.center.z = (zMax+zMin)/2.0;

  face.lip = face.points[0];
  face.nose = face.points[1] ;
  face.top = face.points[10] ;
  face.bottom = face.points[152] ;
  face.right = face.points[234] ;
  face.left = face.points[454] ;

  face.headCenter.x = (face.right.x + face.left.x)/2.0;
  face.headCenter.y = (face.right.y + face.left.y)/2.0;
  face.headCenter.z = (face.right.z + face.left.z)/2.0;

  let centerToRight= {};
  centerToRight.x = face.right.x - face.headCenter.x;
  centerToRight.z = face.right.z - face.headCenter.z;

  /*
  //calc direction of the liptop and center around Y axis
  let directionX = face.nose.x - face.headCenter.x;
  let directionZ = face.nose.z - face.headCenter.z;
  */

  let directionX = centerToRight.z;
  let directionZ = -centerToRight.x;

  face.direction = -1 * calcAngleDegrees(directionX,directionZ);

}

function calcAngleDegrees(x, y) {
  //return (Math.atan2(y, x) * 180) / Math.PI;
  return (Math.atan2(y, x));
}

function drawPerspectiveBuffer(){
  perspectiveBuffer.background(220);
  perspectiveBuffer.translate(0,0,0);
  perspectiveBuffer.box(10);
  drawCoordinates(perspectiveBuffer);
  drawMesh(perspectiveBuffer);
  drawCenteredMesh(perspectiveBuffer);
  drawPoints(perspectiveBuffer);
}

function drawIsometricBuffer(){
  isometricBuffer.background(220);
  isometricBuffer.translate(0,0,0);
  isometricBuffer.box(10);
  drawCoordinates(isometricBuffer);
  drawMesh(isometricBuffer);
  drawCenteredMesh(isometricBuffer);
  drawPoints(isometricBuffer);
  drawLed(isometricBuffer);
}

function drawCoordinates(g){
  push();
  g.fill(255,0,0);
  g.stroke(255,0,0);
  g.line(0, 0, 0,100,0,0);
  pop();

  push();
  g.fill(0,255,0);
  g.stroke(0,255,0);
  g.line(0, 0, 0,0,100,0);
  pop();

  push();
  g.fill(0,0,255);
  g.stroke(0,0,255);
  g.line(0, 0, 0,0,0,100);
  pop();
}

function drawPoints(g) {
  let center = face.headCenter;
  g.fill(127,127,127);
  g.stroke(0,0,0);
  //direction
  g.push();
    g.translate(center.x,center.y,center.z);
    g.rotateY(face.direction);
    g.push();
      g.rotateZ(degToRad(-90));
      //g.translate(0,62.5,0);
      g.translate(0,500,0);
      //g.cone(25,25,4,1);//radius,height,segmentsX, segmentsY=1
      g.cone(25,1000,4,1);//radius,height,segmentsX, segmentsY=1
    g.pop(); 
    //g.box(50);
  g.pop(); 
  
  //disc
  g.push();
  g.translate(center.x,0,center.z);
  g.cylinder(50,1);//radius,height
  g.pop(); 

  g.push();
  g.translate(center.x,center.y,center.z);
  g.cylinder(50,1);//radius,height
  g.pop(); 

  g.push();
  g.translate(center.x,center.y/2,center.z);
  g.box(1,center.y,1);//radius,height
  g.pop(); 
  //

  // Draw facial keypoints.
  g.fill(0,64,0);
  drawPoint(g,face.nose,10);
  g.fill(64,0,0);
  drawPoint(g,face.lip,10);
  g.fill(127,0,0);
  drawPoint(g,face.right,10);
  g.fill(0,0,127);
  drawPoint(g,face.left,10);
  g.fill(127,127,127);
}

function drawPoint(g,p,size){
  //g.fill(127,127,127);
  //g.stroke(0,0,0);

  g.push();
  //g.translate(p.x-(videoWidth/2),p.y-(videoHeight/2),p.z);
  g.translate(p.x,p.y,p.z);
  g.box(size);
  g.pop(); 
}

function drawLed(g) {
  g.fill(255,255,255);
  g.stroke(0,0,0);

  g.push();
  //g.translate(p.x-(videoWidth/2),p.y-(videoHeight/2),p.z);
  g.translate(0,0,ledDistance);
  //g.rotateX(90);
  //g.plane(ledLength,ledLength/10);
  g.box(ledLength,ledLength/10,1);
  g.pop(); 
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {

  // Draw facial keypoints.
  for (let j = 0; j < face.points.length; j += 1) {
    let x  = face.videoPoints[j].x;
    let y  = face.videoPoints[j].y;

    videoBuffer.fill(255, 255, 255);
    videoBuffer.ellipse(x, y, 5, 5);
  }
}

function drawMesh(g) {
    // Draw facial keypoints.
    g.fill(255,255,255);
    g.stroke(0,0,0);
    for (let j = 0; j < face.points.length; j += 1) {
      //console.log(face.points[j]);
      let p = face.points[j];
      drawPoint(g,p,1);
      /*
      g.push();
      g.translate(x-(videoWidth/2),y-(videoHeight/2),z);
      g.box(1);
      g.pop(); 
      */
    }
}

function drawCenteredMesh(g){

  //draw
  // Draw facial keypoints.
  g.fill(255,255,255);
  g.stroke(0,0,0);
  for (let j = 0; j < face.points.length; j += 1) {
    //const [x, y,z] = face.points[j];
    let p = face.points[j];
    let nx = p.x - face.center.x;
    let ny = p.y - face.center.y;
    let nz = p.z - face.center.z;
    let np = {x:nx,y:ny,z:nz};

    drawPoint(g,np,1);

    /*
    g.push();
    g.translate(nx,ny,nz);
    g.box(1);
    g.pop(); 
    */
  }
}

function degToRad(deg){
  var pi = Math.PI;
  return deg * (pi/180);
}