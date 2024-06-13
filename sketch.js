let capture;
let poseNet;
let singlePose;
let skeleton;
let specs;
let previousPose;
const SMOOTHING_FACTOR = 0.5;
const CONFIDENCE_THRESHOLD = 0.5;

function setup() {
  // Create a canvas
  createCanvas(800, 500);
  
  // Capture video from webcam
  capture = createCapture(VIDEO);
  capture.size(640, 480); // Set the size of the capture
  capture.hide(); // Hide the video element to only show the canvas
  
  // Initialize PoseNet
  poseNet = ml5.poseNet(capture, modelLoaded);
  poseNet.on('pose', receivedPose);

  // Load the image of the glasses
  specs = loadImage('images/thuglife.png');
}

function receivedPose(poses) {
  // Log poses for debugging
  console.log(poses);
  
  // If poses are detected, update singlePose and skeleton
  if (poses.length > 0) {
    singlePose = smoothPose(poses[0].pose, previousPose);
    previousPose = singlePose;
    skeleton = poses[0].skeleton;
  }
}

function smoothPose(currentPose, previousPose) {
  if (!previousPose) {
    return currentPose;
  }
  let smoothedPose = {...currentPose};
  for (let i = 0; i < currentPose.keypoints.length; i++) {
    smoothedPose.keypoints[i].position.x = SMOOTHING_FACTOR * currentPose.keypoints[i].position.x + (1 - SMOOTHING_FACTOR) * previousPose.keypoints[i].position.x;
    smoothedPose.keypoints[i].position.y = SMOOTHING_FACTOR * currentPose.keypoints[i].position.y + (1 - SMOOTHING_FACTOR) * previousPose.keypoints[i].position.y;
  }
  return smoothedPose;
}

function modelLoaded() {
  // Log when the model is successfully loaded
  console.log("Model loaded");
}

function draw() {
  // Draw the video on the canvas
  image(capture, 0, 0, width, height);

  // Scale factors for drawing keypoints and skeleton
  let scaleX = width / capture.width;
  let scaleY = height / capture.height;

  // Check if a pose is detected
  if (singlePose) {
    // Draw keypoints
    fill(255, 0, 0);
    stroke(255); // Set stroke color for keypoints
    strokeWeight(2); // Set stroke weight for keypoints
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      if (singlePose.keypoints[i].score > CONFIDENCE_THRESHOLD) {
        let x = singlePose.keypoints[i].position.x * scaleX;
        let y = singlePose.keypoints[i].position.y * scaleY;
        ellipse(x, y, 10); // Reduced radius to 10
      }
    }

    // Draw skeleton
    stroke(255, 255, 255); // Set stroke color for skeleton
    strokeWeight(5); // Set stroke weight for skeleton
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      if (partA.score > CONFIDENCE_THRESHOLD && partB.score > CONFIDENCE_THRESHOLD) {
        let x1 = partA.position.x * scaleX;
        let y1 = partA.position.y * scaleY;
        let x2 = partB.position.x * scaleX;
        let y2 = partB.position.y * scaleY;
        line(x1, y1, x2, y2);
      }
    }

    // Draw glasses on the eyes
    let leftEye = singlePose.leftEye;
    let rightEye = singlePose.rightEye;
    if (leftEye && rightEye) {
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
}
