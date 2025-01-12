const canvas = document.getElementById("springCanvas");
const ctx = canvas.getContext("2d");

const canvasEnergy = document.getElementById("energyCanvas");
const ctxEn = canvasEnergy.getContext("2d");

const canvasPlot = document.getElementById("plotCanvas");
const ctxPlot = canvasPlot.getContext("2d");

const showVelocity = document.getElementById("showVelocity");
const showAcceleration = document.getElementById("showAcceleration");
const showCoordinate = document.getElementById("showCoordinate");

let pressed = 0;
const g = 981;
let dt = 1 / 200;
const numCoils = 20;
const k = 20; // Spring constant
const m = 2; // Mass
let resistanceCoeff = 0;

let xRef = 5 //canvas.width / 2;
let yRef = canvas.height / 2;

let xBall = xRef + 340; // Initial ball position
let yBall = yRef;

let vX = 0; // Initial velocity
let xEquilibrium = xBall;
let dragging = false;
let A = 0;
let E = 0;

let acc_array=[];
let velocityArray = [];
let positionArray = [];

function drawGrid() {
  const gridSpacing = 59; // Spacing between grid lines in pixels
  const cmPerPixel =1; // Number of centimeters per pixel (adjust if needed)
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // ctx.beginPath();
  // ctx.strokeStyle = "#e0e0e0"; // Light gray for grid lines

  // // Vertical lines
  // for (let x = 0; x <= canvasWidth; x += gridSpacing) {
  //   ctx.moveTo(x, 0);
  //   ctx.lineTo(x, canvasHeight);
  // }

  // // Horizontal lines
  // for (let y = 0; y <= canvasHeight; y += gridSpacing) {
  //   ctx.moveTo(0, y);
  //   ctx.lineTo(canvasWidth, y);
  // }
  // ctx.stroke();

  // Draw labels
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  // Label the vertical lines
  for (let x = 0; x <= canvasWidth; x += gridSpacing) {
    const displacement = (x/ gridSpacing) * cmPerPixel; // Convert to cm
    ctx.fillText(displacement.toFixed(1), x, yRef + 20);
  }

  const xDisplacementCm = ((xBall/gridSpacing)).toFixed(2); // Convert to cm with 2 decimal precision
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`x: ${xDisplacementCm} cm`, canvas.width - 80, 30);
}


function acceleration(vX, t) {
  return -(k * (xBall - xEquilibrium)) / m - resistanceCoeff * Math.sign(vX)*100;;
}
function velocity(xBall, t) {
  return vX; // Velocity is the time derivative of position
}
function drawSpring(xStart, yStart, length, numCoils) {
  const coilLength = length / numCoils;
  const coilHeight = 10;

  let x = xStart;
  let direction = 1;

  ctx.beginPath();
  ctx.moveTo(xStart, yStart);
  for (let i = 0; i < numCoils; i++) {
    const nextX = x + coilLength / 2;
    const nextY = yStart - coilHeight * direction;
    ctx.lineTo(nextX, nextY);
    direction *= -1;
    x += coilLength;
  }
  ctx.lineTo(xStart + length, yStart);
  ctx.stroke();
}

