let facemesh;
let video;
let predictions = [];

var videoBuffer;
var perspectiveBuffer;
var isometricBuffer;
var lightBuffer;

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
let displayRatio = 0.4;
let angleOfView = 54;

let displayWidth;
let displayHeight;

//Screen means where 1pixel equals phisical 1mm
let screenDistance = 0;//screenDistance will be calculated in Setup()
let lightDistance = 100;//distance from zero point to LED bar
let eyeLineLength = 4000;//400cm
let lightLength = 1000;//100cm

let faces=[];

let state = 'init';//init,search,found
let isoMode = 'diagonal'; //diagonal,top

var isEncount = false;
let encounterThreshold = 100;

//let faceWidthThreshold = 400;

var faceClass = class{
  constructor(){
    this.videoPoints = [];

    this.originalPoints = [];
    this.originalLeft=[];
    this.originalRight=[];
    this.originalHeadWidth = 0;
    this.ratio = 0;

    this.points= [];
    this.center = [];
    this.headCenter = [];

    this.eyeLine = [];
  }

  set setEyeLine(el){
    this.eyeLine = el;
  }
  get getEyeLine(){
    return this.eyeLine;
  }

  set point(p){
    this.vpoints.push(p);
  }

  set videoPoint(p){
    this.videoPoints.push(p);
  }

}

const options = {
  flipHorizontal: false, // boolean value for if the video should be flipped, defaults to false
  maxContinuousChecks: 100, // How many frames to go without running the bounding box detector. Only relevant if maxFaces > 1. Defaults to 5.
  detectionConfidence: 0.5, // Threshold for discarding a prediction. Defaults to 0.9.
  maxFaces: 10, // The maximum number of faces detected in the input. Should be set to the minimum number for performance. Defaults to 10.
  scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75.
  iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
  }

let headWidth = 157;//mm  https://www.airc.aist.go.jp/dhrt/head/index.html

function setup() {
  frameRate(20);
  //calc camera disnace to the 1pix=1mmm screen
  angleMode(DEGREES);
  //if angle is 54:
  // tan(27) = 320 / x
  // x*tan(27) = 320
  // x = 320 / tan(27)
  screenDistance = (videoWidth/2.0)/tan(angleOfView/2.0);
  //screen: where 1pixel corresponds 1mm
  //

  displayWidth = videoWidth * displayRatio;
  displayHeight = videoHeight* displayRatio;

  createCanvas(displayWidth*2, displayHeight*2);
  angleMode(DEGREES); // Change the mode to 

  videoBuffer = createGraphics(videoWidth, videoHeight);

  perspectiveBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  perspectiveBuffer.normalMaterial();
  //perspectiveBuffer.debugMode();

  isometricBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
  isometricBuffer.normalMaterial();
  isoCam= isometricBuffer.createCamera();

  lightBuffer = createGraphics(videoWidth, videoHeight);
  

  mouseClicked(); 

  var constraints = {
    video: {
      /*
        deviceId: {
          label:'16MP USB Camera'
        },
        */
       
        label:{
          //exact:'1MP USB Camera'
          exact:'USB Camera'
        },
        

        //facingMode: "user",

        /*
        facingMode: {
          exact: "environment"
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

  if(isoMode == "diagonal-far"){
    isoMode = "top";
  }else if(isoMode == "top"){
    isoMode = "far";
  }else if(isoMode == "far"){
    isoMode = "diagonal";
  }else if(isoMode == "diagonal"){
    isoMode = "diagonal-far";
  }

  if(isoMode == "diagonal"){
    isoCam.ortho(-videoWidth,videoWidth,-videoHeight,videoHeight,0,10000);
    isoCam.setPosition(-1000,-1000,1000);
    //isoCam.lookAt(0, 0, 500);
    isoCam.lookAt(0, 0, 0);
  }else if(isoMode == "top"){
    isoCam.ortho(-videoWidth*2,videoWidth*2,-videoHeight*2,videoHeight*2,0,10000);
    /*
    isoCam.setPosition(0,-5000,-0.1);
    isoCam.lookAt(0, 0, 0);
    */
    //isoCam.setPosition(0,-100,300.0);
    //isoCam.lookAt(0, 0, 301.0);
    isoCam.setPosition(0,-100,0);
    isoCam.lookAt(0, 0, 1.0);
  }else if(isoMode == "far"){
    isoCam.ortho(-videoWidth*4,videoWidth*4,-videoHeight*4,videoHeight*4,0,10000);
    //isoCam.setPosition(0,-100,500.0);
    //isoCam.lookAt(0, 0, 501.0);
    isoCam.setPosition(0,-200,0);
    isoCam.lookAt(0, 0, 1.0);
  }else if(isoMode == "diagonal-far"){
    isoCam.ortho(-videoWidth*2,videoWidth*2,-videoHeight*2,videoHeight*2,0,10000);
    isoCam.setPosition(-2000,-2000,2000);
    //isoCam.lookAt(0, 0, 500);
    isoCam.lookAt(0, 0, 0);
  }
}

function draw() {

  console.log("predictions length:"+predictions.length);
  console.log("capture w:"+video.width);
  console.log("capture h:"+video.height);
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
    processMeshes();
    checkIntersections();

    //checkEncounters();
    drawVideoBuffer();
    drawPerspectiveBuffer();
    drawIsometricBuffer();
    drawLightBuffer();
  }

  // Paint the off-screen buffers onto the main canvas
  image(videoBuffer, 0, 0,displayWidth,displayHeight);
  image(perspectiveBuffer, 0, displayHeight,displayWidth,displayHeight);
  image(isometricBuffer, displayWidth, 0,displayWidth,displayHeight);
  image(lightBuffer, displayWidth,displayHeight,displayWidth,displayHeight);
}

