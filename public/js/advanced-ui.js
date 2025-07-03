// Advanced UI System
class AdvancedUIManager {
    constructor(app) {
        this.app = app;
        this.isSettingsOpen = false;
        this.themes = {
            dark: {
                name: 'Dark',
                background: '#000000',
                primary: '#ffffff',
                secondary: '#888888',
                accent: '#00ffff'
            },
            light: {
                name: 'Light', 
                background: '#f0f0f0',
                primary: '#000000',
                secondary: '#666666',
                accent: '#0066ff'
            },
            neon: {
                name: 'Neon',
                background: '#0a0a0a',
                primary: '#00ff00',
                secondary: '#ff00ff',
                accent: '#ffff00'
            },
            sunset: {
                name: 'Sunset',
                background: '#1a1a2e',
                primary: '#ff6b35',
                secondary: '#f7931e',
                accent: '#ffcd3c'
            }
        };
        this.currentTheme = 'dark';
        this.settings = {
            renderQuality: 'high',
            particleIntensity: 0.8,
            environmentLighting: 'studio',
            autoRotateSpeed: 1.0,
            postProcessing: true,
            weather: 'clear'
        };
        
        this.init();
    }
    
    init() {
        this.createSettingsPanel();
        this.createMiniMap();
        this.createQuickActions();
        this.createNotificationSystem();
        this.setupThemeSystem();
        this.bindEvents();
    }
    
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h3>Advanced Settings</h3>
                <button id="close-settings" class="close-btn">&times;</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <label>Render Quality</label>
                    <select id="render-quality">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high" selected>High</option>
                        <option value="ultra">Ultra</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>Theme</label>
                    <div class="theme-selector">
                        <div class="theme-option active" data-theme="dark">
                            <div class="theme-preview dark-theme"></div>
                            <span>Dark</span>
                        </div>
                        <div class="theme-option" data-theme="light">
                            <div class="theme-preview light-theme"></div>
                            <span>Light</span>
                        </div>
                        <div class="theme-option" data-theme="neon">
                            <div class="theme-preview neon-theme"></div>
                            <span>Neon</span>
                        </div>
                        <div class="theme-option" data-theme="sunset">
                            <div class="theme-preview sunset-theme"></div>
                            <span>Sunset</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-group">
                    <label>Environment</label>
                    <select id="environment-select">
                        <option value="studio" selected>Studio</option>
                        <option value="sunset">Sunset</option>
                        <option value="night">Night</option>
                        <option value="cyberpunk">Cyberpunk</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>Particle Intensity: <span id="particle-value">80%</span></label>
                    <input type="range" id="particle-intensity" min="0" max="100" value="80">
                </div>
                
                <div class="setting-group">
                    <label>Auto-Rotation Speed: <span id="rotation-value">1.0x</span></label>
                    <input type="range" id="rotation-speed" min="0" max="3" step="0.1" value="1.0">
                </div>
                
                <div class="setting-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="post-processing" checked>
                        <span class="checkmark"></span>
                        Post-Processing Effects
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="performance-stats">
                        <span class="checkmark"></span>
                        Performance Statistics
                    </label>
                </div>
                
