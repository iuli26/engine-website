
// Canvas setup
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const dt = 1 / 60;
const a = 0;
const m = 3;
const radius = m * 4;
let mu = 0.3;
let isDragging = false;
let initialPositioning = true;
let mouseX = 0;
let mouseY = 0;
let startDragX = 0;
let startDragY = 0;

// Ball class
class Ball {
  constructor(mass, x, y, v, color) {
    this.mass = mass;
    this.v = v;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  movement() {
    // Apply friction
    this.v[0] = this.v[0] - mu * this.v[0] * dt;
    this.v[1] = this.v[1] - mu * this.v[1] * dt;

    // Update position
    this.x += this.v[0] * dt;
    this.y += this.v[1] * dt;

    // Wall collisions
    if (this.x < a + radius) {
      this.x = a + radius;
      this.v[0] *= -1;
    }
    if (this.x > width - radius - a) {
      this.x = width - radius - a;
      this.v[0] *= -1;
    }
    if (this.y < a + radius) {
      this.y = a + radius;
      this.v[1] *= -1;
    }
    if (this.y > height - radius - a ) {
      this.y = height - radius - a ;
      this.v[1] *= -1;
    }

    // Stop if velocity is very small
    const speed = Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1]);
    if (speed < 5) {
      this.v = [0, 0];
    }
  }

  collision(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2 * radius) {
      // Calculate unit vectors
      const radialUnit = [dx / distance, dy / distance];
      const normalUnit = [-radialUnit[1], radialUnit[0]];

      // Calculate relative velocity
      const relativeVelocity = [this.v[0] - other.v[0], this.v[1] - other.v[1]];

      // Calculate radial component of relative velocity
      const vRadial = [
        (relativeVelocity[0] * radialUnit[0] + relativeVelocity[1] * radialUnit[1]) * radialUnit[0],
        (relativeVelocity[0] * radialUnit[0] + relativeVelocity[1] * radialUnit[1]) * radialUnit[1]
      ];

      // Update velocities (elastic collision)
      this.v[0] -= vRadial[0];
      this.v[1] -= vRadial[1];
      other.v[0] += vRadial[0];
      other.v[1] += vRadial[1];

      // Separate balls to prevent sticking
      const overlap = 2 * radius - distance;
      this.x -= overlap * radialUnit[0] * 0.5;
      this.y -= overlap * radialUnit[1] * 0.5;
      other.x += overlap * radialUnit[0] * 0.5;
      other.y += overlap * radialUnit[1] * 0.5;
    }
  }

drawLaunchLine() {
    if (!isDragging) return;
    
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Draw aiming line (from ball to mouse) - solid black line
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw power indicator (opposite direction) - now as a dotted red line
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x - (mouseX - this.x) * 2,
      this.y - (mouseY - this.y) * 2
    );
    
    // Set line dash pattern for dotted effect
    ctx.setLineDash([5, 3]); // 5px dash, 3px gap
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Reset line dash to solid for other drawings
    ctx.setLineDash([]);
  }
  launch() {
    if (isDragging) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const scale_factor = 3
      // Set velocity based on drag distance (scaled down for better control)
      this.v = [
        -dx * scale_factor,
        -dy * scale_factor
      ];
    }
  }
}

// Create initial balls
function createBalls() {
  const balls = [];
  
  // Red ball (player controlled)
  balls.push(new Ball(m, 200, height/2, [0, 0], "red"));
  
  // Create pyramid of balls
  const gap = 2 * radius + 2;
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k <= i; k++) {
      balls.push(new Ball(
        m, 
        2 * width / 3 + i * gap, 
        height / 2 + k * gap - radius * i, 
        [0, 0], 
        "black"
      ));
    }
  }
  
  return balls;
}

// Simulation variables
let balls = createBalls();
let redBall = balls[0];

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  if (initialPositioning) {
    redBall.x = mouseX;
    redBall.y = mouseY;
    initialPositioning = false;
    return;
  }
  
  // Check if clicking near the red ball
  const dx = mouseX - redBall.x;
  const dy = mouseY - redBall.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 2 * radius + 500 && redBall.v[0] === 0 && redBall.v[1] === 0) {
    isDragging = true;
    startDragX = mouseX;
    startDragY = mouseY;
  }

  if (mouseX > width || mouseX <0 || mouseY > height || mouseY < 0){
    this.launch()
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', (e) => {
  if (isDragging) {
    redBall.launch();
    isDragging = false;
  }
});

// Reset button
document.getElementById('restartBtn').addEventListener('click', () => {
  balls = createBalls();
  redBall = balls[0];
  isDragging = false;
  initialPositioning = true;
});

// Animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);
  
  // Update and draw all balls
  for (const ball of balls) {
    ball.movement();
    ball.draw();
  }
  
  // Handle collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].collision(balls[j]);
    }
  }
  
  // Draw launch line if dragging
  if (isDragging) {
    redBall.drawLaunchLine();
  }
  
  // Show instruction if in initial positioning mode
  if (initialPositioning) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Click to position the red ball", width/2 - 100, height/2 - 100);
  }
  
  requestAnimationFrame(animate);
}

animate();