//Video
function drawVideoBuffer(){
  videoBuffer.image(video, 0, 0, videoWidth, videoHeight);

  videoBuffer.text(isoMode, 0,videoHeight-5);
  // We call function to draw all keypoints
  drawVideoMeshes();
}

// A function to draw ellipses over the detected keypoints
function drawVideoMeshes() {
  for (let i = 0; i < faces.length; i += 1) {
    let face=faces[i];
    // Draw facial keypoints.
    for (let j = 0; j < face.points.length; j += 1) {
      let x  = face.videoPoints[j].x;
      let y  = face.videoPoints[j].y;

      videoBuffer.fill(255, 255, 255);
      videoBuffer.ellipse(x, y, 5, 5);
    }
  }
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
    drawCamera(isometricBuffer);
    
    //drawMeshOriginalPoints(perspectiveBuffer);
    drawMeshPoints(perspectiveBuffer);
    drawFaceBoxes(perspectiveBuffer);
    drawEyeLines(perspectiveBuffer);
    
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

    //drawMeshOriginalPoints(isometricBuffer);
    drawMeshPoints(isometricBuffer);
    drawFaceBoxes(isometricBuffer);
    drawEyeLines(isometricBuffer);

    //drawMeshs(isometricBuffer);
    //drawFaceBoxes(isometricBuffer);
    //drawEyes(isometricBuffer);
    //drawCamera(isometricBuffer);
    drawLight(isometricBuffer);

    drawIntersections(isometricBuffer);
    //drawCenteredMesh(isometricBuffer);
    //drawPoints(isometricBuffer);
    //drawLed(isometricBuffer);
}

