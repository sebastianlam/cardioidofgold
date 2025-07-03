// 3D Head Application
class HeadApp {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.model = null;
        this.light = null;
        this.isLoading = true;
        this.autoRotateEnabled = true;
        this.performanceMonitor = null;
        this.postProcessing = null;
        this.environmentManager = null;
        this.particleManager = null;
        this.uiManager = null;
        this.audioSystem = null;
        this.audioTriggers = null;
        
        // Camera preset positions for different "organs"
        this.cameraPresets = {
            vision: [-0.047434535332279655, -0.1788981553339662, 1.6070452025245767],
            tunes: [-1.5859118908118746, -0.6146201839876595, 0.56562303537245],
            words: [0.4002358318768384, -0.8014289061473174, 2.2678613534906424],
            ambience: [0.080312546657849, -0.47493251433984374, 1.378197649116327],
            defaulting: [0, 0, 5]
        };
        
        // Don't call init() in constructor - will be called async
    }
    
    static async create() {
        const app = new HeadApp();
        await app.init();
        return app;
    }
    
    async init() {
        this.createRenderer();
        this.createScene();
        this.createCamera();
        this.createLights();
        this.createControls();
        await this.setupAdvancedSystems();
        this.setupEventListeners();
        this.setupPerformanceMonitoring();
        this.loadModel();
        this.animate();
        this.showLoadingIndicator();
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        document.body.appendChild(this.renderer.domElement);
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(0, 0, 5);
    }
    
    createLights() {
        // Hemisphere light for ambient lighting
        this.light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(this.light);
        
        // Directional light for shadows and definition
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);
    }
    
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = (Math.PI + 0.7) / 2;
        this.controls.minPolarAngle = (Math.PI - 0.7) / 2;
        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.maxDistance = 10;
        this.controls.minDistance = 1;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Keyboard controls
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Button events
        document.getElementById('vision-btn')?.addEventListener('click', () => this.switchView('vision'));
        document.getElementById('tunes-btn')?.addEventListener('click', () => this.switchView('tunes'));
        document.getElementById('words-btn')?.addEventListener('click', () => this.switchView('words'));
        document.getElementById('ambience-btn')?.addEventListener('click', () => this.switchView('ambience'));
        document.getElementById('toggle-btn')?.addEventListener('click', () => this.toggleAutoRotate());
    }
    
    loadModel() {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            'faceSculpting.glb',
            (gltf) => this.onModelLoaded(gltf),
            (progress) => this.onLoadProgress(progress),
            (error) => this.onLoadError(error)
        );
    }
    
    onModelLoaded(gltf) {
        this.model = gltf;
        this.scene.add(this.model.scene);
        
        // Position the model
        this.model.scene.position.set(0, -1.2, 0);
        
        // Enable shadows
        this.model.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        this.isLoading = false;
        this.hideLoadingIndicator();
        console.log('Model loaded successfully');
    }
    
    onLoadProgress(progress) {
        if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            this.updateLoadingProgress(percentComplete);
        }
    }
    
    onLoadError(error) {
        console.error('Error loading model:', error);
        this.showError('Failed to load 3D model. Please check your connection and try again.');
        this.isLoading = false;
    }
    
    switchView(presetName) {
        if (!this.cameraPresets[presetName]) {
            console.warn(`Unknown camera preset: ${presetName}`);
            return;
        }
        
        const targetPosition = this.cameraPresets[presetName];
        
        // Disable auto-rotate during transition
        if (this.controls.autoRotate) {
            this.toggleAutoRotate();
        }
        
        this.animateCameraTo(targetPosition);
    }
    
    animateCameraTo(targetPosition) {
        // Store current state
        const startPosition = this.camera.position.clone();
        
        // Disable controls during animation
        this.controls.dispose();
        this.controls = null;
        
        // Create smooth camera transition
        new TWEEN.Tween(this.camera.position)
            .to({
                x: targetPosition[0],
                y: targetPosition[1],
                z: targetPosition[2]
            }, 2000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate(() => {
                this.camera.lookAt(0, 0, 0);
            })
            .onComplete(() => {
                // Recreate controls
                this.createControls();
                this.controls.target.set(0, 0, 0);
                this.camera.updateProjectionMatrix();
            })
            .start();
    }
    
    toggleAutoRotate() {
        this.autoRotateEnabled = !this.autoRotateEnabled;
        if (this.controls) {
            this.controls.autoRotate = this.autoRotateEnabled;
        }
        
        // Update button state
        const button = document.getElementById('toggle-btn');
        if (button) {
            button.textContent = this.autoRotateEnabled ? 'Stop Rotation' : 'Start Rotation';
            button.classList.toggle('active', this.autoRotateEnabled);
        }
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.toggleAutoRotate();
                break;
            case 'KeyD':
                event.preventDefault();
                this.switchView('defaulting');
                break;
            case 'KeyV':
                event.preventDefault();
                this.switchView('vision');
                break;
            case 'KeyT':
                event.preventDefault();
                this.switchView('tunes');
                break;
            case 'KeyW':
                event.preventDefault();
                this.switchView('words');
                break;
            case 'KeyA':
                event.preventDefault();
                this.switchView('ambience');
                break;
        }
    }
    
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // Update post-processing
        if (this.postProcessing) {
            this.postProcessing.resize(width, height);
        }
    }
    
    async setupAdvancedSystems() {
        // Initialize post-processing
        if (window.PostProcessingManager) {
            this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);
            await this.postProcessing.init();
        }
        
        // Initialize environment manager
        if (window.EnvironmentManager) {
            this.environmentManager = new EnvironmentManager(this.scene);
        }
        
        // Initialize particle systems
        if (window.ParticleSystemManager) {
            this.particleManager = new ParticleSystemManager(this.scene);
        }
        
        // Initialize advanced UI
        if (window.AdvancedUIManager) {
            this.uiManager = new AdvancedUIManager(this);
            // Load saved settings
            setTimeout(() => {
                this.uiManager.loadSettings();
            }, 100);
        }
        
        // Initialize audio system
        if (window.AudioSystemManager) {
            this.audioSystem = new AudioSystemManager(this.scene, this.camera);
            this.setupAudioTriggers();
        }
    }

    setupAudioTriggers() {
        if (!window.AudioTriggerManager || !this.audioSystem) return;
        
        this.audioTriggers = new AudioTriggerManager(this.audioSystem, this.scene);
        
        // Add audio triggers around the head for different experiences
        this.audioTriggers.addTrigger(
            new THREE.Vector3(-2, 1, 0), // Left ear area
            { frequency: 220, type: 'sine', duration: 3000 }
        );
        
        this.audioTriggers.addTrigger(
            new THREE.Vector3(2, 1, 0), // Right ear area  
            { frequency: 330, type: 'triangle', duration: 3000 }
        );
        
        this.audioTriggers.addTrigger(
            new THREE.Vector3(0, 2, 1), // Forehead area
            { frequency: 440, type: 'sawtooth', duration: 2000 }
        );
        
        this.audioTriggers.addTrigger(
            new THREE.Vector3(0, -1, 2), // Below chin
            { frequency: 165, type: 'sine', duration: 4000 }
        );
    }

    setupPerformanceMonitoring() {
        if (window.PerformanceMonitor) {
            this.performanceMonitor = new window.PerformanceMonitor();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = performance.now();
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update TWEEN animations
        TWEEN.update();
        
        // Update particle systems
        if (this.particleManager) {
            this.particleManager.update(time);
        }
        
        // Update post-processing effects
        if (this.postProcessing) {
            this.postProcessing.updateEffects(time);
        }
        
        // Update audio triggers
        if (this.audioTriggers) {
            this.audioTriggers.update(this.camera.position, 16); // ~60fps
        }
        
        // Update performance monitoring
        if (this.performanceMonitor) {
            this.performanceMonitor.update(this.renderer, this.scene);
        }
        
        // Render the scene (with or without post-processing)
        if (this.postProcessing && this.postProcessing.composer) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    showLoadingIndicator() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    hideLoadingIndicator() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    updateLoadingProgress(percent) {
        const progressBar = document.getElementById('loading-progress');
        const progressText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Loading... ${Math.round(percent)}%`;
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Check WebGL support
    if (!window.WebGLRenderingContext) {
        alert('WebGL is not supported by your browser. Please update your browser or enable WebGL.');
        return;
    }
    
    // Initialize the app
    try {
        window.headApp = await HeadApp.create();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('app-start');
} 