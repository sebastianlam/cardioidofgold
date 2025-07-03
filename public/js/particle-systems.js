// Advanced Particle Systems
class ParticleSystemManager {
    constructor(scene) {
        this.scene = scene;
        this.systems = {};
        this.time = 0;
        this.init();
    }
    
    init() {
        this.createFloatingParticles();
        this.createMysticalOrbs();
        this.createEnergyField();
        this.createAmbientDust();
    }
    
    createFloatingParticles() {
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a sphere around the head
            const radius = 8 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.cos(phi);
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Ethereal colors
            colors[i3] = 0.8 + Math.random() * 0.2;     // R
            colors[i3 + 1] = 0.9 + Math.random() * 0.1; // G
            colors[i3 + 2] = 1.0;                       // B
            
            sizes[i] = 2 + Math.random() * 3;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createParticleTexture() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                uniform float time;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    pos += velocity * time;
                    
                    // Orbital motion
                    float angle = time * 0.1 + length(position) * 0.1;
                    pos.x += sin(angle) * 0.5;
                    pos.z += cos(angle) * 0.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    
                    if (gl_FragColor.a < 0.1) discard;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.systems.floatingParticles = { mesh: particles, material, geometry };
    }
    
    createMysticalOrbs() {
        const orbCount = 8;
        const orbs = new THREE.Group();
        
        for (let i = 0; i < orbCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(i / orbCount, 0.8, 0.6),
                transparent: true,
                opacity: 0.7
            });
            
            const orb = new THREE.Mesh(geometry, material);
            
            // Position orbs in a spiral around the head
            const radius = 6;
            const angle = (i / orbCount) * Math.PI * 2;
            const height = Math.sin(angle * 2) * 3;
            
            orb.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            orb.userData = {
                originalPosition: orb.position.clone(),
                phase: angle,
                speed: 0.5 + Math.random() * 0.5
            };
            
            orbs.add(orb);
        }
        
        this.scene.add(orbs);
        this.systems.mysticalOrbs = { group: orbs };
    }
    
    createEnergyField() {
        const fieldCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(fieldCount * 3);
        const colors = new Float32Array(fieldCount * 3);
        
        for (let i = 0; i < fieldCount; i++) {
            const i3 = i * 3;
            
            // Create energy field around head
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.cos(phi);
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Electric blue/cyan colors
            colors[i3] = 0.0;                           // R
            colors[i3 + 1] = 0.5 + Math.random() * 0.5; // G
            colors[i3 + 2] = 1.0;                       // B
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0.5 }
            },
            vertexShader: `
                uniform float time;
                uniform float intensity;
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Pulsing effect
                    float pulse = sin(time * 2.0 + length(position) * 5.0) * 0.5 + 0.5;
                    vOpacity = pulse * intensity;
                    
                    // Electric distortion
                    pos += normalize(position) * sin(time * 3.0 + position.x * 10.0) * 0.1;
                    
                    gl_PointSize = 4.0 * pulse;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                    if (r > 0.5) discard;
                    
                    float alpha = (1.0 - r * 2.0) * vOpacity;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            blending: THREE.AdditiveBlending,
            transparent: true,
            vertexColors: true
        });
        
        const energyField = new THREE.Points(geometry, material);
        this.scene.add(energyField);
        this.systems.energyField = { mesh: energyField, material };
    }
    
    createAmbientDust() {
        const dustCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);
        const velocities = new Float32Array(dustCount * 3);
        const life = new Float32Array(dustCount);
        
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // Spread dust in a large area
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;
            
            // Slow floating motion
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = Math.random() * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
            
            life[i] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('life', new THREE.BufferAttribute(life, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float life;
                uniform float time;
                varying float vLife;
                
                void main() {
                    vLife = life;
                    
                    vec3 pos = position + velocity * time;
                    
                    // Reset particles that have drifted too far
                    if (pos.y > 10.0) {
                        pos.y = -10.0;
                    }
                    
                    gl_PointSize = 1.0 + life * 2.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying float vLife;
                
                void main() {
                    float alpha = vLife * 0.3;
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `,
            transparent: true,
            depthWrite: false
        });
        
        const dust = new THREE.Points(geometry, material);
        this.scene.add(dust);
        this.systems.ambientDust = { mesh: dust, material };
    }
    
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    update(time) {
        this.time = time;
        
        // Update floating particles
        if (this.systems.floatingParticles) {
            this.systems.floatingParticles.material.uniforms.time.value = time * 0.001;
        }
        
        // Update mystical orbs
        if (this.systems.mysticalOrbs) {
            this.systems.mysticalOrbs.group.children.forEach((orb, index) => {
                const userData = orb.userData;
                const elapsed = time * 0.001 * userData.speed;
                
                // Orbital motion with vertical oscillation
                const angle = userData.phase + elapsed;
                const radius = 6 + Math.sin(elapsed * 2) * 1;
                const height = Math.sin(angle * 3) * 2;
                
                orb.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Pulsing glow
                const intensity = 0.5 + Math.sin(elapsed * 4) * 0.3;
                orb.material.opacity = intensity;
                
                // Color shifting
                const hue = (userData.phase + elapsed * 0.1) % 1;
                orb.material.color.setHSL(hue, 0.8, 0.6);
            });
        }
        
        // Update energy field
        if (this.systems.energyField) {
            this.systems.energyField.material.uniforms.time.value = time * 0.001;
            this.systems.energyField.material.uniforms.intensity.value = 
                0.3 + Math.sin(time * 0.002) * 0.2;
        }
        
        // Update ambient dust
        if (this.systems.ambientDust) {
            this.systems.ambientDust.material.uniforms.time.value = time * 0.001;
        }
    }
    
    setIntensity(systemName, intensity) {
        const system = this.systems[systemName];
        if (!system) return;
        
        switch (systemName) {
            case 'floatingParticles':
                system.mesh.visible = intensity > 0;
                if (system.material.opacity !== undefined) {
                    system.material.opacity = intensity;
                }
                break;
            case 'mysticalOrbs':
                system.group.visible = intensity > 0;
                system.group.children.forEach(orb => {
                    orb.material.opacity *= intensity;
                });
                break;
            case 'energyField':
                system.mesh.visible = intensity > 0;
                system.material.uniforms.intensity.value = intensity;
                break;
            case 'ambientDust':
                system.mesh.visible = intensity > 0;
                if (system.material.opacity !== undefined) {
                    system.material.opacity = intensity;
                }
                break;
        }
    }
    
    toggleSystem(systemName, enabled) {
        const system = this.systems[systemName];
        if (!system) return;
        
        if (system.mesh) {
            system.mesh.visible = enabled;
        } else if (system.group) {
            system.group.visible = enabled;
        }
    }
    
    getAvailableSystems() {
        return Object.keys(this.systems);
    }
    
    dispose() {
        Object.values(this.systems).forEach(system => {
            if (system.mesh) {
                system.mesh.geometry.dispose();
                system.mesh.material.dispose();
                this.scene.remove(system.mesh);
            }
            if (system.group) {
                system.group.children.forEach(child => {
                    child.geometry.dispose();
                    child.material.dispose();
                });
                this.scene.remove(system.group);
            }
        });
        this.systems = {};
    }
}

