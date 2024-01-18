var faceClass = class{
  constructor(){
    this.name = "face";
    this.isValid = true;
    this.ratio = 0;

    this.intersect={x:0,y:0,z:0};
    this.hasInterset= false;

    this.landmarks=[];
    this.rightEar={x:0,y:0};
    this.leftEar={x:0,y:0};
    this.rightEye={x:0,y:0};
    this.leftEye={x:0,y:0};
    this.noseTip={x:0,y:0};
    this.eyeLine ={x:0,y:0};

    this.center = {
        two:{x:0,y:0},
        three:{x:0,y:0,z:0}
    };

    this.box = {
      two:{x:0,y:0,w:0,h:0}
    };
    
    this.width = {
        original:0,
        two:0,
        three:0
    };
    this.height = {
      two:0,
      three:0
    };
    this.rotation ={
      raw:0,
      adjusted:0
    }

    this.eyeLine = [];

    this.averageLimit = 10;
    this.rot = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.rots = [];
    this.xs= [];
    this.ys = [];
    this.zs = [];
  }

  setValues(rt,xt,yt,zt){
    this.rots.push(rt);
    if(this.rots.length>this.averageLimit){
      this.rots.shift();
    }
    this.rot = this.average(this.rots);

    this.xs.push(xt);
    if(this.xs.length>this.averageLimit){
      this.xs.shift();
    }
    this.x = this.average(this.xs);

    this.ys.push(yt);
    if(this.ys.length>this.averageLimit){
      this.ys.shift();
    }
    this.y = this.average(this.ys);

    this.zs.push(zt);
    if(this.zs.length>this.averageLimit){
      this.zs.shift();
    }
    this.z = this.average(this.zs);
    console.log("setValues:"+this.zs.length)
  }

  average(array) {
    var result = 0, index = 0;
    for (index in array) {
      result = result + array[index];
    }
    return result / array.length;
  };

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
  document.getElementById("message").textContent = m;
}

/*
function doubleClicked(){
  console.log("doubleClk");
  zoom = 1.0;
  //mouseDragged();
}
*/



/*
function mouseDragged() {
  //pmouseY
  //mouseY
  var delta = mouseY - pmouseY;
  var val = delta * 0.005;
  zoom += val;

  isoCam.ortho(-videoWidth*zoom,videoWidth*zoom,-videoHeight*zoom,videoHeight*zoom,0,20000);
  isoCam.setPosition(-1000*zoom,-1000*zoom,1000*zoom);
  //isoCam.lookAt(0, 0, 500);
  isoCam.lookAt(0, 0, 0);

}
*/

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
    g.strokeWeight(6);
    g.noFill();
    g.stroke(255,32,32);

    g.translate(0,0,screenDistance);
    g.box(videoWidth,videoHeight,0);
    //g.plane(videoWidth,videoHeight)
  g.pop();

  g.push();
    g.strokeWeight(2);
    g.noFill();
    g.stroke(255,32,32);

    g.translate(0,0,fiveMetersDistance);
    g.box(5000,fiveMetersHeight,0);
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

function drawLight(g){
  g.push();
    g.strokeWeight(2);
    g.noFill();
    g.stroke(127,127,127);
    g.line(-2500,0,lightDistance,2500,0,lightDistance);
  g.pop();

  g.push();
    g.strokeWeight(4);
    g.noFill();
    g.stroke(32,32,32);
    g.line(-lightLength/2,0,lightDistance,lightLength/2,0,lightDistance);
  g.pop();
  
  for(let i=0;i<6;i++){
    g.push();
      g.strokeWeight(2);
      g.noFill();
      g.stroke(32,32,32);
      g.translate(-2500+i*1000,0,lightDistance);
      g.box(10);
    g.pop();  
  }
}

function drawTheta(g){
  g.angleMode(DEGREES);
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
    g.push();
      g.strokeWeight(10);
      g.noFill();
      g.stroke(255,127,127,127);
      g.rotateY(-f.thetaOne);
      g.line(0,0,0,1000,0,0);
    g.pop();
    g.push();
      g.strokeWeight(10);
      g.noFill();
      g.stroke(127,255,127,127);
      g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
      g.rotateY(90);
      g.line(0,0,0,1000,0,0);
    g.pop();
    g.push();
      g.strokeWeight(20);
      g.noFill();
      g.stroke(127,127,255,127);
      g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
      g.rotateY(90+f.thetaTwo);
      g.line(0,0,0,1000,0,0);
    g.pop();
  }
}


