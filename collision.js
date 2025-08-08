  // Canvas setup
        const canvas = document.getElementById('simulationCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const dt = 1 / 60;
        let mu = 0;
        
        const y_axa = height/2 + 50
        // Object class
        class Rect {
            constructor(mass, x, v, color) {
                this.m = mass;
                this.v = v;
                this.x = x;
                this.height = 20 * this.m;
                this.width = this.height;
                this.color = color;
                this.y = y_axa - this.height;
                this.dragging = false;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(this.x - this.width/2, this.y, this.width, this.height);
            }
            
            movement() {
                // Apply friction
                this.v = this.v - this.v * mu * dt;
                
                // Update position
                this.x += this.v * dt;
                
                // Wall collisions
                if (this.x - this.width/2 < 0 || this.x + this.width/2 > width) {
                    this.v *= -1;
                }
                
                // Stop if velocity is very small
                if (Math.abs(this.v) < 5) {
                    this.v = 0;
                }
            }
            
            isMouseOver(mouseX, mouseY) {
                return mouseX >= this.x - this.width/2 && 
                       mouseX <= this.x + this.width/2 && 
                       mouseY >= this.y && 
                       mouseY <= this.y + this.height;
            }
        }
        
        // Simulation variables
        let rect1, rect2, rect3;
        let objects = [];
        let mouseX = 0, mouseY = 0;
        let isDragging = false;
        let draggedObject = null;
        let thirdObjectAdded = false;
        
        // Initialize simulation
        function initSimulation() {


            const mass1 = 2;
            const vel1 = 0;
            const pos1 = 200;
            
            const mass2 = 3;
            const vel2 = 0;
            const pos2 = 800;
            
            rect1 = new Rect(mass1, pos1, vel1, 'blue');
            rect2 = new Rect(mass2, pos2, vel2, 'red');
            
            objects = [rect1, rect2];

            document.getElementById('mass1').value = mass1;
            document.getElementById('velocity1').value = vel1;
            document.getElementById('mass1Value').textContent = mass1;
            document.getElementById('velocity1Value').textContent = vel1;
  

            // Set initial values for object 2
            document.getElementById('mass2').value = mass2;
            document.getElementById('velocity2').value = vel2;
            document.getElementById('mass2Value').textContent = mass2;
            document.getElementById('velocity2Value').textContent = vel2;

            if (thirdObjectAdded) {
                const mass3 = parseFloat(document.getElementById('mass3').value);
                const vel3 = 0;
                const pos3 = 400;
                
                rect3 = new Rect(mass3, pos3, vel3, 'green');
                objects.push(rect3);

                document.getElementById('mass3').value = mass3;
                document.getElementById('velocity3').value = vel3;
                document.getElementById('mass3Value').textContent = mass3;
                document.getElementById('velocity3Value').textContent = vel3;
            }
        }
        
        // Handle collisions
        function handleCollisions() {
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    const obj1 = objects[i];
                    const obj2 = objects[j];
                    
                    const distance = Math.abs(obj2.x - obj1.x);
                    const minDistance = (obj1.width + obj2.width) / 2;
                    
                    if (distance <= minDistance) {
                        // Calculate center of mass velocity
                        const v_cm = (obj1.m * obj1.v + obj2.m * obj2.v) / (obj1.m + obj2.m);
                        
                        // Update velocities
                        obj1.v = 2 * v_cm - obj1.v;
                        obj2.v = 2 * v_cm - obj2.v;
                        
                        // Separate objects to prevent sticking
                        const overlap = minDistance - distance;
                        if (obj1.v > 0 && obj2.v < 0) {
                            obj1.x += overlap/2;
                            obj2.x -= overlap/2;
                        } else if (obj1.v < 0 && obj2.v > 0) {
                            obj1.x -= overlap/2;
                            obj2.x += overlap/2;
                        } else if (obj1.v > 0 && obj2.v > 0) {
                            if (obj1.v > obj2.v) {
                                obj1.x += overlap;
                            } else {
                                obj2.x += overlap;
                            }
                        } else if (obj1.v < 0 && obj2.v < 0) {
                            if (obj1.v < obj2.v) {
                                obj1.x -= overlap;
                            } else {
                                obj2.x -= overlap;
                            }
                        }
                    }
                }
            }
        }
        
        // Draw axis
        function drawAxis() {
            ctx.beginPath();
            ctx.moveTo(0, y_axa);
            ctx.lineTo(width, y_axa);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        
        // Main animation loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            drawAxis();
            
            if (!isDragging) {
                handleCollisions();
            }
            
            for (const obj of objects) {
                if (!isDragging || obj !== draggedObject) {
                    obj.movement();
                }
                obj.draw();
            }
            
            requestAnimationFrame(animate);
        }
        
        // Event listeners for mouse interaction
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            
            for (const obj of objects) {
                if (obj.isMouseOver(mouseX, mouseY)) {
                    isDragging = true;
                    draggedObject = obj;
                    obj.dragging = true;
                    break;
                }
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            
            if (isDragging && draggedObject) {
                draggedObject.x = mouseX;
                draggedObject.v = 0; // Reset velocity when dragging
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            if (draggedObject) {
                draggedObject.dragging = false;
                draggedObject = null;
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            if (draggedObject) {
                draggedObject.dragging = false;
                draggedObject = null;
            }
        });
        
        // Button event listeners
        document.getElementById('addObjectBtn').addEventListener('click', () => {
            if (!thirdObjectAdded) {
                thirdObjectAdded = true;
                document.getElementById('object3Controls').style.display = 'block';
                document.getElementById('removeObjectBtn').style.display = 'inline-block';
                document.getElementById('addObjectBtn').style.display = 'none';
                initSimulation();
            }
        });
        
        document.getElementById('removeObjectBtn').addEventListener('click', () => {
            if (thirdObjectAdded) {
                thirdObjectAdded = false;
                document.getElementById('object3Controls').style.display = 'none';
                document.getElementById('removeObjectBtn').style.display = 'none';
                document.getElementById('addObjectBtn').style.display = 'inline-block';
                initSimulation();
            }
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            initSimulation();
        });
        
        // Friction slider
        document.getElementById('muSlider').addEventListener('input', (e) => {
            mu = parseFloat(e.target.value);
            document.getElementById('muValue').textContent = e.target.value;
        });
        
        // Slider event listeners for real-time updates
        function setupSliderListeners() {
            // Object 1 sliders
            document.getElementById('mass1').addEventListener('input', (e) => {
                document.getElementById('mass1Value').textContent = e.target.value;
                if (rect1) {
                    rect1.m = parseFloat(e.target.value);
                    rect1.height = 20 * rect1.m;
                    rect1.width = rect1.height;
                    rect1.y = y_axa - rect1.height;
                }
            });
            
            document.getElementById('velocity1').addEventListener('input', (e) => {
                document.getElementById('velocity1Value').textContent = e.target.value;
                if (rect1) rect1.v = parseFloat(e.target.value);
            });
            
  
            
            // Object 2 sliders
            document.getElementById('mass2').addEventListener('input', (e) => {
                document.getElementById('mass2Value').textContent = e.target.value;
                if (rect2) {
                    rect2.m = parseFloat(e.target.value);
                    rect2.height = 20 * rect2.m;
                    rect2.width = rect2.height;
                    rect2.y = y_axa - rect2.height;
                }
            });
            
            document.getElementById('velocity2').addEventListener('input', (e) => {
                document.getElementById('velocity2Value').textContent = e.target.value;
                if (rect2) rect2.v = parseFloat(e.target.value);
            });
            

            
            // Object 3 sliders
            document.getElementById('mass3').addEventListener('input', (e) => {
                document.getElementById('mass3Value').textContent = e.target.value;
                if (rect3) {
                    rect3.m = parseFloat(e.target.value);
                    rect3.height = 20 * rect3.m;
                    rect3.width = rect3.height;
                    rect3.y = y_axa - rect3.height;
                }
            });
            
            document.getElementById('velocity3').addEventListener('input', (e) => {
                document.getElementById('velocity3Value').textContent = e.target.value;
                if (rect3) rect3.v = parseFloat(e.target.value);
            });
            
        }
        
        // Initialize everything
        setupSliderListeners();
        initSimulation();
        animate();