                <div class="settings-actions">
                    <button id="reset-settings" class="btn secondary">Reset to Defaults</button>
                    <button id="save-settings" class="btn primary">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.settingsPanel = panel;
    }
    
    createMiniMap() {
        const miniMap = document.createElement('div');
        miniMap.id = 'mini-map';
        miniMap.className = 'mini-map';
        miniMap.innerHTML = `
            <div class="mini-map-header">
                <span>Camera Views</span>
                <button id="toggle-minimap" class="btn-icon">📍</button>
            </div>
            <div class="mini-map-content">
                <div class="camera-preset" data-preset="defaulting">
                    <div class="preset-icon">🎯</div>
                    <span>Default</span>
                </div>
                <div class="camera-preset" data-preset="vision">
                    <div class="preset-icon">👁️</div>
                    <span>Vision</span>
                </div>
                <div class="camera-preset" data-preset="tunes">
                    <div class="preset-icon">🎵</div>
                    <span>Tunes</span>
                </div>
                <div class="camera-preset" data-preset="words">
                    <div class="preset-icon">💬</div>
                    <span>Words</span>
                </div>
                <div class="camera-preset" data-preset="ambience">
                    <div class="preset-icon">🌟</div>
                    <span>Ambience</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(miniMap);
        this.miniMap = miniMap;
    }
    
    createQuickActions() {
        const quickActions = document.createElement('div');
        quickActions.id = 'quick-actions';
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = `
            <button id="settings-btn" class="quick-action-btn" title="Settings">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
            </button>
            <button id="screenshot-btn" class="quick-action-btn" title="Screenshot">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM17 9h-3.5l-1-1h-3l-1 1H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2z"/>
                </svg>
            </button>
            <button id="fullscreen-btn" class="quick-action-btn" title="Fullscreen">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            </button>
            <button id="help-btn" class="quick-action-btn" title="Help">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
            </button>
        `;
        
        document.body.appendChild(quickActions);
        this.quickActions = quickActions;
    }
    
    createNotificationSystem() {
        const notifications = document.createElement('div');
        notifications.id = 'notifications';
        notifications.className = 'notifications';
        document.body.appendChild(notifications);
        this.notifications = notifications;
    }
    
    setupThemeSystem() {
        // Add theme styles to document
        if (!document.getElementById('theme-styles')) {
            const themeStyles = document.createElement('style');
            themeStyles.id = 'theme-styles';
            themeStyles.textContent = this.generateThemeCSS();
            document.head.appendChild(themeStyles);
        }
    }
    
    generateThemeCSS() {
        return `
            /* Settings Panel Styles */
            .settings-panel {
                position: fixed;
                top: 50%;
                right: -400px;
                transform: translateY(-50%);
                width: 380px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                backdrop-filter: blur(20px);
                transition: right 0.3s ease;
                z-index: 1000;
                overflow: hidden;
            }
            
            .settings-panel.open {
                right: 20px;
            }
            
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .settings-header h3 {
                margin: 0;
                font-size: 1.2rem;
                font-weight: 600;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .settings-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }
            
            .setting-group {
                margin-bottom: 20px;
            }
            
            .setting-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .setting-group select,
            .setting-group input[type="range"] {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                font-size: 0.9rem;
            }
            
            .setting-group select option {
                background: #000000;
                color: #ffffff;
            }
            
            /* Theme Selector */
            .theme-selector {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .theme-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .theme-option:hover {
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .theme-option.active {
                border-color: #00ffff;
            }
            
            .theme-preview {
                width: 40px;
                height: 30px;
                border-radius: 4px;
                margin-bottom: 5px;
            }
            
            .dark-theme { background: linear-gradient(45deg, #000, #333); }
            .light-theme { background: linear-gradient(45deg, #fff, #ccc); }
            .neon-theme { background: linear-gradient(45deg, #0a0a0a, #00ff00); }
            .sunset-theme { background: linear-gradient(45deg, #ff6b35, #ffcd3c); }
            
            /* Checkbox Styles */
            .checkbox-label {
                display: flex !important;
                align-items: center;
                cursor: pointer;
                user-select: none;
            }
            
            .checkbox-label input[type="checkbox"] {
                display: none;
            }
            
            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                margin-right: 10px;
                position: relative;
                transition: all 0.2s;
            }
            
            .checkbox-label input:checked + .checkmark {
                background: #00ffff;
                border-color: #00ffff;
            }
            
            .checkbox-label input:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #000;
                font-weight: bold;
            }
            
            /* Mini Map */
            .mini-map {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 200px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                backdrop-filter: blur(10px);
                z-index: 999;
            }
            
            .mini-map-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .mini-map-content {
                padding: 10px;
            }
            
            .camera-preset {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                margin-bottom: 5px;
            }
            
            .camera-preset:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .camera-preset.active {
                background: rgba(0, 255, 255, 0.2);
            }
            
            .preset-icon {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            
            /* Quick Actions */
            .quick-actions {
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 998;
            }
            
            .quick-action-btn {
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.8);
                color: #ffffff;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .quick-action-btn:hover {
                background: rgba(0, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            /* Notifications */
            .notifications {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1001;
                pointer-events: none;
            }
            
            .notification {
                background: rgba(0, 0, 0, 0.9);
                color: #ffffff;
                padding: 12px 20px;
                border-radius: 8px;
                margin-bottom: 10px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: slideDown 0.3s ease;
                pointer-events: auto;
            }
            
            .notification.success {
                border-color: #4ade80;
            }
            
            .notification.warning {
                border-color: #fbbf24;
            }
            
            .notification.error {
                border-color: #ef4444;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* Range Input Styling */
            input[type="range"] {
                -webkit-appearance: none;
                appearance: none;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                outline: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                background: #00ffff;
                border-radius: 50%;
                cursor: pointer;
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: #00ffff;
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }
            
            /* Settings Actions */
            .settings-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .settings-actions .btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .settings-actions .btn.primary {
                background: #00ffff;
                color: #000;
            }
            
            .settings-actions .btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .settings-actions .btn:hover {
                transform: translateY(-2px);
            }
        `;
    }
    
    bindEvents() {
        // Settings panel toggle
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.switchTheme(theme);
            });
        });
        
        // Settings controls
        document.getElementById('particle-intensity').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('particle-value').textContent = value + '%';
            this.settings.particleIntensity = value / 100;
            this.applyParticleSettings();
        });
        
        document.getElementById('rotation-speed').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('rotation-value').textContent = value + 'x';
            this.settings.autoRotateSpeed = parseFloat(value);
            this.applyRotationSettings();
        });
        
        // Environment selection
        document.getElementById('environment-select').addEventListener('change', (e) => {
            this.settings.environmentLighting = e.target.value;
            this.applyEnvironmentSettings();
        });
        
        // Camera presets
        document.querySelectorAll('.camera-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const presetName = e.currentTarget.dataset.preset;
                this.app.switchView(presetName);
                this.updateActiveCameraPreset(presetName);
            });
        });
        
        // Screenshot
        document.getElementById('screenshot-btn').addEventListener('click', () => {
            this.takeScreenshot();
        });
        
        // Fullscreen
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Save/Reset settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });
    }
    
    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
        this.settingsPanel.classList.toggle('open', this.isSettingsOpen);
    }
    
    closeSettings() {
        this.isSettingsOpen = false;
        this.settingsPanel.classList.remove('open');
    }
    
    switchTheme(themeName) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.showNotification(`Switched to ${this.themes[themeName].name} theme`, 'success');
    }
    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        document.documentElement.style.setProperty('--theme-background', theme.background);
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
        document.documentElement.style.setProperty('--theme-accent', theme.accent);
        
        // Apply to scene background
        if (this.app.scene) {
            this.app.scene.background = new THREE.Color(theme.background);
        }
    }
    
    applyParticleSettings() {
        if (this.app.particleManager) {
            const systems = this.app.particleManager.getAvailableSystems();
            systems.forEach(system => {
                this.app.particleManager.setIntensity(system, this.settings.particleIntensity);
            });
        }
    }
    
    applyRotationSettings() {
        if (this.app.controls) {
            this.app.controls.autoRotateSpeed = this.settings.autoRotateSpeed;
        }
    }
    
    applyEnvironmentSettings() {
        if (this.app.environmentManager) {
            this.app.environmentManager.applyEnvironment(this.settings.environmentLighting);
        }
    }
    
    updateActiveCameraPreset(presetName) {
        document.querySelectorAll('.camera-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        document.querySelector(`[data-preset="${presetName}"]`)?.classList.add('active');
    }
    
    takeScreenshot() {
        if (this.app.renderer) {
            this.app.renderer.render(this.app.scene, this.app.camera);
            
            const canvas = this.app.renderer.domElement;
            const link = document.createElement('a');
            link.download = `contemplative-head-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            this.showNotification('Screenshot saved!', 'success');
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.showNotification('Entered fullscreen mode', 'success');
        } else {
            document.exitFullscreen();
            this.showNotification('Exited fullscreen mode', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveSettings() {
        localStorage.setItem('contemplative-head-settings', JSON.stringify(this.settings));
        localStorage.setItem('contemplative-head-theme', this.currentTheme);
        this.showNotification('Settings saved!', 'success');
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('contemplative-head-settings');
        const savedTheme = localStorage.getItem('contemplative-head-theme');
        
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.switchTheme(savedTheme);
        }
        
        this.updateUIFromSettings();
    }
    
    resetSettings() {
        this.settings = {
            renderQuality: 'high',
            particleIntensity: 0.8,
            environmentLighting: 'studio',
            autoRotateSpeed: 1.0,
            postProcessing: true,
            weather: 'clear'
        };
        
        this.updateUIFromSettings();
        this.applyAllSettings();
        this.showNotification('Settings reset to defaults', 'success');
    }
    
    updateUIFromSettings() {
        document.getElementById('particle-intensity').value = this.settings.particleIntensity * 100;
        document.getElementById('particle-value').textContent = Math.round(this.settings.particleIntensity * 100) + '%';
        document.getElementById('rotation-speed').value = this.settings.autoRotateSpeed;
        document.getElementById('rotation-value').textContent = this.settings.autoRotateSpeed + 'x';
        document.getElementById('environment-select').value = this.settings.environmentLighting;
        document.getElementById('render-quality').value = this.settings.renderQuality;
        document.getElementById('post-processing').checked = this.settings.postProcessing;
    }
    
    applyAllSettings() {
        this.applyParticleSettings();
        this.applyRotationSettings();
        this.applyEnvironmentSettings();
    }
}

// Export class
window.AdvancedUIManager = AdvancedUIManager; 