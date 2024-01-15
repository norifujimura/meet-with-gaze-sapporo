function intersect2(x1, y1, x2, y2, x3, y3, x4, y4){
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