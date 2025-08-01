const canvas = document.getElementById("pendulumCanvas");
const ctx = canvas.getContext("2d");

const canvasEnergy = document.getElementById("energyCanvas");
const ctxEn = canvasEnergy.getContext("2d");


const canvasPlot = document.getElementById("plotCanvas");
const ctxPlot = canvasPlot.getContext("2d");

const showVelocity = document.getElementById("showVelocity");
const showAcceleration = document.getElementById("showAcceleration");
const showCoordinate = document.getElementById("showCoordinate");

// Canvas dimensions
const width = canvas.width;
const height = canvas.height;

let frecv = 0;
let pressed = 0;
// Constants
const g = 981; // Gravitational acceleration (cm/s²)
let dt = 1 / 60; // Time step (s)

// Pivot point
const xRef = width / 2;
const yRef = 100;

// Pendulum initial state
let xBall = xRef;
let yBall = yRef + 200;
let l = Math.sqrt((xBall - xRef) ** 2 + (yBall - yRef) ** 2); // Length of the pendulum
let theta = 0; // Initial angle
let omega = 0; // Angular velocity
const m = 1;

// Mouse interaction variables
let isDragging = false;

let A = 0;
// Trajectory points
const trajectoryPoints = [];

let resistanceCoeff = 0;

let acc_array=[];
let velocityArray = [];
let thetaArray = [];

function drawVector(x, y, omega, color, label, marime , velocityScale) {
  if (label.checked && omega!=0) {
   // Scale factor to adjust the vector length visually
    const length = -omega * velocityScale; // Calculate the vector length based on omega

    // Calculate the tangent vector components
    const dx = -Math.cos(theta) * length; // Tangent x-component
    const dy = Math.sin(theta) * length;  // Tangent y-component

    // Draw the velocity vector
    ctx.beginPath();
    ctx.moveTo(x, y); // Start from the ball's position
    ctx.lineTo(x + dx, y + dy); // Draw the vector line
    ctx.strokeStyle = color; // Set vector color
    ctx.lineWidth = 3;
    ctx.stroke();
    arrowSize = 12;
    // Draw the arrowhead
    const angle = Math.atan2(dy, dx); // Angle of the vector
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy); // Start at the end of the vector
    ctx.lineTo(
      x + dx - arrowSize * Math.cos(angle - Math.PI / 6),
      y + dy - arrowSize * Math.sin(angle - Math.PI / 6)
    ); // First side of the arrowhead
    ctx.lineTo(
      x + dx - arrowSize * Math.cos(angle + Math.PI / 6),
      y + dy - arrowSize * Math.sin(angle + Math.PI / 6)
    ); // Second side of the arrowhead
    ctx.lineTo(x + dx, y + dy); // Back to the tip of the arrowhead
    ctx.fillStyle = color; // Arrowhead color
    ctx.fill();

    // Add vector notation (\vec{v})
    ctx.font = "16px Arial"; // Font for the label
    ctx.fillStyle = color;
    const labelX = x + dx / 2; // Midpoint of the vector for the label
    const labelY = y + dy / 2;

    // Draw the 'v'
    ctx.fillText(marime, labelX - 5, labelY - 10);

    // Draw a small arrow above the 'v'
    ctx.beginPath();
  
    ctx.rect(labelX-5, labelY-25, 10, 1);
    ctx.moveTo(labelX+5 , labelY - 27); 
    ctx.lineTo(labelX+10 , labelY-25); 
    ctx.lineTo(labelX+5, labelY -23); 
    ctx.closePath(); // Close the arrowhead shape
  
    // Fill the rectangle and arrowhead
    ctx.fillStyle = color;
    ctx.fill();
  }
  else{
    arrowSize = 0;
  }
}


function drawPlots(dataSets, labels, colors, scaleY = 10000) {
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
  
      acc_array =[];
      velocityArray = [];
      thetaArray = [];
      pressed = 0;
  
    }
  }
// Function to calculate angular acceleration
function f(theta, l, omega) {
    return -g * Math.sin(theta) / l - omega*resistanceCoeff;
}