function drawFaceBoxes(g) {
  g.angleMode(DEGREES);
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
      if(f.isValid){
        g.push();
          g.noFill();
          g.strokeWeight(10);
          g.stroke(200,127,127,127);
          g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
          g.rotateY(f.rotation.raw);
          g.box(headWidth,f.height.three,headWidth);
        g.pop();
        g.push();
          g.noFill();
          g.strokeWeight(10);
          g.stroke(127,200,127,127);
          g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
          g.rotateY(f.rotation.adjusted);
          g.box(headWidth,f.height.three,headWidth);
        g.pop();
        
        g.push();
          g.noFill();
          g.strokeWeight(20);
          g.stroke(127,127,200,127);
          g.translate(f.x,f.y,f.z);
          g.rotateY(f.rot);
          g.box(headWidth,f.height.three,headWidth);
        g.pop();
      }
  }
}

function drawEyeLines(g){
  //let length = 10000;
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
      if(f.isValid){
        g.push();
          g.noFill();
          g.stroke(200,127,127,127);
          g.strokeWeight(4);

          g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
          g.rotateY(f.rotation.raw+180);
          g.line(0,0,0,0,0,eyeLineLength);
          //g.line(f.center.three.x,f.center.three.y,f.center.three.z,f.eyeLine.x,0,f.eyeLine.z);
        g.pop();

        g.push();
          g.noFill();
          g.stroke(127,200,127,127);
          g.strokeWeight(4);

          g.translate(f.center.three.x,f.center.three.y,f.center.three.z);
          g.rotateY(f.rotation.adjusted+180);
          g.line(0,0,0,0,0,eyeLineLength);
          //g.line(f.center.three.x,f.center.three.y,f.center.three.z,f.eyeLine.x,0,f.eyeLine.z);
        g.pop();

        g.push();
          g.noFill();
          g.stroke(127,127,200,127);
          g.strokeWeight(10);

          g.translate(f.x,f.y,f.z);
          g.rotateY(f.rot+180);
          g.line(0,0,0,0,0,eyeLineLength);
          //g.line(f.center.three.x,f.center.three.y,f.center.three.z,f.eyeLine.x,0,f.eyeLine.z);
        g.pop();
      }
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

function drawIntersections(g){
  for (let i = 0; i < faces.length; i += 1) {
      let f=faces[i];
      if(f.isValid){
        if(f.intersect == false){
            continue;
        }
        console.log("Intersect x:"+f.intersect.x+" z:"+f.intersect.z);
        push();
            g.stroke(0,0,0);
            g.fill(200,200,200);
            drawPoint(g,{x:f.intersect.x,y:0,z:f.intersect.z},40);
        pop(); 
      }
  }
}


/*
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
*/

//Calc intersection
function calcIntersections(){
  for (let i = 0; i < faces.length; i += 1) {
    let f=faces[i];
    if(f.isValid){  
        //let rot = f.rotation.raw+180;
        let rot = f.rot+180;
        f.eyeLine.deltax = sin(rot) * eyeLineLength;
        f.eyeLine.deltaz = cos(rot) * eyeLineLength;
      
        /*
        f.eyeLine.x = f.center.three.x + f.eyeLine.deltax;
        f.eyeLine.y = 0;
        f.eyeLine.z = f.center.three.z + f.eyeLine.deltaz;
        */

        f.eyeLine.x = f.x + f.eyeLine.deltax;
        f.eyeLine.y = 0;
        f.eyeLine.z = f.z + f.eyeLine.deltaz;

        //calcIntersect(x1, y1, x2, y2, x3, y3, x4, y4)
        //f.intersect = calcIntersect(-lightLength/2,lightDistance,lightLength/2,lightDistance,f.center.three.x,f.center.three.z,f.eyeLine.x,f.eyeLine.z);
        f.intersect = calcIntersect(-lightLength/2,lightDistance,lightLength/2,lightDistance,f.x,f.z,f.eyeLine.x,f.eyeLine.z);
        if(f.intersect == 0){
          f.hasIntersect = false;
        }else{
          f.hasIntersect = true;
        }
    }
  }
}

function calcIntersect(x1, y1, x2, y2, x3, y3, x4, y4){
  /*
  console.log ("x1:"+x1+" y1:"+y1);
  console.log ("x2:"+x2+" y2:"+y2);
  console.log ("x3:"+x3+" y3:"+y3);
  console.log ("x4:"+x4+" y4:"+y4);
  */

  let p1 = [x1,y1];
  let p2 = [x2,y2];
  let p3 = [x3,y3];
  let p4 = [x4,y4];

  let result= intersect_point(p1,p2,p3,p4);
  //console.log ("INPUT x:"+p1[0]+" y:"+p1[1]);
  //console.log ("RESULT x:"+result[0]+" y:"+result[1]);
  return {x:result[0],z:result[1]};
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