// Advanced Weather Effects
class WeatherEffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.effects = {};
        this.currentWeather = 'clear';
        this.init();
    }
    
    init() {
        this.createRainEffect();
        this.createSnowEffect();
        this.createMistEffect();
    }
    
    createRainEffect() {
        const rainCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(rainCount * 3);
        const velocities = new Float32Array(rainCount * 3);
        
        for (let i = 0; i < rainCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = Math.random() * 20 + 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
            
            velocities[i3] = 0;
            velocities[i3 + 1] = -0.5 - Math.random() * 0.3;
            velocities[i3 + 2] = 0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                uniform float time;
                
                void main() {
                    vec3 pos = position + velocity * time;
                    
                    // Reset raindrops that fall below ground
                    if (pos.y < -5.0) {
                        pos.y = 15.0;
                    }
                    
                    gl_PointSize = 2.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.7, 0.8, 1.0, 0.6);
                }
            `,
            transparent: true
        });
        
        const rain = new THREE.Points(geometry, material);
        rain.visible = false;
        this.scene.add(rain);
        this.effects.rain = { mesh: rain, material };
    }
    
    createSnowEffect() {
        const snowCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(snowCount * 3);
        const velocities = new Float32Array(snowCount * 3);
        
        for (let i = 0; i < snowCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = Math.random() * 20 + 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
            
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = -0.1 - Math.random() * 0.1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                uniform float time;
                
                void main() {
                    vec3 pos = position + velocity * time;
                    
                    // Add swaying motion
                    pos.x += sin(time * 0.001 + position.y) * 0.5;
                    
                    // Reset snowflakes
                    if (pos.y < -5.0) {
                        pos.y = 15.0;
                    }
                    
                    gl_PointSize = 3.0 + sin(time * 0.001) * 1.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
                }
            `,
            transparent: true
        });
        
        const snow = new THREE.Points(geometry, material);
        snow.visible = false;
        this.scene.add(snow);
        this.effects.snow = { mesh: snow, material };
    }
    
    createMistEffect() {
        const mistCount = 50;
        const group = new THREE.Group();
        
        for (let i = 0; i < mistCount; i++) {
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.1,
                color: 0xffffff,
                side: THREE.DoubleSide
            });
            
            const mist = new THREE.Mesh(geometry, material);
            mist.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 5,
                (Math.random() - 0.5) * 20
            );
            mist.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            mist.userData = {
                speed: 0.001 + Math.random() * 0.002,
                rotationSpeed: (Math.random() - 0.5) * 0.01
            };
            
            group.add(mist);
        }
        
        group.visible = false;
        this.scene.add(group);
        this.effects.mist = { group };
    }
    
    setWeather(weatherType) {
        // Hide all effects
        Object.values(this.effects).forEach(effect => {
            if (effect.mesh) effect.mesh.visible = false;
            if (effect.group) effect.group.visible = false;
        });
        
        // Show selected effect
        const effect = this.effects[weatherType];
        if (effect) {
            if (effect.mesh) effect.mesh.visible = true;
            if (effect.group) effect.group.visible = true;
        }
        
        this.currentWeather = weatherType;
    }
    
    update(time) {
        // Update rain
        if (this.effects.rain && this.effects.rain.mesh.visible) {
            this.effects.rain.material.uniforms.time.value = time * 0.001;
        }
        
        // Update snow
        if (this.effects.snow && this.effects.snow.mesh.visible) {
            this.effects.snow.material.uniforms.time.value = time * 0.001;
        }
        
        // Update mist
        if (this.effects.mist && this.effects.mist.group.visible) {
            this.effects.mist.group.children.forEach(mist => {
                mist.rotation.x += mist.userData.rotationSpeed;
                mist.rotation.y += mist.userData.rotationSpeed * 0.5;
                mist.position.y += mist.userData.speed;
                
                if (mist.position.y > 8) {
                    mist.position.y = -2;
                }
            });
        }
    }
    
    getAvailableWeather() {
        return ['clear', ...Object.keys(this.effects)];
    }
}

// Export classes
window.ParticleSystemManager = ParticleSystemManager;
window.WeatherEffectsManager = WeatherEffectsManager; 