//light sim
function drawLightBuffer(){
    /*
    lightBuffer.background(32);
    lightBuffer.fill(182,177,153);
    lightBuffer.rect(0,0,videoWidth,videoHeight/4);
    lightBuffer.fill(178,179,150);
    lightBuffer.rect(0,videoHeight/4*3,videoWidth,videoHeight/4);
    */
    lightBuffer.noStroke();
    //center bg
    //lightBuffer.fill(192,187,160);
    lightBuffer.fill(180,170,160);
    //lightBuffer.rect(0,videoHeight/4 + videoHeight/4 *0.25,videoWidth,videoHeight/4*1.7);
    lightBuffer.rect(0,videoHeight/4,videoWidth,videoHeight/2);

    //draw light body
    lightBuffer.fill(200,200,200);
    lightBuffer.rect(0,videoHeight/2,videoWidth,videoHeight/2*0.01);
    lightBuffer.fill(32,32,32,32);
    lightBuffer.rect(0,videoHeight*0.6,videoWidth,videoHeight/2*0.01);

    //draw moving light and its reflection
    drawMovingLight(lightBuffer,videoHeight/2);

    //black
    lightBuffer.fill(32,32,32);
    //top black
    lightBuffer.rect(0,videoHeight/4,videoWidth,-videoHeight/4*0.25);
    //bottom black
    lightBuffer.rect(0,videoHeight/4*3,videoWidth,videoHeight/4*0.05);

    //top black shadow
    lightBuffer.fill(32,32,32,32);
    lightBuffer.rect(0,videoHeight/4,videoWidth,videoHeight/4*0.1);

    /*
    //draw light body
    lightBuffer.fill(200,200,200);
    lightBuffer.rect(0,videoHeight/4 + videoHeight/4 *0.25 + videoHeight/4* 0.8,videoWidth,videoHeight/2*0.01);
    lightBuffer.fill(32,32,32,32);
    lightBuffer.rect(0,videoHeight/4 + videoHeight/4 *0.4 + videoHeight/4* 0.8,videoWidth,videoHeight/2*0.01);



    //black
    lightBuffer.fill(32,32,32);
    //top black
    lightBuffer.rect(0,videoHeight/4,videoWidth,videoHeight/4*0.25);
    //bottom black
    lightBuffer.rect(0,videoHeight/4*2.95,videoWidth,videoHeight/4*0.05);


    //top black shadow
    lightBuffer.fill(32,32,32,32);
    lightBuffer.rect(0,videoHeight/4*1.27,videoWidth,videoHeight/4*0.1);

    //ceiling
    lightBuffer.fill(182,177,153);
    lightBuffer.rect(0,0,videoWidth,videoHeight/4);
        //top gray
        lightBuffer.fill(151,148,113);
        lightBuffer.rect(0,videoHeight/4*0.8,videoWidth,videoHeight/4*0.2);
        //

    //floor
    lightBuffer.fill(178,179,150);
    lightBuffer.rect(0,videoHeight/4*3,videoWidth,videoHeight/4);
    */

}


//Calc intersection
function checkIntersections(){
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];
        face.intersect = intersect2(-lightLength/2,lightDistance,lightLength/2,lightDistance,face.headCenter.x,face.headCenter.z,face.eyeLine.x,face.eyeLine.z);
    }
}

function checkEncounters(){
    isEnount = false;
    if(faces.length==0){
        return;
    }

    if(faces.length==1){
        return;
    }

    if(faces.length==3){
        return;
    }

    if(abs(faces[0].intersect.x-faces[1].intersect.x)<encounterThreshold){
        isEnount = true;
    }

    return;
}

//Mesh process
function processMeshes(){
  faces=[];
  for (let j = 0; j < predictions.length; j += 1) {
    faces.push(processMesh(predictions[j].scaledMesh));
  }
}

