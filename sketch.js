let capture;
let pn;
let singlepose;
let skeleton;
let specs;
function setup() {
  createCanvas(800, 500);
  capture = createCapture(VIDEO);
  capture.size(640, 480); // Set the size of the capture
  capture.hide();
  pn = ml5.poseNet(capture, modelLoaded);
  pn.on('pose', receivedPosed);
  specs=loadImage('images/thuglife.png');
}

function receivedPosed(poses) {
  console.log(poses);
  if (poses.length > 0) {
    singlepose = poses[0].pose;
    skeleton=poses[0].skeleton
  }
}

function modelLoaded() {
  console.log("model loaded");
}

function draw() {
  image(capture, 0, 0, 800, 500); // Draw the video on the canvas
  fill(255, 0, 0);
  if (singlepose) {
    let scaleX = width / capture.width;
    let scaleY = height / capture.height;
    for (let i = 0; i < singlepose.keypoints.length; i++) {
      let x = singlepose.keypoints[i].position.x * scaleX;
      let y = singlepose.keypoints[i].position.y * scaleY;
      ellipse(x, y, 20);
    }
    stroke(255,255,255);
    strokeWeight(5);
    for(let j=0;j<skeleton.length;j++){
        
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        let x1 = partA.position.x * scaleX;
        let y1 = partA.position.y * scaleY;
        let x2 = partB.position.x * scaleX;
        let y2 = partB.position.y * scaleY;
        line(x1, y1, x2, y2);
    }
    let leftEye = singlepose.leftEye;
    let rightEye = singlepose.rightEye;

    let eyeDist = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y) * scaleX;

    let specsWidth = eyeDist * 2; // Adjust the multiplier as needed for appropriate size
    let specsHeight = specs.height / specs.width * specsWidth; // Maintain aspect ratio

    // Calculate the midpoint between the eyes
    let midX = ((leftEye.x + rightEye.x) / 2) * scaleX;
    let midY = ((leftEye.y + rightEye.y) / 2) * scaleY;

    // Draw specs on the eyes
    let specsX = midX - specsWidth / 2; // Centering the specs horizontally on the midpoint
    let specsY = midY - specsHeight / 2; // Centering the specs vertically on the midpoint
    image(specs, specsX, specsY, specsWidth, specsHeight);

  }
}
