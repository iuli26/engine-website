document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('simulationCanvas');
  const ctx = canvas.getContext('2d');
  const muSlider = document.getElementById('muSlider');
  const muValue = document.getElementById('muValue');
  const resetBtn = document.getElementById('resetBtn');
  const gravityBtn = document.getElementById('gravityBtn');

  // Simulation parameters
  const width = canvas.width;
  const height = canvas.height;
  let dt = 1/60;
  let g = 0;
  let mu = parseFloat(muSlider.value);
  let isDragging = false;
  let gravityEnabled = false;

  // Ball properties
  let x_ball = width/2;
  let y_ball = height/2;
  let vX = 0, vY = 0;
  const m = 2;
  const ballRadius = 10;

  // Spring properties
  const lungime_initiala = 200;
  let x_ref = x_ball - lungime_initiala;
  let y_ref = height/2;
  const number_of_coils = 10;
  const k = 20;
  
  // Trajectory point
  let trajectory_points = [];
  const max_trajectory_points = 1e4;

  class Spring {
    constructor(x, y, coils, k, x_ech, y_ech) {
      this.x = x;
      this.y = y;
      this.coils = coils;
      this.k = k;
      this.x_ech = x_ech;
      this.y_ech = y_ech;
      this.l0 = Math.sqrt((this.x-this.x_ech)**2 + (this.y_ech-this.y)**2);
      this.unit_vec_initial = [(this.x_ech-this.x)/this.l0, (this.y_ech-this.y)/this.l0];
    }
    
    lungime_initiala(x_ball, y_ball) {
      return Math.sqrt((x_ball - this.x)**2 + (y_ball - this.y)**2);
    }
    
    draw_spring(x_ball, y_ball) {
      const l = this.lungime_initiala(x_ball, y_ball);
      if (l < 1) return 0;
      
      const unit_vec = [(x_ball-this.x)/l, (y_ball-this.y)/l];
      const normal_vec = [-unit_vec[1], unit_vec[0]];
      
      // Draw anchor point
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
      ctx.fillStyle = 'black';
      ctx.fill();
      
      // Draw spring
      const n = 300;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const t = i/n;
        const x = this.x + t*(x_ball-this.x);
        const y = this.y + t*(y_ball-this.y);
        const offset = 5 * Math.sin(t * Math.PI * 2 * this.coils);
        const px = x + normal_vec[0] * offset;
        const py = y + normal_vec[1] * offset;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (unit_vec[1] * this.unit_vec_initial[1] + unit_vec[0] * this.unit_vec_initial[0] < 0) {
        return 1;
      }
      return 0;
    }
    
    force(x_ball, y_ball) {
      const force = -this.k * (this.lungime_initiala(x_ball, y_ball) - this.l0);
      const theta = Math.atan2(y_ball-this.y, x_ball-this.x);
      return [
        force * Math.cos(theta),
        force * Math.sin(theta) + m*g
      ];
    }
  }

  // Create spring
  const spring_down = new Spring(
    x_ref + lungime_initiala, 
    y_ref - lungime_initiala, 
    number_of_coils, 
    k, 
    x_ball, 
    y_ball
  );
  const springs = [spring_down];

  // Event listeners
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    gravityEnabled = 1;
    g = gravityEnabled ? 981 : 0;
    gravityBtn.textContent = gravityEnabled ? 
      'Disable Gravity' : 'Enable Gravity';
    // Check if clicking on ball
  
  isDragging = true;
  
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    x_ball = e.clientX - rect.left;
    y_ball = e.clientY - rect.top;
    
    // Reset velocity when dragging
    vX = 0;
    vY = 0;
    trajectory_points = [];
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  

  
  muSlider.addEventListener('input', () => {
    mu = parseFloat(muSlider.value);
    muValue.textContent = mu.toFixed(2);
  });
  
  resetBtn.addEventListener('click', resetSimulation);
  gravityBtn.addEventListener('click', () => {
    gravityEnabled = !gravityEnabled;
    g = gravityEnabled ? 981 : 0;
    gravityBtn.textContent = gravityEnabled ? 
      'Disable Gravity' : 'Enable Gravity';
    vX = 0;
    vY = 0;
  });

  function resetSimulation() {
    x_ball = width/2;
    y_ball = height/2;
    vX = 0;
    vY = 0;
    trajectory_points = [];
    isDragging = false;

    gravityEnabled = false;
      g = gravityEnabled ? 981 : 0;
      gravityBtn.textContent = gravityEnabled ? 
        'Disable Gravity' : 'Enable Gravity';
      
  }

  function updateSimulation() {
    if (isDragging) return;
    
    // Calculate forces
    let F_x = 0, F_y = 0;
    for (const spring of springs) {
      const force = spring.force(x_ball, y_ball);
      F_x += force[0];
      F_y += force[1];
    }
    
    // Update velocity with resistance
    vX += (F_x - mu*vX)/m * dt;
    vY += (F_y - mu*vY)/m * dt;
    
    // Update position
    x_ball += vX * dt;
    y_ball += vY * dt;
    
    // Add to trajectory
    trajectory_points.push([x_ball, y_ball]);
    if (trajectory_points.length > max_trajectory_points) {
      trajectory_points.shift();
    }
  }

  function drawSimulation() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw trajectory
    if (trajectory_points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trajectory_points[0][0], trajectory_points[0][1]);
      for (let i = 1; i < trajectory_points.length; i++) {
        ctx.lineTo(trajectory_points[i][0], trajectory_points[i][1]);
      }
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw springs
    for (const spring of springs) {
      spring.draw_spring(x_ball, y_ball);
    }
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(x_ball, y_ball, ballRadius, 0, Math.PI*2);
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

  // Start simulation
  gameLoop();
});