function processMesh(points){
  let f = new faceClass();
  //let points = predictions[0].scaledMesh;

  //face.points = predictions[0].scaledMesh;

  //convert ml5js coordinates to video and  p5js coordinates
  for (let j = 0; j < points.length; j += 1) {
    let [x, y,z] = points[j];

    f.videoPoints.push({x:x,y:y,z:z});

    x-=videoWidth/2;
    y-=videoHeight/2;
    z = -z;
    z-=screenDistance;

    let p = {x:x,y:y,z:z};

    //p5js coordinates
    f.originalPoints.push(p);
  }

  //the width and standard head width ratio
  f.originalRight = f.originalPoints[234] ;
  f.originalLeft = f.originalPoints[454] ;

  f.originalHeadWidth = dist(f.originalRight.x,f.originalRight.y,f.originalRight.z,f.originalLeft.x,f.originalLeft.y,f.originalLeft.z);
  f.ratio =  headWidth / f.originalHeadWidth;

  console.log("headWith:"+ f.originalHeadWidth + " ratio:"+ f.ratio );

  //calc point in 3D space
  for (let j = 0; j < f.originalPoints.length; j += 1) {
    
    //let [x, y,z] = f.originalPoints[j];
    var x = f.originalPoints[j].x;
    var y = f.originalPoints[j].y;
    var z = f.originalPoints[j].z;
    x *= f.ratio;
    y *= f.ratio;
    z *= f.ratio;

    let p = {x:x,y:y,z:z};
    
    f.points.push(p);
  }

  //center 
  //culc center
  let xMin = 1000;
  let xMax = -1000;
  let yMin = 1000;
  let yMax = -1000;
  let zMin = 1000;
  let zMax = -1000;

  for (let j = 0; j < f.points.length; j += 1) {
    let p = f.points[j];

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
  
  f.center.x = (xMax+xMin)/2.0;
  f.center.y = (yMax+yMin)/2.0;
  f.center.z = (zMax+zMin)/2.0;

  f.lip = f.points[0];
  f.nose = f.points[1] ;
  f.top = f.points[10] ;
  f.bottom = f.points[152] ;
  f.right = f.points[234] ;
  f.left = f.points[454] ;

  f.headCenter.x = (f.right.x + f.left.x)/2.0;
  f.headCenter.y = (f.right.y + f.left.y)/2.0;
  f.headCenter.z = (f.right.z + f.left.z)/2.0;

  let centerToRight= {};
  centerToRight.x = f.nose.x - f.headCenter.x;
  centerToRight.z = f.nose.z - f.headCenter.z;

  let directionX = centerToRight.z;
  let directionZ = -centerToRight.x;

  f.direction = -1 * calcAngleDegrees(directionX,directionZ);

  //face box
  f.width = 2* dist(f.headCenter.x,f.headCenter.y,f.headCenter.z,f.right.x,f.right.y,f.right.z);
  f.height = 2* dist(f.headCenter.x,f.headCenter.y,f.headCenter.z,f.bottom.x,f.bottom.y,f.bottom.z);
  f.depth = 2* dist(f.headCenter.x,f.headCenter.y,f.headCenter.z,f.nose.x,f.nose.y,f.nose.z);

  f.degrees = -degrees(f.direction)+90;

  f.eyeLine.deltax = cos(f.degrees) * eyeLineLength;
  f.eyeLine.deltaz = sin(f.degrees) * eyeLineLength;

  f.eyeLine.x = f.headCenter.x + f.eyeLine.deltax;
  f.eyeLine.y = 0;
  f.eyeLine.z = f.headCenter.z + f.eyeLine.deltaz;

  return f;
}

//Common draw methods
function drawMovingLight(g,centerHeight){
    let ratio = videoWidth / lightLength;
    g.ellipseMode(CENTER);
    g.rectMode(CENTER);

    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];
        if(face.intersect == false){
            continue;
        }
        let x = (face.intersect.x * -1 + lightLength /2 )* ratio;
        //console.log("Intersect");
        g.noStroke();
        g.fill(255,255,255,64);
        g.ellipse(x,centerHeight,150,50);

        g.fill(255,255,255,32);
        g.ellipse(x,centerHeight,200,300);

        g.fill(255,255,255,16);
        g.ellipse(x,centerHeight,300,800);
        /*
        g.rectMode(CENTER);
        g.rect(x,centerHeight,100,100);
        */
        g.fill(255,255,255,200);
        g.rect(x,centerHeight,100,3);
    }
    g.rectMode(CORNER);
}

