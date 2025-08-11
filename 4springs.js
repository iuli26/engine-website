
document.addEventListener('DOMContentLoaded', function() {
  

  const canvas = document.getElementById('simulationCanvas');
  const ctx = canvas.getContext('2d');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  // Simulation parameters
  const width = canvas.width;
  const height = canvas.height;
  let isPaused = false;
  let isDragging = false;

  // Physics parameters
  const dt = 1 / 60;

  const k = 20; // Spring constant
  const m = 3;  // Mass of the ball
  let damping = 0.; // Velocity damping factor

  // Ball properties
  let x_ball = width / 2;
  let y_ball = height / 2;
  const ballRadius = 4*m;
  let vX = 0, vY = 0;

  // Spring properties
  const springLength = 250;
  const springCoils = 20;
  const springWidth = 5;

  // Spring anchor points
  const anchors = [
    { x: width / 2 - springLength, y: height / 2 },    // Left
    { x: width / 2 + springLength, y: height / 2 },    // Right
    { x: width / 2, y: height / 2 - springLength },    // Top
    { x: width / 2, y: height / 2 + springLength }     // Bottom
  ];

  // Event listeners
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  resetBtn.addEventListener('click', resetSimulation);
  pauseBtn.addEventListener('click', togglePause);

  

  const resistanceSlider = document.getElementById('resistanceSlider');
  const resistanceValue = document.getElementById('resistanceValue');

// Update resistance value when slider is moved
  resistanceSlider.addEventListener('input', (e) => {
      damping= parseFloat(e.target.value);
      resistanceValue.textContent = damping;
  });
  function resetSimulation() {
    x_ball = width / 2;
    y_ball = height / 2;
    vX = 0;
    vY = 0;
    isDragging = false;
    if (isPaused) togglePause();
  }

  function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  }

  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is inside the ball
    const dist = Math.sqrt((mouseX - x_ball) ** 2 + (mouseY - y_ball) ** 2);
   
    isDragging = true;
    
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    x_ball = e.clientX - rect.left;
    y_ball = e.clientY - rect.top;
    
    // Reset velocity while dragging
    vX = 0;
    vY = 0;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function calculateForces() {
    let totalFx = 0;
    let totalFy = 0;

    anchors.forEach(anchor => {
      // Calculate spring force (Hooke's Law)
      const dx = x_ball - anchor.x;
      const dy = y_ball - anchor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const displacement = distance - springLength;
      
      if (distance > 0) {
        const forceMagnitude = k * displacement;
        const forceX = -forceMagnitude * dx / distance;
        const forceY = -forceMagnitude * dy / distance;
        
        totalFx += forceX;
        totalFy += forceY;
      }
    });

  

    return { fx: totalFx, fy: totalFy };
  }

  function updateSimulation() {
    if (isPaused || isDragging) return;

    // Calculate forces
    const forces = calculateForces();
    
    // Update velocity (F = ma => a = F/m)
    vX += (forces.fx - damping * vX) / m * dt;
    vY += (forces.fy - damping * vY)/ m * dt;
    
   
    // Update position
    x_ball += vX * dt;
    y_ball += vY * dt;
  }

  function drawSpring(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalX = -dy / distance;
    const normalY = dx / distance;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    const segments = 150;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + t * dx;
      const y = y1 + t * dy;
      
      // Add sinusoidal displacement for spring coils
      const offset = springWidth * Math.sin(t * Math.PI * 2 * springCoils);
      const offsetX = x + normalX * offset;
      const offsetY = y + normalY * offset;
      
      ctx.lineTo(offsetX, offsetY);
    }
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawSimulation() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw springs
    anchors.forEach(anchor => {
      drawSpring(anchor.x, anchor.y, x_ball, y_ball);
      // În drawSimulation():
 
      // Draw anchor points
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();
    });
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(x_ball, y_ball, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = isDragging ? '#ff5722' : '#f44336';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function gameLoop() {
    updateSimulation();
    drawSimulation();
    requestAnimationFrame(gameLoop);
  }

  // Start the simulation
  gameLoop();
});
