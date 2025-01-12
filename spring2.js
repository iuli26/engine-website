const canvas = document.getElementById("springCanvas");
const ctx = canvas.getContext("2d");

const canvasEnergy = document.getElementById("energyCanvas");
const ctxEn = canvasEnergy.getContext("2d");

const canvasAcc = document.getElementById("plotCanvas");
const ctxAcc = canvasAcc.getContext("2d");

const showVelocity = document.getElementById("showVelocity");
const showAcceleration = document.getElementById("showAcceleration");
const showCoordinate = document.getElementById("showCoordinate");


const g = 981;
const dt = 1 / 200;
const numCoils = 20;
const k = 20; // Spring constant
const m = 2; // Mass
let resistanceCoeff = 0;

let xRef = 5 //canvas.width / 2;
let yRef = canvas.height / 2;

let xBall = xRef + 300; // Initial ball position
let yBall = yRef;

let vX = 0; // Initial velocity
let xEquilibrium = xBall;
let dragging = false;
let A = 0;
let E = 0;

const acc_array=[];
const velocityArray = [];
const positionArray = [];

function acceleration(vX, t) {
  return -(k * (xBall - xEquilibrium)) / m - resistanceCoeff * vX;
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
  ctx.rect(x, y-10, 20, 20);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawForce(x, y, len) {
  ctx.beginPath();
  
  ctx.rect(x + 10, y - 1, len, 3);
  ctx.moveTo(x +10 + len , y - 5); 
  ctx.lineTo(x + 10  + len + 10*Math.sign(len),y); 
  ctx.lineTo(x + 10 +len, y + 5); 
  ctx.closePath(); // Close the arrowhead shape

  // Fill the rectangle and arrowhead
  ctx.fillStyle = "black";
  ctx.fill();
}

function drawReferencePoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
}
function drawEnergyChart(E, x, color) {
  
  let y = canvasEnergy.height;

  ctxEn.beginPath();
  ctxEn.rect(x, y, 40, -E/1000);
  ctxEn.fillStyle = color;
  ctxEn.fill();
}
function drawAccelerationChart() {
  // Clear the canvas
  ctxAcc.clearRect(0, 0, canvasAcc.width, canvasAcc.height);

  // Draw axes
  ctxAcc.beginPath();
  ctxAcc.moveTo(0, canvasAcc.height / 2); // Horizontal axis
  ctxAcc.lineTo(canvasAcc.width, canvasAcc.height / 2); // Middle line
  ctxAcc.strokeStyle = "black";
  ctxAcc.stroke();

  ctxAcc.beginPath();
  ctxAcc.moveTo(0, 0); // Vertical axis
  ctxAcc.lineTo(0, canvasAcc.height);
  ctxAcc.stroke();

  // Plot acceleration values
  ctxAcc.beginPath();
  ctxAcc.strokeStyle = "blue";

  const totalDataPoints = acc_array.length;
  const maxX = canvasAcc.width; // Maximum width of the canvas
  const xStep = maxX / totalDataPoints; // Compress x-axis to fit all data

  acc_array.forEach((acc, index) => {
    const x = index * xStep*4/5; // Dynamically calculate the x position
    const y = canvasAcc.height / 2 - acc / 40; // Scale acceleration for canvas height
    if (index === 0) {
      ctxAcc.moveTo(x, y);
    } else {
      
        ctxAcc.lineTo(x, y);
    }
  });

  ctxAcc.stroke();
}


function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxEn.clearRect(0, 0, canvasEnergy.width, canvasEnergy.height);

  // Draw axis
  ctx.beginPath();
  ctx.moveTo(0, yRef + 10);
  ctx.lineTo(canvas.width, yRef + 10);
  ctx.strokeStyle = "black";
  ctx.stroke();

  drawReferencePoint(xRef, yRef);
  drawSpring(xRef, yRef, xBall - xRef, numCoils);
  drawBall(xBall, yBall);

  let K = (m * vX ** 2) / 2;
  let U = (k * (xBall - xEquilibrium) ** 2) / 2;

  if (!dragging) {
    const acc = acceleration(vX, dt);
    vX += acc * dt;
    xBall += vX * dt;

    acc_array.push(acc);
    if (acc_array.length > canvasAcc.width) {
      acc_array.shift(); // Keep array size manageable
    }

    // Restrict ball's movement
    if (xBall > xEquilibrium + xEquilibrium - xRef) {
      xBall = xEquilibrium + xEquilibrium - xRef;
      vX = 0;
    }
    if (xBall < xRef) {
      xBall = xRef;
      vX = 0;
    }
  }

  let E = K + U;

  document.getElementById("energy").innerHTML = E.toFixed(2);

  let len = (xEquilibrium - xBall) / 2;
  drawForce(xBall, yBall, len);
  drawEnergyChart(K, 40, "green");
  drawEnergyChart(U, 90, "blue");
  drawEnergyChart(E, 140, "red");

  // Draw acceleration chart
  drawAccelerationChart();

  requestAnimationFrame(update);
}

// Event Listeners for Dragging the Ball
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;

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

document.getElementById("restartButton").addEventListener("click", () => {
  xBall = xEquilibrium;
  vX = 0;
  resistanceCoeff = 0;
  resistanceValue = 0;
  A = 0;
 
});
const resistanceSlider = document.getElementById('resistanceSlider');
const resistanceValue = document.getElementById('resistanceValue');
resistanceSlider.addEventListener('input', (e) => {
    resistanceCoeff = parseFloat(e.target.value);
    resistanceValue.textContent = resistanceCoeff;
});

// Start the simulation
update();