/*
function drawEncounter(g,centerHeight){
    let ratio = videoWidth / lightLength;
    g.ellipseMode(CENTER);

    if(isEncount){

        let rawX = (faces[0].intersect.x+faces[1].intersect.x)/2;
        let x = (frawX * -1 + lightLength /2 )* ratio;
        g.noStroke();
        g.fill(255,215,95,127);
        g.ellipse(x,centerHeight,150,50);

        g.fill(255,215,95,64);
        g.ellipse(x,centerHeight,200,300);

        g.fill(255,215,95,32);
        g.ellipse(x,centerHeight,300,800);
    }
}
*/

function drawMeshOriginalPoints(g) {
    // Draw facial keypoints.
    g.fill(255,255,255);
    g.stroke(0,0,0);
    
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];
        for (let j = 0; j < face.originalPoints.length; j += 1) {
            //console.log(face.points[j]);
            let p = face.originalPoints[j];
            drawPoint(g,p,1);
        }
    }
}

function drawMeshPoints(g) {
  // Draw facial keypoints.
  g.fill(255,255,255);
  g.stroke(255,0,0);
  
  for (let i = 0; i < faces.length; i += 1) {
      let face=faces[i];
      for (let j = 0; j < face.points.length; j += 1) {
          //console.log(face.points[j]);
          let p = face.points[j];
          drawPoint(g,p,1);
      }
  }
}

function drawEyeLines(g){
    //let length = 10000;
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];

        g.push();
        g.noFill();
        g.stroke(255,255,255);
        g.strokeWeight(4);
        /*
        g.translate(face.headCenter.x,face.headCenter.y,face.headCenter.z);
        //g.rotateY(face.direction);
        g.line(0,0,0,face.eye.deltax,0,face.eye.deltaz);
        */
        g.line(face.headCenter.x,face.headCenter.y,face.headCenter.z,face.eyeLine.x,0,face.eyeLine.z);
        g.pop();

    }
}

function drawFaceBoxes(g) {
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];

        g.push();
        g.noFill();
        g.stroke(127,127,127);
        g.translate(face.headCenter.x,face.headCenter.y,face.headCenter.z);
        g.rotateY(face.direction);
        g.box(face.width,face.height,face.depth);
        g.pop();
    }
}

function drawKeyPoints(g) {
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];
        //let center = face.headCenter;
        g.fill(127,127,127);
        g.stroke(0,0,0);

        // Draw facial keypoints.
        g.fill(200,200,200);
        drawPoint(g,face.headCenter,20);
        g.fill(0,64,0);
        drawPoint(g,face.nose,20);
        g.fill(64,0,0);
        drawPoint(g,face.lip,10);
        g.fill(127,0,0);
        drawPoint(g,face.right,20);
        g.fill(0,0,127);
        drawPoint(g,face.left,20);
        g.fill(127,127,127);
    }
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

function drawCoordinates(g){
    //x:red
    push();
    g.fill(255,0,0);
    g.stroke(255,0,0);
    g.line(0, 0, 0,100,0,0);
    pop();
  
    //y:green
    push();
    g.fill(0,255,0);
    g.stroke(0,255,0);
    g.line(0, 0, 0,0,100,0);
    pop();
  
    //z:blue
    push();
    g.fill(0,0,255);
    g.stroke(0,0,255);
    g.line(0, 0, 0,0,0,100);
    pop();
}

function drawVideoScreen(g){
  g.push();
    g.strokeWeight(8);
    g.noFill();
    g.stroke(255,32,32);

    g.translate(0,0,-screenDistance);
    g.box(videoWidth,videoHeight,0);
    //g.plane(videoWidth,videoHeight)
  g.pop();
}

