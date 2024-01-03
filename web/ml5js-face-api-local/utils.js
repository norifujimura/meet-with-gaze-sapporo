var faceClass = class{
    constructor(){
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