// Function to draw the pendulum
function drawPendulum() {
    ctx.clearRect(0, 0, width, height);

    // Draw pivot
    ctx.beginPath();
    ctx.arc(xRef, yRef, 5, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();

    // Draw pendulum rod
    ctx.beginPath();
    ctx.moveTo(xRef, yRef);
    ctx.lineTo(xBall, yBall);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pendulum ball
    ctx.beginPath();
    ctx.arc(xBall, yBall, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw trajectory


    // Draw angle indicator
    drawAngleIndicator(theta);
}

// Function to draw the angle arc and display the angle in degrees
function drawAngleIndicator(angle) {
  const radius = 50; // Radius of the arc
  const angleInDegrees = (Math.abs(angle) * 180) / Math.PI; // Convert angle to degrees (absolute value)

  // Arc coordinates (draw from -Math.PI / 2 to the pendulum's angle relative to vertical)
  ctx.beginPath();
  ctx.moveTo(xRef, yRef);
  const startAngle = Math.PI / 2; // Vertical axis as the reference
  const endAngle = Math.PI/2 - angle; // Angle relative to the vertical
  ctx.arc(xRef, yRef, radius, startAngle, endAngle, angle>0);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw angle label
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  const labelX = xRef + radius * Math.cos(startAngle + angle / 2);
  const labelY = yRef - radius * Math.sin(startAngle + angle / 2);
  ctx.fillText(`${angleInDegrees.toFixed(0)}°`, labelX, labelY);
}

function drawEnergyChart(E, i, color) {
  
    let y = canvasEnergy.height;
    let x = 40 + i*canvasEnergy.width/3
    ctxEn.beginPath();
    ctxEn.rect(x, y, 40, -E/300);
    ctxEn.fillStyle = color;
    ctxEn.fill();
  }
// Update the pendulum's position
function updatePendulum() {
    if (slowMotion.checked){
      dt = 1/150;
      pressed = 1;
    }
    else{
      dt = 1/90;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxEn.clearRect(0, 0, canvasEnergy.width, canvasEnergy.height);
  

    let K = (m*(omega*l)**2)/2;
    let U = m*((l+yRef)-yBall)*g;

    if (isDragging){
        E = K+U;
    }
    drawPendulum();

    if (!isDragging) {
        
        let acc = f(theta, l, omega); // Angular acceleration
        omega += acc * dt; // Update angular velocity
        theta += omega * dt; // Update angle

        // Update ball position
        xBall = xRef + l * Math.sin(theta);
        yBall = yRef + l * Math.cos(theta);

        // Save trajectory point
        if (resistanceCoeff == 0){
          E = m*g*A;
        }
        else {
          E = K + U;
        }
        acc_array.push(acc/(A*frecv**2));
        velocityArray.push(omega/(A*frecv));
        thetaArray.push((theta)/A);
        const dataSets = [velocityArray, thetaArray,acc_array];
        const labels = [showVelocity, showCoordinate, showAcceleration]; // Checkboxes for toggling
        const colors = ["green", "red", "blue"]; // Corresponding plot colors
        
        // Call the function
        drawPlots(dataSets, labels, colors);
        
        drawVector(xBall, yBall, omega, "green", showVelocity, "v", 50);
        drawVector(xBall, yBall, acc, "blue", showAcceleration, "a", 20);

        console.log(omega*l);
        
    }
 
    if (Math.abs(omega) <.001  && Math.abs(xBall - xRef) < 1){
      omega = 0;
      theta = 0;
    }
    
    drawEnergyChart(K, 0, "green");
    drawEnergyChart(U,1, "blue");
    drawEnergyChart(E, 2, "red");
}

// Animation loop
function animationLoop() {
    updatePendulum();
    

    requestAnimationFrame(animationLoop);
}

// Mouse event handlers
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    pressed = 1;
 
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Update ball position and reset angular velocity
        if (mouseY>yRef){
          xBall = mouseX;
          yBall = mouseY;
          l = Math.sqrt((xBall - xRef) ** 2 + (yBall - yRef) ** 2);
          frecv = Math.sqrt(g/l);
          theta = Math.asin((xBall - xRef) / l);
          omega = 0;
          trajectoryPoints.length = 0; // Clear trajectory
        }
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    A = Math.abs(l+yRef-yBall);
    
});

const resistanceSlider = document.getElementById('resistanceSlider');
const resistanceValue = document.getElementById('resistanceValue');

// Update resistance value when slider is moved
resistanceSlider.addEventListener('input', (e) => {
    resistanceCoeff = parseFloat(e.target.value);
    resistanceValue.textContent = resistanceCoeff;
});

document.getElementById("restartButton").addEventListener("click", () => {
  // Reset variables
  theta = 0; // Reset ball to equilibrium position
  omega = 0;               // Reset velocity to 0
  pressed = 1;
  A = 0;
  // Clear the canvas
  resistanceSlider.value = 0;         // Reset slider value to 0
  resistanceCoeff = 0;                // Reset resistance coefficient variable
  resistanceValue.textContent = 0;    // Update displayed value to 0


});




// Start the simulation
animationLoop();
