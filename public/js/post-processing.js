// Advanced Post-Processing Effects System
class PostProcessingManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.passes = {};
        this.effects = {
            bloom: false,
            ssao: false,
            fxaa: true,
            filmGrain: false,
            chromaticAberration: false,
            vignette: false
        };
        
        // Don't call init() here - will be called from outside
    }
    
    async init() {
        // Load Three.js post-processing modules
        await this.loadPostProcessingModules();
        this.setupComposer();
        this.createPasses();
    }
    
    async loadPostProcessingModules() {
        // In a real implementation, these would be loaded from CDN or bundled
        // For now, we'll create simplified versions
        if (!window.THREE.EffectComposer) {
            this.createEffectComposerPolyfill();
        }
    }
    
    createEffectComposerPolyfill() {
        // Simplified Effect Composer for basic post-processing
        window.THREE.EffectComposer = function(renderer) {
            this.renderer = renderer;
            this.passes = [];
            this.renderTarget1 = new THREE.WebGLRenderTarget(
                window.innerWidth, 
                window.innerHeight,
                {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
                    stencilBuffer: false
                }
            );
            this.renderTarget2 = this.renderTarget1.clone();
            this.writeBuffer = this.renderTarget1;
            this.readBuffer = this.renderTarget2;
        };
        
        window.THREE.EffectComposer.prototype = {
            addPass: function(pass) {
                this.passes.push(pass);
                pass.setSize(this.renderTarget1.width, this.renderTarget1.height);
            },
            
            render: function() {
                let readBuffer = this.readBuffer;
                let writeBuffer = this.writeBuffer;
                
                for (let i = 0; i < this.passes.length; i++) {
                    const pass = this.passes[i];
                    const isLastPass = i === this.passes.length - 1;
                    
                    if (isLastPass) {
                        // Render final pass to screen
                        pass.render(this.renderer, null, readBuffer);
                    } else {
                        pass.render(this.renderer, writeBuffer, readBuffer);
                        
                        if (pass.needsSwap) {
                            const tmp = readBuffer;
                            readBuffer = writeBuffer;
                            writeBuffer = tmp;
                        }
                    }
                }
            },
            
            setSize: function(width, height) {
                this.renderTarget1.setSize(width, height);
                this.renderTarget2.setSize(width, height);
                this.passes.forEach(pass => pass.setSize(width, height));
            }
        };
        
        // Basic Render Pass
        window.THREE.RenderPass = function(scene, camera) {
            this.scene = scene;
            this.camera = camera;
            this.clear = true;
            this.needsSwap = true;
        };
        
        window.THREE.RenderPass.prototype = {
            render: function(renderer, writeBuffer, readBuffer) {
                const oldRenderTarget = renderer.getRenderTarget();
                renderer.setRenderTarget(writeBuffer);
                if (this.clear) renderer.clear();
                renderer.render(this.scene, this.camera);
                renderer.setRenderTarget(oldRenderTarget);
            },
            
            setSize: function(width, height) {
                // No-op for render pass
            }
        };
    }
    
    setupComposer() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Basic render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.passes.render = renderPass;
    }
    
    createPasses() {
        // Clear existing passes except render pass
        if (this.composer) {
            this.composer.passes = this.composer.passes.filter(pass => pass === this.passes.render);
        }
        
        // Add effect passes in order
        this.createBloomPass();
        this.createVignettePass();
        this.createFilmGrainPass();
        this.createChromaticAberrationPass();
        
        // Add final copy pass to render to screen
        this.createCopyPass();
    }
    
    createCopyPass() {
        const copyShader = {
            uniforms: {
                tDiffuse: { value: null }
            },
            
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            
            fragmentShader: `
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                
                void main() {
                    gl_FragColor = texture2D(tDiffuse, vUv);
                }
            `
        };
        
        const copyPass = this.createShaderPass(copyShader);
        copyPass.needsSwap = false; // Final pass doesn't need to swap
        this.composer.addPass(copyPass);
        this.passes.copy = copyPass;
    }
    
    createBloomPass() {
        if (!this.effects.bloom) return;
        
        // Custom bloom shader
        const bloomShader = {
            uniforms: {
                tDiffuse: { value: null },
                bloomStrength: { value: 0.3 },
                bloomRadius: { value: 0.8 },
                bloomThreshold: { value: 0.8 }
            },
            
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float bloomStrength;
                uniform float bloomRadius;
                uniform float bloomThreshold;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Simple bloom effect
                    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    if (brightness > bloomThreshold) {
                        color.rgb *= bloomStrength;
                    }
                    
                    gl_FragColor = color;
                }
            `
        };
        
        this.passes.bloom = this.createShaderPass(bloomShader);
        this.composer.addPass(this.passes.bloom);
    }
    
    createVignettePass() {
        if (!this.effects.vignette) return;
        
        const vignetteShader = {
            uniforms: {
                tDiffuse: { value: null },
                offset: { value: 0.95 },
                darkness: { value: 0.3 }
            },
            
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float offset;
                uniform float darkness;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
                    color.rgb = mix(color.rgb, vec3(1.0 - darkness), dot(uv, uv));
                    gl_FragColor = color;
                }
            `
        };
        
        this.passes.vignette = this.createShaderPass(vignetteShader);
        this.composer.addPass(this.passes.vignette);
    }
    
    createFilmGrainPass() {
        if (!this.effects.filmGrain) return;
        
        const filmGrainShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0.0 },
                nIntensity: { value: 0.1 },
                sIntensity: { value: 0.05 },
                sCount: { value: 1024.0 }
            },
            
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float nIntensity;
                uniform float sIntensity;
                uniform float sCount;
                varying vec2 vUv;
                
                float random(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Film grain noise
                    float noise = random(vUv + time) * nIntensity;
                    
                    // Scanlines
                    float scanLine = sin(vUv.y * sCount) * sIntensity;
                    
                    color.rgb += noise - scanLine;
                    gl_FragColor = color;
                }
            `
        };
        
        this.passes.filmGrain = this.createShaderPass(filmGrainShader);
        this.composer.addPass(this.passes.filmGrain);
    }
    
    createChromaticAberrationPass() {
        if (!this.effects.chromaticAberration) return;
        
        const chromaticAberrationShader = {
            uniforms: {
                tDiffuse: { value: null },
                amount: { value: 0.005 }
            },
            
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float amount;
                varying vec2 vUv;
                
                void main() {
                    vec2 offset = amount * (vUv - 0.5);
                    
                    float r = texture2D(tDiffuse, vUv - offset).r;
                    float g = texture2D(tDiffuse, vUv).g;
                    float b = texture2D(tDiffuse, vUv + offset).b;
                    
                    gl_FragColor = vec4(r, g, b, 1.0);
                }
            `
        };
        
        this.passes.chromaticAberration = this.createShaderPass(chromaticAberrationShader);
        this.composer.addPass(this.passes.chromaticAberration);
    }
    
    createShaderPass(shader) {
        const material = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        const scene = new THREE.Scene();
        scene.add(mesh);
        
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        // Position the camera slightly forward so the full-screen quad isn't clipped
        camera.position.z = 1;
        
        return {
            scene,
            camera,
            material,
            needsSwap: true,
            
            render: function(renderer, writeBuffer, readBuffer) {
                material.uniforms.tDiffuse.value = readBuffer ? readBuffer.texture : null;
                
                const oldRenderTarget = renderer.getRenderTarget();
                renderer.setRenderTarget(writeBuffer);
                renderer.render(scene, camera);
                renderer.setRenderTarget(oldRenderTarget);
            },
            
            setSize: function(width, height) {
                // No-op for shader passes
            }
        };
    }
    
    render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    updateEffects(time) {
        // Update time-based effects
        if (this.passes.filmGrain && this.effects.filmGrain) {
            this.passes.filmGrain.material.uniforms.time.value = time * 0.001;
        }
    }
    
    toggleEffect(effectName, enabled) {
        if (this.effects.hasOwnProperty(effectName)) {
            this.effects[effectName] = enabled;
            this.rebuildPipeline();
        }
    }
    
    rebuildPipeline() {
        // Rebuild the post-processing pipeline based on enabled effects
        this.setupComposer();
        this.createPasses();
    }
    
    setBloomStrength(value) {
        if (this.passes.bloom) {
            this.passes.bloom.material.uniforms.bloomStrength.value = value;
        }
    }
    
    setVignetteIntensity(value) {
        if (this.passes.vignette) {
            this.passes.vignette.material.uniforms.darkness.value = value;
        }
    }
    
    setChromaticAberrationAmount(value) {
        if (this.passes.chromaticAberration) {
            this.passes.chromaticAberration.material.uniforms.amount.value = value;
        }
    }
}