function drawBall(x, y) {
  ctx.beginPath();
  ctx.arc(x+10, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawForce(x, y, len) {
  if (len != 0 && vX!=0){
  ctx.beginPath();
  
  ctx.rect(x + 10, y - 1, len, 3);
  ctx.moveTo(x +10 + len , y - 5); 
  ctx.lineTo(x + 10  + len + 10*Math.sign(len),y); 
  ctx.lineTo(x + 10 +len, y + 5); 
  ctx.closePath(); // Close the arrowhead shape

  // Fill the rectangle and arrowhead
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.font = "16px Arial"; // Font for the label
  ctx.fillStyle = "black";
  const labelX = x + len; // Midpoint of the vector for the label
  const labelY = y - 10;

  // Draw the 'v'
  ctx.fillText("Fe", labelX - 5, labelY - 10);

  // Draw a small arrow above the 'v'
  ctx.beginPath();

  ctx.rect(labelX-15, labelY-25, 20, 1);
  ctx.moveTo(labelX+5 , labelY - 27); 
  ctx.lineTo(labelX+10 , labelY-25); 
  ctx.lineTo(labelX+5, labelY -23); 
  ctx.closePath(); // Close the arrowhead shape

  // Fill the rectangle and arrowhead
  ctx.fillStyle = "black";
  ctx.fill();
  }
}

function drawResitanceForce(x, len) {
  if(len != 0){
    len = -len;
    let y = yBall+5;
    ctx.beginPath();
    
    ctx.rect(x + 10, y, len, 3);
    ctx.moveTo(x +10 + len , y - 5); 
    ctx.lineTo(x + 10  + len + 10*Math.sign(len),y); 
    ctx.lineTo(x + 10 +len, y + 5); 
    ctx.closePath(); // Close the arrowhead shape
  
    // Fill the rectangle and arrowhead
    ctx.fillStyle = "red";
    ctx.fill();
  
    ctx.font = "16px Arial"; // Font for the label
    ctx.fillStyle = "red";
    const labelX = x + len; // Midpoint of the vector for the label
    const labelY = y - 10;
  
    // Draw the 'v'
    ctx.fillText("Ff", labelX - 5, labelY + 40);
  
    // Draw a small arrow above the 'v'
    ctx.beginPath();
  
    ctx.rect(labelX-15, labelY-25+45, 20, 1);
    ctx.moveTo(labelX+5 , labelY - 27 + 45); 
    ctx.lineTo(labelX+10 , labelY-25 +45); 
    ctx.lineTo(labelX+5, labelY -23 +45); 
    ctx.closePath(); // Close the arrowhead shape
  
    // Fill the rectangle and arrowhead
    ctx.fillStyle = "red";
    ctx.fill();

  }
 
  
}

function drawReferencePoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
}
function drawEnergyChart(E, i, color) {
  
  let y = canvasEnergy.height;
  let x = 40 + i*canvasEnergy.width/3
  ctxEn.beginPath();
  ctxEn.rect(x, y, 40, -E/1500);
  ctxEn.fillStyle = color;
  ctxEn.fill();
}
function drawPlots(dataSets, labels, colors, scaleY = 100) {
  // Clear the canvas
  ctxPlot.clearRect(0, 0, canvasPlot.width, canvasPlot.height);
  ctxPlot.beginPath();
  ctxPlot.moveTo(0,canvasPlot.height/2);
  ctxPlot.lineTo(canvasPlot.width,canvasPlot.height/2);
  ctxPlot.strokeStyle = "black";
  ctxPlot.stroke();
  // Draw axes


  // Calculate scaling factors
  const scaleX = (4 / 5) * canvasPlot.width / acc_array.length;

  // Plot each data set
  dataSets.forEach((data, i) => {
    if (labels[i].checked) { // Check if the dataset should be plotted
      ctxPlot.beginPath();
      ctxPlot.strokeStyle = colors[i];
      data.forEach((value, index) => {
        const x = index * scaleX; // Dynamically calculate x position
        const y = canvasPlot.height / 2 - value * scaleY; // Scale value
        if (index === 0) {
          ctxPlot.moveTo(x, y);
        } else {
          ctxPlot.lineTo(x, y);
        }
      });
      ctxPlot.stroke();
    }
  });
  if (pressed) {
    //E = 0;
    acc_array =[];
    velocityArray = [];
    positionArray = [];
    pressed = 0;

  }
}
let x_ball_prev_prev = xBall;
function update() {
  if (slowMotion.checked) {
    dt = 1 / 550;
    pressed = 1; // Slow motion
  } else {
    dt = 1 / 200; // Default time step
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxEn.clearRect(0, 0, canvasEnergy.width, canvasEnergy.height);

  drawGrid();
  // Draw axis
  ctx.beginPath();
  ctx.moveTo(0, yRef + 10);
  ctx.lineTo(canvas.width, yRef + 10);
  ctx.strokeStyle = "black";
  ctx.stroke();

  drawReferencePoint(xRef, yRef);
  drawSpring(xRef, yRef, xBall - xRef, numCoils);
  drawBall(xBall, yBall);
  
  
  let K = (m*vX**2)/2;
  let U = k*(xBall - xEquilibrium)**2/2;
  
  if (dragging){
    E = K+U;
    x_ball_prev_prev=xBall;
  }
  if (!dragging) {
    let acc = acceleration(vX, dt);
    vX += acc * dt;
    xBall += vX * dt;
    // let x_ball_prev = xBall;
    // diferenta = x_ball_prev - x_ball_prev_prev;
    // acc = acceleration(vX,0);
    // xBall += diferenta + acc * dt * dt;
    // vX = (xBall-x_ball_prev_prev)/(2*dt);
    // x_ball_prev_prev = x_ball_prev
   
    acc_array.push(acc/(A*Math.sqrt(k/m)**2));
    velocityArray.push(vX/A/Math.sqrt(k/m));
    positionArray.push((xBall-xEquilibrium)/A);
    
    // Keep arrays within the canvas width
    if (resistanceCoeff == 0){
      E = k*A**2/2;
    }
    else {
      E = K + U;
    }
   
    // if (Math.abs(vX) < 1) {
    //   E = k*(xBall-xEquilibrium)**2/2;
    // }
    const dataSets = [velocityArray, positionArray,acc_array];
    const labels = [showVelocity, showCoordinate, showAcceleration]; // Checkboxes for toggling
    const colors = ["green", "red", "blue"]; // Corresponding plot colors
    
    // Call the function
    drawPlots(dataSets, labels, colors);

  }
  

  if (Math.abs(vX)<1 && Math.abs(xBall-xEquilibrium)< 4){
    //pressed = 1;
    vX= 0;
    xBall=xEquilibrium;
  }
  console.log(vX);

  len = 1/3 * (xEquilibrium-xBall);
  len_Ff = 50*resistanceCoeff*Math.sign(vX);
  if (pressed == 0){
    drawForce(xBall,yBall,len);
    drawResitanceForce(xBall,len_Ff);
  }
   
  drawEnergyChart(K, 0, "green");
  drawEnergyChart(U, 1, "blue");
  drawEnergyChart(E, 2, "red");
  
  
  requestAnimationFrame(update);
}

// Event Listeners for Dragging the Ball
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  pressed = 1;
  if (mouseX) {
    dragging = true;
  }
});

