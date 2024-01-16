
let video;
let poseNet;
let poses = [];

//let videoWidth = 1920;
//let videoHeight =1080;

var videoBuffer;
var perspectiveBuffer;
var isometricBuffer;
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

let videoWidth = 1920;
let videoHeight =1080;
let displayRatio = 0.4;
let angleOfView = 120;


//Apple facetime camera on M1 macbook pro
/*
let videoWidth = 640;
let videoHeight = 480;
let displayRatio = 0.75;
let angleOfView = 54;
*/

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
let isUpdated = true;

var stats;//for stats UI

let headWidth = 157;//mm  https://www.airc.aist.go.jp/dhrt/head/index.html
let faceWidthThreshold = 50;

function setup() {
    console.log("setup()");
    frameRate(30);
    angleMode(DEGREES);
    textAlign(CENTER);

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
    persCam.setPosition(0,-2000,0.1);
    persCam.lookAt(0, 0.1, 0);
    //persCam.setPosition(-1000,-1000,1000);
    //isoCam.lookAt(0, 0, 500);
    //persCam.lookAt(0, 0, 0);
  
    isometricBuffer = createGraphics(videoWidth, videoHeight,WEBGL);
    isometricBuffer.normalMaterial();
  
    isoCam= isometricBuffer.createCamera();
    isoCam.ortho(-videoWidth*2,videoWidth*2,-videoHeight*2,videoHeight*2,0,20000);
    isoCam.setPosition(-6000,-6000,6000);
    //isoCam.lookAt(0, 0, 500);
    isoCam.lookAt(0, 0, 0);
  

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

    var options = {
        architecture: 'MobileNetV1',
        imageScaleFactor: 0.3,
        outputStride: 16,
        flipHorizontal: false,
        minConfidence: 0.75,
        maxPoseDetections: 5,
        scoreThreshold: 0.9,
        nmsRadius: 20,
        detectionType: 'multiple',
        inputResolution: 513,
        multiplier: 0.75,
        quantBytes: 2, 
    }

    //video = createCapture(VIDEO);
    video = createCapture(constraints);

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, options, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function(results) {
        poses = results;
        isUpdated = true;
    });
    // Hide the video element, and just show the canvas
    video.hide();
}

function modelReady() {
    message("Model is ready");
}

function mousePressed(){
  console.log(JSON.stringify(poses))
}


function draw() {
    stats.begin();

    if(!isUpdated){
        poses = [];
        stats.end();
        return;
    }

    if(poses!=undefined){
        if (poses.length > 0) {
            console.log("defections length:"+poses.length);
            processDetections();
            //calcIntersections();
        }
    }

    drawVideoBuffer();
    //drawPerspectiveBuffer();
    //drawIsometricBuffer();

    // Paint the off-screen buffers onto the main canvas
    image(videoBuffer, 0, 0,displayWidth,displayHeight);
    //image(perspectiveBuffer, 0, displayHeight,displayWidth,displayHeight);
    //image(isometricBuffer, displayWidth, 0,displayWidth,displayHeight);

    //faceapi.detect(gotResults);
    stats.end();

    /*
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

    // Create a blue ellipse for the right ear
    fill(0, 215, 255);
    const rightEar = pose.rightEar;
    ellipse(rightEar.x/2, rightEar.y/2, 10, 10);

    // Create a blue ellipse for the left ear
    fill(0, 215, 255);
    const leftEar = pose.leftEar;
    ellipse(leftEar.x/2, leftEar.y/2, 10, 10);
  }
  */

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

    videoBuffer.rectMode(CENTER);
    videoBuffer.noFill();
    videoBuffer.stroke(127,127,127,200);
    videoBuffer.strokeWeight(2);
    videoBuffer.rect(videoWidth/2, videoHeight/2, faceWidthThreshold, faceWidthThreshold);

    drawLandmarks(videoBuffer);
    drawParts(videoBuffer);
    drawBox(videoBuffer);
    drawOrientations(videoBuffer);
}