// Environment Mapping System
class EnvironmentManager {
    constructor(scene) {
        this.scene = scene;
        this.envMap = null;
        this.skybox = null;
        this.environments = {
            studio: this.createStudioEnvironment(),
            sunset: this.createSunsetEnvironment(),
            night: this.createNightEnvironment(),
            cyberpunk: this.createCyberpunkEnvironment()
        };
        
        this.currentEnvironment = 'studio';
        this.applyEnvironment(this.currentEnvironment);
    }
    
    createStudioEnvironment() {
        // Create a simple studio-like environment
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        
        // Generate procedural environment map
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#cccccc');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        return {
            envMap: texture,
            background: new THREE.Color(0xf0f0f0),
            fog: null
        };
    }
    
    createSunsetEnvironment() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.5, '#f7931e');
        gradient.addColorStop(1, '#ffcd3c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        return {
            envMap: texture,
            background: new THREE.Color(0xff6b35),
            fog: new THREE.Fog(0xff6b35, 10, 50)
        };
    }
    
    createNightEnvironment() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const radius = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        return {
            envMap: texture,
            background: new THREE.Color(0x1a1a2e),
            fog: new THREE.FogExp2(0x1a1a2e, 0.02)
        };
    }
    
    createCyberpunkEnvironment() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Cyberpunk gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#ff00ff');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(1, '#ff0080');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add grid lines
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        return {
            envMap: texture,
            background: new THREE.Color(0x001122),
            fog: new THREE.FogExp2(0x001122, 0.015)
        };
    }
    
    applyEnvironment(environmentName) {
        const env = this.environments[environmentName];
        if (!env) return;
        
        this.scene.background = env.background;
        this.scene.environment = env.envMap;
        this.scene.fog = env.fog;
        
        // Apply environment map to all meshes
        this.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.envMap = env.envMap;
                        material.needsUpdate = true;
                    });
                } else {
                    child.material.envMap = env.envMap;
                    child.material.needsUpdate = true;
                }
            }
        });
        
        this.currentEnvironment = environmentName;
    }
    
    getAvailableEnvironments() {
        return Object.keys(this.environments);
    }
    
    getCurrentEnvironment() {
        return this.currentEnvironment;
    }
}

// Export classes
window.PostProcessingManager = PostProcessingManager;
window.EnvironmentManager = EnvironmentManager; 