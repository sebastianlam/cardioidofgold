// Advanced Audio System
class AudioSystemManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.listener = null;
        this.ambientSounds = {};
        this.audioLoader = null;
        this.isEnabled = true;
        this.masterVolume = 0.5;
        this.currentAmbience = 'contemplative';
        
        this.init();
    }
    
    init() {
        if (!this.checkAudioSupport()) {
            console.warn('Web Audio API not supported');
            return;
        }
        
        this.setupAudioListener();
        this.createAmbientSounds();
        this.setupAudioContext();
    }
    
    checkAudioSupport() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    setupAudioListener() {
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        
        this.audioLoader = new THREE.AudioLoader();
    }
    
    setupAudioContext() {
        // Resume audio context on user interaction (required by browsers)
        const resumeAudio = () => {
            if (this.listener && this.listener.context.state === 'suspended') {
                this.listener.context.resume();
            }
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
            document.removeEventListener('touchstart', resumeAudio);
        };
        
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
    }
    
    createAmbientSounds() {
        // Create procedural ambient soundscapes
        this.createContemplativeAmbience();
        this.createSpaceAmbience();
        this.createMysticalAmbience();
        this.createUrbanAmbience();
    }
    
    createContemplativeAmbience() {
        if (!this.listener) return;
        
        // Create a contemplative drone using oscillators
        const context = this.listener.context;
        
        // Base drone
        const baseDrone = context.createOscillator();
        baseDrone.type = 'sine';
        baseDrone.frequency.setValueAtTime(55, context.currentTime); // A1
        
        const baseGain = context.createGain();
        baseGain.gain.setValueAtTime(0.1, context.currentTime);
        
        // Harmonic layer
        const harmonic = context.createOscillator();
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(110, context.currentTime); // A2
        
        const harmonicGain = context.createGain();
        harmonicGain.gain.setValueAtTime(0.05, context.currentTime);
        
        // Filter for warmth
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, context.currentTime);
        filter.Q.setValueAtTime(0.5, context.currentTime);
        
        // Reverb simulation with delay
        const delay = context.createDelay(2.0);
        delay.delayTime.setValueAtTime(0.3, context.currentTime);
        
        const delayGain = context.createGain();
        delayGain.gain.setValueAtTime(0.2, context.currentTime);
        
        const feedback = context.createGain();
        feedback.gain.setValueAtTime(0.4, context.currentTime);
        
        // Connect the audio graph
        baseDrone.connect(baseGain);
        harmonic.connect(harmonicGain);
        
        baseGain.connect(filter);
        harmonicGain.connect(filter);
        
        filter.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(feedback);
        feedback.connect(delay);
        
        filter.connect(context.destination);
        delayGain.connect(context.destination);
        
        this.ambientSounds.contemplative = {
            nodes: [baseDrone, harmonic],
            gains: [baseGain, harmonicGain],
            effects: [filter, delay, delayGain, feedback],
            start: () => {
                baseDrone.start();
                harmonic.start();
            },
            stop: () => {
                baseDrone.stop();
                harmonic.stop();
            }
        };
    }
    
    createSpaceAmbience() {
        if (!this.listener) return;
        
        const context = this.listener.context;
        
        // Space-like ambience with filtered noise
        const bufferSize = context.sampleRate * 2; // 2 seconds
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate filtered noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const noise = context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const noiseFilter = context.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(200, context.currentTime);
        noiseFilter.Q.setValueAtTime(0.3, context.currentTime);
        
        const noiseGain = context.createGain();
        noiseGain.gain.setValueAtTime(0.03, context.currentTime);
        
        // Add subtle oscillation
        const lfo = context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, context.currentTime);
        
        const lfoGain = context.createGain();
        lfoGain.gain.setValueAtTime(50, context.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(noiseFilter.frequency);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(context.destination);
        
        this.ambientSounds.space = {
            nodes: [noise, lfo],
            gains: [noiseGain, lfoGain],
            effects: [noiseFilter],
            start: () => {
                noise.start();
                lfo.start();
            },
            stop: () => {
                noise.stop();
                lfo.stop();
            }
        };
    }
    
    createMysticalAmbience() {
        if (!this.listener) return;
        
        const context = this.listener.context;
        
        // Mystical bells and drones
        const bell1 = context.createOscillator();
        bell1.type = 'sine';
        bell1.frequency.setValueAtTime(523.25, context.currentTime); // C5
        
        const bell2 = context.createOscillator();
        bell2.type = 'sine';
        bell2.frequency.setValueAtTime(659.25, context.currentTime); // E5
        
        const bellGain1 = context.createGain();
        bellGain1.gain.setValueAtTime(0, context.currentTime);
        
        const bellGain2 = context.createGain();
        bellGain2.gain.setValueAtTime(0, context.currentTime);
        
        // Create bell envelope
        const bellTrigger = () => {
            const now = context.currentTime;
            bellGain1.gain.cancelScheduledValues(now);
            bellGain2.gain.cancelScheduledValues(now);
            
            bellGain1.gain.setValueAtTime(0, now);
            bellGain1.gain.linearRampToValueAtTime(0.02, now + 0.1);
            bellGain1.gain.exponentialRampToValueAtTime(0.001, now + 3);
            
            bellGain2.gain.setValueAtTime(0, now);
            bellGain2.gain.linearRampToValueAtTime(0.015, now + 0.1);
            bellGain2.gain.exponentialRampToValueAtTime(0.001, now + 3);
        };
        
        // Random bell triggers
        const bellInterval = setInterval(bellTrigger, 8000 + Math.random() * 12000);
        
        bell1.connect(bellGain1);
        bell2.connect(bellGain2);
        bellGain1.connect(context.destination);
        bellGain2.connect(context.destination);
        
        this.ambientSounds.mystical = {
            nodes: [bell1, bell2],
            gains: [bellGain1, bellGain2],
            intervals: [bellInterval],
            start: () => {
                bell1.start();
                bell2.start();
            },
            stop: () => {
                bell1.stop();
                bell2.stop();
                clearInterval(bellInterval);
            }
        };
    }
    
    createUrbanAmbience() {
        if (!this.listener) return;
        
        const context = this.listener.context;
        
        // Urban-like distant rumble
        const rumble = context.createOscillator();
        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(40, context.currentTime);
        
        const rumbleGain = context.createGain();
        rumbleGain.gain.setValueAtTime(0.02, context.currentTime);
        
        const rumbleFilter = context.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(120, context.currentTime);
        rumbleFilter.Q.setValueAtTime(0.7, context.currentTime);
        
        // Add subtle modulation
        const modulator = context.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(0.05, context.currentTime);
        
        const modGain = context.createGain();
        modGain.gain.setValueAtTime(10, context.currentTime);
        
        modulator.connect(modGain);
        modGain.connect(rumbleFilter.frequency);
        
        rumble.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(context.destination);
        
        this.ambientSounds.urban = {
            nodes: [rumble, modulator],
            gains: [rumbleGain, modGain],
            effects: [rumbleFilter],
            start: () => {
                rumble.start();
                modulator.start();
            },
            stop: () => {
                rumble.stop();
                modulator.stop();
            }
        };
    }
    
    createPositionalSound(position, frequency = 440, type = 'sine') {
        if (!this.listener) return null;
        
        const sound = new THREE.PositionalAudio(this.listener);
        
        const context = this.listener.context;
        const oscillator = context.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.1, context.currentTime);
        
        oscillator.connect(gain);
        sound.setNodeSource(gain);
        
        // Create a mesh to hold the positional audio
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.3 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.add(sound);
        
        sound.setRefDistance(1);
        sound.setRolloffFactor(2);
        sound.setDistanceModel('exponential');
        
        oscillator.start();
        
        return {
            mesh,
            sound,
            oscillator,
            gain,
            dispose: () => {
                oscillator.stop();
                mesh.remove(sound);
                this.scene.remove(mesh);
            }
        };
    }
    
    setAmbience(ambienceName) {
        // Stop current ambience
        if (this.ambientSounds[this.currentAmbience]) {
            this.stopAmbience(this.currentAmbience);
        }
        
        // Start new ambience
        if (this.ambientSounds[ambienceName]) {
            this.currentAmbience = ambienceName;
            this.startAmbience(ambienceName);
        }
    }
    
    startAmbience(name) {
        const ambience = this.ambientSounds[name];
        if (ambience && ambience.start) {
            try {
                ambience.start();
            } catch (error) {
                console.warn(`Could not start ambience ${name}:`, error);
            }
        }
    }
    
    stopAmbience(name) {
        const ambience = this.ambientSounds[name];
        if (ambience && ambience.stop) {
            try {
                ambience.stop();
            } catch (error) {
                console.warn(`Could not stop ambience ${name}:`, error);
            }
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update all gain nodes
        Object.values(this.ambientSounds).forEach(ambience => {
            if (ambience.gains) {
                ambience.gains.forEach(gain => {
                    if (gain.gain) {
                        const currentValue = gain.gain.value;
                        gain.gain.setValueAtTime(currentValue * this.masterVolume, 
                                               this.listener.context.currentTime);
                    }
                });
            }
        });
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.startAmbience(this.currentAmbience);
        } else {
            this.stopAmbience(this.currentAmbience);
        }
    }
    
    getAvailableAmbiences() {
        return Object.keys(this.ambientSounds);
    }
    
    getCurrentAmbience() {
        return this.currentAmbience;
    }
    
    dispose() {
        // Stop all sounds
        Object.keys(this.ambientSounds).forEach(name => {
            this.stopAmbience(name);
        });
        
        // Clear intervals
        Object.values(this.ambientSounds).forEach(ambience => {
            if (ambience.intervals) {
                ambience.intervals.forEach(interval => clearInterval(interval));
            }
        });
        
        this.ambientSounds = {};
        
        if (this.listener) {
            this.camera.remove(this.listener);
            this.listener = null;
        }
    }
}

