# The Contemplative Head - Interactive 3D Experience

An immersive 3D web application featuring an interactive head sculpture with dynamic camera controls and atmospheric lighting.

## 🎮 Features

- **Interactive 3D Model**: High-quality GLTF head sculpture (14MB) with realistic materials
- **Dynamic Camera Views**: Multiple preset viewpoints representing different "perspectives"
  - **Vision**: Visual focus perspective
  - **Tunes**: Auditory/musical perspective  
  - **Words**: Linguistic/communication perspective
  - **Ambience**: Environmental/atmospheric perspective
- **Smooth Animations**: TWEEN.js powered camera transitions
- **Orbit Controls**: Mouse/touch controls for exploration
- **Auto-rotation**: Optional automatic rotation with configurable speed
- **Modern UI**: Responsive design with glass-morphism effects
- **Performance Monitoring**: Real-time FPS, memory, and triangle count (dev mode)
- **Error Handling**: Graceful loading states and error recovery
- **Accessibility**: Keyboard shortcuts and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js (any recent version)
- Modern web browser with WebGL support

### Installation & Setup

```bash
# Clone or download the project
cd cardioidofgold

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will automatically open in your browser at `http://localhost:8082` (or next available port).

## 🎯 Usage

### Mouse/Touch Controls
- **Left Click + Drag**: Rotate around the model
- **Mouse Wheel**: Zoom in/out
- **Right Click + Drag**: Pan (disabled by default)

### Keyboard Shortcuts
- **V**: Switch to Vision perspective
- **T**: Switch to Tunes perspective  
- **W**: Switch to Words perspective
- **A**: Switch to Ambience perspective
- **D**: Return to default view
- **Space**: Toggle auto-rotation
- **Ctrl+P**: Toggle performance stats (dev mode)

### UI Controls
- **Perspective Buttons**: Click any button to switch camera views
- **Stop/Start Rotation**: Toggle the auto-rotation feature

## 🛠️ Development

### Project Structure
```
cardioidofgold/
├── public/
│   ├── css/
│   │   └── styles.css          # Modern CSS with responsive design
│   ├── js/
│   │   ├── app.js              # Main application class
│   │   ├── performance.js      # Performance monitoring utility
│   │   ├── three.min.js        # Three.js library
│   │   ├── GLTFLoader.js       # GLTF model loader
│   │   ├── OrbitControls.js    # Camera controls
│   │   └── tween.umd.js        # Animation library
│   ├── faceSculpting.glb       # 3D head model (14MB)
│   ├── favicon.ico
│   └── index.html              # Main HTML file
├── package.json
├── yarn.lock
└── README.md
```

### Available Scripts

```bash
npm run dev          # Start development server with live reload
npm run start        # Start production server on port 8080
npm run serve:prod   # Start production server with CORS enabled
npm run build        # Build info (static site)
npm run clean        # Clean build artifacts
```

### Code Architecture

The application uses a modern class-based architecture:

#### `HeadApp` Class
- **Modular Design**: Separated concerns for renderer, scene, camera, lights, controls
- **Error Handling**: Comprehensive error recovery and user feedback
- **Performance**: Optimized rendering with proper cleanup
- **Extensibility**: Easy to add new camera presets or features

#### Key Methods
- `createRenderer()`: WebGL renderer with shadows and tone mapping
- `createLights()`: Three-point lighting setup (key, fill, ambient)
- `loadModel()`: GLTF model loading with progress tracking
- `switchView()`: Smooth camera transitions between presets
- `onWindowResize()`: Responsive viewport handling

### Performance Features

- **Automatic Quality Adjustment**: Adaptive rendering based on device capabilities
- **Memory Management**: Proper disposal of WebGL resources
- **Frame Rate Monitoring**: Real-time performance statistics
- **Optimized Lighting**: Efficient shadow mapping and light setup
- **Model Optimization**: LOD-ready for future enhancements

## �� Customization

### Adding New Camera Presets

Edit the `cameraPresets` object in `js/app.js`:

```javascript
this.cameraPresets = {
    myNewView: [x, y, z],  // Your camera position
    // ... existing presets
};
```

### Modifying Lighting

Adjust lighting in the `createLights()` method:

```javascript
// Change ambient light intensity
this.light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);

// Modify directional light position
directionalLight.position.set(10, 10, 5);
```

### Styling

Customize appearance in `css/styles.css`:
- Button styles in `.btn` class
- Color scheme via CSS custom properties
- Responsive breakpoints in media queries

## 🌐 Browser Support

- **Chrome/Edge**: Full support with optimal performance
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Mobile**: Responsive design with touch controls

**Requirements**: WebGL-enabled browser, ES6+ support

## 📊 Performance

- **Target**: 60 FPS on modern devices
- **Memory**: ~30-50MB typical usage
- **Model**: 14MB 3D asset with efficient compression
- **Lighting**: Real-time shadows on high-end devices

## 🔧 Troubleshooting

### Common Issues

**Model won't load**
- Check network connection
- Verify `faceSculpting.glb` exists in `/public/`
- Check browser console for specific errors

**Poor performance**
- Enable performance stats (Ctrl+P in dev mode)
- Reduce shadow quality in browser settings
- Close other browser tabs

**Controls not working**
- Ensure JavaScript is enabled
- Check for console errors
- Try refreshing the page

### Development Mode Features

When running on `localhost`:
- Performance monitoring automatically enabled
- Detailed error logging
- Additional keyboard shortcuts
- Real-time statistics overlay

## 🚀 Deployment

### Static Hosting
```bash
# Build for production
npm run build

# Upload public/ directory to any static host:
# - Netlify, Vercel, GitHub Pages
# - Traditional web hosting
# - CDN deployment
```

### Server Requirements
- **Static File Server**: Any HTTP server
- **HTTPS**: Required for production (security features)
- **MIME Types**: Ensure `.glb` files served with correct headers

## 📝 License

This project is open source. See individual library licenses for Three.js and dependencies.

---

**Built with**: Three.js, TWEEN.js, Modern Web Standards

**Performance**: Optimized for 60fps on modern devices

**Accessibility**: Keyboard navigation, screen reader support

**Mobile**: Responsive design with touch controls