function drawLandmarks(g) {
    g.ellipseMode(CENTER);
    g.noStroke();
    g.fill(200);

    //console.log("drawLandmarks():faces:"+ faces.length);
    for (let i = 0; i < faces.length; i += 1) {
        var f = faces[i];
        for (let j = 0; j < f.landmarks.length; j += 1) {
            var pos = f.landmarks[j];
            g.ellipse(pos.x,pos.y, 4, 4);
        }
    }
}

function drawParts(g) {
    g.ellipseMode(CENTER);
    g.noStroke();
    g.fill(255);
    //console.log("drawLandmarks():faces:"+ faces.length);
    for (let i = 0; i < faces.length; i += 1) {
        var f = faces[i];
        g.fill(255,0,0);
        g.ellipse(f.noseTip.x,f.noseTip.y, 6, 6);
        g.fill(255);
        g.ellipse(f.leftEar.x,f.leftEar.y, 6, 6);
        g.ellipse(f.rightEar.x,f.rightEar.y, 6, 6);
        g.fill(0,255,255);
        g.ellipse(f.leftEye.x,f.leftEye.y, 6, 6);
        g.ellipse(f.rightEye.x,f.rightEye.y, 6, 6);
    }
}

function drawBox(g) {
    g.rectMode(CENTER);
    for (let i = 0; i < faces.length; i += 1) {
      var f = faces[i];
      g.noFill();
      g.stroke(127,127,127,200);
      g.strokeWeight(2);
      g.rect(f.center.two.x, f.center.two.y, f.width.two, f.height.two);
      g.fill(255,255,255);
      g.noStroke();
      g.textSize(20);
      g.text(round(f.rotation), f.center.two.x, f.center.two.y);
    }
  }

function drawOrientations(g){
    for (let i = 0; i < faces.length; i += 1) {

        var f = faces[i];

        g.noFill();
        g.stroke(255,127,127);
        g.strokeWeight(2);
        g.circle(f.center.two.x,f.center.two.y, 60, 60);
        //console.log("rot:"+f.rotation)

        g.push();
            g.angleMode(DEGREES);
            g.translate(f.center.two.x, f.center.two.y);

            g.rotate(f.rotation);

            g.noFill();
            g.stroke(255,127,127);
            g.strokeWeight(2);

            g.rect(0, 15, 10, 30);
        g.pop();
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
    drawCamera(perspectiveBuffer);
    drawLight(perspectiveBuffer);

    drawFaceBoxes(perspectiveBuffer);
    drawEyeLines(perspectiveBuffer);
    drawIntersections(perspectiveBuffer);

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
}

function processDetections(){
    faces=[];
    console.log("processDetections()"+poses.length);
    for (let i = 0; i < poses.length; i += 1) {
        var face = processDetection(poses[i]);
        if(face!=null){
            faces.push(face);
        }
    }
    console.log("processDetections() faces"+faces.length);
}

function flipY(value){
    return videoWidth - value;
}

function processDetection(pose){
    let f = new faceClass();

    //landmarks
    var keypoints = pose.pose.keypoints;
    jsonString = JSON.stringify(keypoints);
    console.log("processDetection() keypoints:"+keypoints.length);
    for (let j = 0; j < keypoints.length; j += 1) {
        var part = keypoints[j].part;
        var position = keypoints[j].position;
        var tempX =0;
        var tempY = position.y;
        if(isFlipY){
          tempX = flipY(position.x);
        }else{
          tempX = position.x;
        }

        //console.log(part+" pos x:"+position.x+" y:"+position.y);
        f.landmarks.push({name:part,x:tempX,y:tempY});

        if(part == "nose"){
            f.noseTip= {x:tempX,y:tempY};
        }else if(part == "leftEar"){
            f.leftEar = {x:tempX,y:tempY};
        }else if(part == "rightEar"){
            f.rightEar = {x:tempX,y:tempY};
        }else if(part == "leftEye"){
            f.leftEye = {x:tempX,y:tempY};
        }else if(part == "rightEye"){
            f.rightEye = {x:tempX,y:tempY};
        }
    }

    console.log("processDetection() lamdmarks:"+f.landmarks.length);

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
    f.height.two = f.width.two;
  
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

    if(f.width.two>faceWidthThreshold){
        return f;
    }
  
    return null;
  }










