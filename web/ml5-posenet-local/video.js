function drawLandmarks(g) {
    g.ellipseMode(CENTER);
    g.noStroke();
    g.fill(200);

    //console.log("drawLandmarks():faces:"+ faces.length);
    for (let i = 0; i < faces.length; i += 1) {
        var f = faces[i];
        if(f.isValid){
            for (let j = 0; j < f.landmarks.length; j += 1) {
                var pos = f.landmarks[j];
                g.ellipse(pos.x,pos.y, 4, 4);
            }
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
        if(f.isValid){
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
}

function drawBox(g) {
    g.rectMode(CENTER);
    for (let i = 0; i < faces.length; i += 1) {
      var f = faces[i];
      if(f.isValid){
        g.noFill();
        g.stroke(127,127,127,200);
        g.strokeWeight(2);
        g.rect(f.center.two.x, f.center.two.y, f.width.two, f.height.two);
        g.fill(255,255,255);
        g.noStroke();
        g.textSize(20);
        g.text(round(f.rotation.raw), f.center.two.x, f.center.two.y);
      }
    }
  }

function drawOrientations(g){
    for (let i = 0; i < faces.length; i += 1) {

        var f = faces[i];
        if(f.isValid){
            g.noFill();
            g.stroke(255,127,127);
            g.strokeWeight(2);
            g.circle(f.center.two.x,f.center.two.y, 60, 60);
            //console.log("rot:"+f.rotation)

            g.push();
                g.angleMode(DEGREES);
                g.translate(f.center.two.x, f.center.two.y);

                g.rotate(f.rotation.raw);

                g.noFill();
                g.stroke(255,127,127);
                g.strokeWeight(2);

                g.rect(0, 15, 10, 30);
            g.pop();
        }
    }
}