canvas.addEventListener("mousemove", (e) => {
  
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    xBall = e.clientX - rect.left;
    
    // Restrict dragging within limits
    if (xBall > xEquilibrium + xEquilibrium - xRef) {
      xBall = xEquilibrium + xEquilibrium - xRef;
    }
    if (xBall < xRef) {
      xBall = xRef;
    }
    vX = 0; // Reset velocity while dragging
  }
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
  A = xBall-xEquilibrium;
});



const resistanceSlider = document.getElementById('resistanceSlider');
const resistanceValue = document.getElementById('resistanceValue');

// Update resistance value when slider is moved
resistanceSlider.addEventListener('input', (e) => {
    resistanceCoeff = parseFloat(e.target.value);
    resistanceValue.textContent = resistanceCoeff;
});

// Reset everything when restart button is clicked
document.getElementById("restartButton").addEventListener("click", () => {
  // Reset variables
  xBall = xEquilibrium; // Reset ball to equilibrium position
  vX = 0;               // Reset velocity to 0
  pressed = 1;
  A = 0;

  // Reset resistance slider and displayed value
  resistanceSlider.value = 0;         // Reset slider value to 0
  resistanceCoeff = 0;                // Reset resistance coefficient variable
  resistanceValue.textContent = 0;    // Update displayed value to 0

  // Clear the canvas (add your canvas-clearing code here, if applicable)
});



// Start the simulation
update();