function drawCamera(g){
    push();
        g.strokeWeight(4);
        g.noFill();
        g.stroke(32,32,32);
        g.push();
          g.translate(0,0,-screenDistance);
          g.box(videoWidth,videoHeight,0);
        g.pop();

        g.line(0,0,0,-videoWidth/2,-videoHeight/2,-screenDistance);
        g.line(0,0,0,videoWidth/2,-videoHeight/2,-screenDistance);
        g.line(0,0,0,-videoWidth/2,videoHeight/2,-screenDistance);
        g.line(0,0,0,videoWidth/2,videoHeight/2,-screenDistance);
    pop();
}

function drawLight(g){
    push();
        g.strokeWeight(4);
        g.noFill();
        g.stroke(32,32,32);
        g.line(-lightLength/2,0,lightDistance,lightLength/2,0,lightDistance);
    pop();
}

function drawIntersections(g){
    for (let i = 0; i < faces.length; i += 1) {
        let face=faces[i];
        if(face.intersect == false){
            continue;
        }
        console.log("Intersect");
        push();
            g.stroke(0,0,0);
            g.fill(200,200,200);
            drawPoint(g,{x:face.intersect.x,y:0,z:face.intersect.z},40);
        pop(); 
    }
}

//Utils
function calcAngleDegrees(x, y) {
  //return (Math.atan2(y, x) * 180) / Math.PI;
  return (Math.atan2(y, x));
}

//https://editor.p5js.org/mwburke/sketches/h1ec1s6LG

function intersect_point(point1, point2, point3, point4) {
    const ua = ((point4[0] - point3[0]) * (point1[1] - point3[1]) - 
              (point4[1] - point3[1]) * (point1[0] - point3[0])) /
             ((point4[1] - point3[1]) * (point2[0] - point1[0]) - 
              (point4[0] - point3[0]) * (point2[1] - point1[1]));
   
   const ub = ((point2[0] - point1[0]) * (point1[1] - point3[1]) - 
              (point2[1] - point1[1]) * (point1[0] - point3[0])) /
             ((point4[1] - point3[1]) * (point2[0] - point1[0]) - 
              (point4[0] - point3[0]) * (point2[1] - point1[1]));
   
   const x = point1[0] + ua * (point2[0] - point1[0]);
   const y = point1[1] + ua * (point2[1] - point1[1]);
   
   return [x, y]
 }

 function intersect2(x1, y1, x2, y2, x3, y3, x4, y4){
    console.log ("x1:"+x1+" y1:"+y1);
    console.log ("x2:"+x2+" y2:"+y2);
    console.log ("x3:"+x3+" y3:"+y3);
    console.log ("x4:"+x4+" y4:"+y4);

    let p1 = [x1,y1];
    let p2 = [x2,y2];
    let p3 = [x3,y3];
    let p4 = [x4,y4];

    let result= intersect_point(p1,p2,p3,p4);
    console.log ("INPUT x:"+p1[0]+" y:"+p1[1]);
    console.log ("RESULT x:"+result[0]+" y:"+result[1]);
    return {x:result[0],z:result[1]};
 }

//https://editor.p5js.org/mmatty/sketches/Zjf4nti25
// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
// line1: x1,y1 to x2,y2   
// line2: x3,y3 to x4,y4   
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    console.log ("x1:"+x1+" y1:"+y1);
    console.log ("x2:"+x2+" y2:"+y2);
    console.log ("x3:"+x3+" y3:"+y3);
    console.log ("x4:"+x4+" y4:"+y4);
    

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false;
    }

    denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel if denominator is 0
    console.log ("denom:"+denominator);

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3));
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) ;
    console.log ("ua:"+ua);
    console.log ("ub:"+ub);


    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    console.log ("INTERSECT X:"+x);
    console.log ("INTERSECT Y:"+y);

    return { x, y };
}

/*

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

  }
}

function degToRad(deg){
  var pi = Math.PI;
  return deg * (pi/180);
}
*/