// Interactive Audio Triggers
class AudioTriggerManager {
    constructor(audioSystem, scene) {
        this.audioSystem = audioSystem;
        this.scene = scene;
        this.triggers = [];
        this.activeSounds = [];
    }
    
    addTrigger(position, soundConfig) {
        const trigger = {
            position: position.clone(),
            config: soundConfig,
            isActive: false,
            cooldown: 0
        };
        
        // Create visual indicator
        const geometry = new THREE.RingGeometry(0.5, 0.7, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.x = -Math.PI / 2;
        
        trigger.mesh = mesh;
        this.scene.add(mesh);
        this.triggers.push(trigger);
        
        return trigger;
    }
    
    update(cameraPosition, deltaTime) {
        this.triggers.forEach(trigger => {
            if (trigger.cooldown > 0) {
                trigger.cooldown -= deltaTime;
            }
            
            const distance = cameraPosition.distanceTo(trigger.position);
            const shouldBeActive = distance < 2.0 && trigger.cooldown <= 0;
            
            if (shouldBeActive && !trigger.isActive) {
                this.triggerSound(trigger);
                trigger.isActive = true;
                trigger.cooldown = 3000; // 3 second cooldown
            } else if (!shouldBeActive && trigger.isActive) {
                trigger.isActive = false;
            }
            
            // Update visual
            if (trigger.mesh) {
                trigger.mesh.material.opacity = shouldBeActive ? 0.8 : 0.3;
                trigger.mesh.rotation.z += deltaTime * 0.001;
            }
        });
        
        // Clean up finished sounds
        this.activeSounds = this.activeSounds.filter(sound => {
            if (sound.finished) {
                sound.dispose();
                return false;
            }
            return true;
        });
    }
    
    triggerSound(trigger) {
        const sound = this.audioSystem.createPositionalSound(
            trigger.position,
            trigger.config.frequency || 440,
            trigger.config.type || 'sine'
        );
        
        if (sound) {
            this.scene.add(sound.mesh);
            this.activeSounds.push(sound);
            
            // Auto-dispose after duration
            setTimeout(() => {
                sound.finished = true;
            }, trigger.config.duration || 2000);
        }
    }
    
    dispose() {
        this.triggers.forEach(trigger => {
            if (trigger.mesh) {
                this.scene.remove(trigger.mesh);
            }
        });
        
        this.activeSounds.forEach(sound => sound.dispose());
        
        this.triggers = [];
        this.activeSounds = [];
    }
}

// Export classes
window.AudioSystemManager = AudioSystemManager;
window.AudioTriggerManager = AudioTriggerManager; 