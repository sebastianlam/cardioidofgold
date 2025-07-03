// Performance Monitoring Utility
class PerformanceMonitor {
    constructor() {
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: performance.now(),
            memory: 0,
            drawCalls: 0
        };
        
        this.isEnabled = false;
        this.statsElement = null;
        this.fpsHistory = [];
        this.maxHistoryLength = 60; // Store 60 frames for averaging
        
        this.init();
    }
    
    init() {
        // Only enable in development mode
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            this.createStatsElement();
            this.enable();
        }
    }
    
    createStatsElement() {
        this.statsElement = document.createElement('div');
        this.statsElement.className = 'stats';
        this.statsElement.innerHTML = `
            <div>FPS: <span id="fps">0</span></div>
            <div>Memory: <span id="memory">0</span> MB</div>
            <div>Triangles: <span id="triangles">0</span></div>
        `;
        document.body.appendChild(this.statsElement);
        
        // Add toggle functionality
        this.statsElement.addEventListener('click', () => {
            this.toggle();
        });
        
        // Add keyboard shortcut
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyP' && event.ctrlKey) {
                event.preventDefault();
                this.toggle();
            }
        });
    }
    
    enable() {
        this.isEnabled = true;
        if (this.statsElement) {
            this.statsElement.style.display = 'block';
        }
    }
    
    disable() {
        this.isEnabled = false;
        if (this.statsElement) {
            this.statsElement.style.display = 'none';
        }
    }
    
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    update(renderer, scene) {
        if (!this.isEnabled) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.stats.lastTime;
        
        // Calculate FPS
        this.stats.frameCount++;
        const fps = 1000 / deltaTime;
        this.fpsHistory.push(fps);
        
        // Keep history limited
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
        
        // Average FPS over recent frames
        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        this.stats.fps = Math.round(avgFps);
        
        // Memory usage (if available)
        if (performance.memory) {
            this.stats.memory = Math.round(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
        }
        
        // Count triangles in scene
        let triangleCount = 0;
        scene.traverse((object) => {
            if (object.isMesh && object.geometry) {
                const geometry = object.geometry;
                if (geometry.index) {
                    triangleCount += geometry.index.count / 3;
                } else if (geometry.attributes.position) {
                    triangleCount += geometry.attributes.position.count / 3;
                }
            }
        });
        
        // Update display
        this.updateDisplay(Math.round(triangleCount));
        
        this.stats.lastTime = currentTime;
    }
    
    updateDisplay(triangles) {
        if (!this.statsElement) return;
        
        const fpsElement = this.statsElement.querySelector('#fps');
        const memoryElement = this.statsElement.querySelector('#memory');
        const trianglesElement = this.statsElement.querySelector('#triangles');
        
        if (fpsElement) {
            fpsElement.textContent = this.stats.fps;
            // Color code FPS
            if (this.stats.fps >= 55) {
                fpsElement.style.color = '#4ade80'; // Green
            } else if (this.stats.fps >= 30) {
                fpsElement.style.color = '#fbbf24'; // Yellow
            } else {
                fpsElement.style.color = '#ef4444'; // Red
            }
        }
        
        if (memoryElement) {
            memoryElement.textContent = this.stats.memory;
        }
        
        if (trianglesElement) {
            trianglesElement.textContent = triangles.toLocaleString();
        }
    }
    
    logPerformanceMarks() {
        if (typeof performance !== 'undefined' && performance.getEntriesByType) {
            const marks = performance.getEntriesByType('mark');
            const measures = performance.getEntriesByType('measure');
            
            console.group('Performance Marks');
            marks.forEach(mark => {
                console.log(`${mark.name}: ${mark.startTime.toFixed(2)}ms`);
            });
            console.groupEnd();
            
            if (measures.length > 0) {
                console.group('Performance Measures');
                measures.forEach(measure => {
                    console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
                });
                console.groupEnd();
            }
        }
    }
    
    measureFunction(name, fn) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(`${name}-start`);
            const result = fn();
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
            return result;
        }
        return fn();
    }
    
    startMeasure(name) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(`${name}-start`);
        }
    }
    
    endMeasure(name) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
        }
    }
}

// Export for use in main app
window.PerformanceMonitor = PerformanceMonitor; 