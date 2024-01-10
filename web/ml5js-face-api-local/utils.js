var faceClass = class{
  constructor(){
    this.ratio = 0;
    
    this.landmarks=[];
    this.rightEar={x:0,y:0};
    this.leftEar={x:0,y:0};
    this.noseTip={x:0,y:0};

    this.center = {
        two:{x:0,y:0},
        three:{x:0,y:0,z:0}
    };

    /*
    this.corner = {
        two:{x:0,y:0},
        three:{x:0,y:0,z:0}
    };
    */

    this.box = {
      two:{x:0,y:0,w:0,h:0},
      three:{x:0,y:0,z:0}
    };
    
    this.width = {
        original:0,
        two:0,
        three:0
    };
    this.rotation = 0;
  }
  /*
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
  */

}

function message(m){
  document.getElementById("message").value = m;
}

function doubleClicked(){
  console.log("doubleClk");
  zoom = 1.0;
  mouseDragged();
}

function mouseClicked() {

  if(state == 'video'){
    state = 'perspective';
  }
  if(state == 'perspective'){
    state = 'iso';
  }
  if(state == 'iso'){
    state = 'light';
  }
  if(state == 'light'){
    state = 'video';
  }

  /*
  if(isoMode == "diagonal"){
    isoCam.ortho(-videoWidth,videoWidth,-videoHeight,videoHeight,0,10000);
    isoCam.setPosition(-1000,-1000,1000);
    //isoCam.lookAt(0, 0, 500);
    isoCam.lookAt(0, 0, 0);
  }else if(isoMode == "top"){
    isoCam.ortho(-videoWidth*2,videoWidth*2,-videoHeight*2,videoHeight*2,0,10000);
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
  */
}

function mouseDragged() {
  //pmouseY
  //mouseY
  var val = (mouseY - pmouseY) * 0.001;
  zoom += val;

  isoCam.ortho(-videoWidth*zoom,videoWidth*zoom,-videoHeight*zoom,videoHeight*zoom,0,10000);
  isoCam.setPosition(-1000*zoom,-1000*zoom,1000*zoom);
  //isoCam.lookAt(0, 0, 500);
  isoCam.lookAt(0, 0, 0);

  persCam.setPosition(0,0,-screenDistance*zoom);

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

    g.translate(0,0,screenDistance);
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
        g.translate(0,0,screenDistance);
        g.box(videoWidth,videoHeight,0);
      g.pop();

      g.line(0,0,0,-videoWidth/2,-videoHeight/2,screenDistance);
      g.line(0,0,0,videoWidth/2,-videoHeight/2,screenDistance);
      g.line(0,0,0,-videoWidth/2,videoHeight/2,screenDistance);
      g.line(0,0,0,videoWidth/2,videoHeight/2,screenDistance);
  pop();
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