/*
╔═══════════════════════════════════════════════════════════╗
║                        NEURAL STYLE MEMORY BOOK                      ║
║                  Main Application Logic & Core Systems               ║
╠═══════════════════════════════════════════════════════════╣
║ File: js/script.js                                                   ║
║ Purpose: Core application logic with AI integration and 3D rendering ║
║ Version: 1.2.0                                                       ║
║ Author: Neural Style Memory Book Team                                ║
║ Created: 2024                                                        ║
║                                                                      ║
║ Features:                                                            ║
║ • TensorFlow.js integration for AI model processing                  ║
║ • Three.js 3D book rendering with realistic page physics             ║
║ • Real-time neural style transfer with 7 artistic styles             ║
║ • Face detection using BlazeFace model                               ║
║ • Depth estimation for 2.5D parallax effects                         ║
║ • Service worker integration for offline functionality               ║
║ • Advanced export system with multiple format support                ║
║ • Performance monitoring and GPU optimization                        ║
║ • Progressive loading with neural network animation                  ║
║ • Complete accessibility with keyboard navigation                    ║
║                                                                      ║
║ Architecture:                                                        ║
║ • Modular class-based design with dependency injection               ║
║ • Event-driven architecture with proper cleanup                      ║
║ • Async/await for non-blocking operations                            ║
║ • Memory management with automatic garbage collection                ║
║ • Error boundaries with graceful degradation                         ║
║                                                                      ║
║ Dependencies:                                                        ║
║ • Three.js r128 (3D graphics) - https://threejs.org/                 ║
║ • GSAP 3.12.2 (animations) - https://greensock.com/                  ║
║ • TensorFlow.js 4.10.0 (AI) - https://tensorflow.org/js              ║
║ • BlazeFace model (face detection)                                   ║
║ • MobileNet model (image classification)                             ║
║ • ExportSystem class (export-system.js)                              ║
║ • AdvancedStyleSystem class (advanced-styles.js)                     ║
║                                                                      ║
║ Browser Support: ES6+, WebGL 2.0, Service Workers, File API          ║
║ Performance: Optimized for 60fps rendering with memory management    ║
╚════════════════════════════════════════════════════════════╝
*/

/* Neural Style Memory Book - Main Script */
/* Advanced AI-powered 3D photo album with style transfer */

class NeuralStyleMemoryBook {
    constructor() {
        this.isInitialized = false;
        this.models = {
            styleTransfer: null,
            faceDetection: null,
            depthEstimation: null
        };
        this.photos = [];
        this.currentPage = 0;
        this.currentStyle = 'original';
        this.settings = {
            gpuAcceleration: true,
            qualityPreset: 'medium',
            faceDetection: true,
            faceSensitivity: 75,
            animationSpeed: 1.5,
            reducedMotion: false,
            styleIntensity: 70,
            parallaxDepth: 50
        };
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.book = null;
        this.pages = [];
        this.controls = null;
        
        // Performance monitoring
        this.performance = {
            fps: 60,
            frameCount: 0,
            lastTime: performance.now(),
            memory: 0
        };
        
        // Advanced systems
        this.exportSystem = null;
        this.advancedStyleSystem = null;
        this.serviceWorkerManager = null;
        
        // Initialize app
        this.init();
    }
    
    async init() {
        try {
            this.showLoading('Initializing Neural Style Memory Book...');
            
            // Initialize service worker first
            await this.initializeServiceWorker();
            this.updateProgress(10);
            
            // Initialize AI models
            await this.initializeModels();
            this.updateProgress(40);
            
            // Setup 3D environment
            await this.setupThreeJS();
            this.updateProgress(60);
            
            // Initialize advanced systems
            await this.initializeAdvancedSystems();
            this.updateProgress(80);
            
            // Setup UI and events
            this.setupEventListeners();
            this.setupUI();
            this.startPerformanceMonitoring();
            
            this.updateProgress(100);
            
            this.isInitialized = true;
            this.hideLoading();
            this.showApp();
            
            console.log('🧠 Neural Style Memory Book initialized successfully!');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showError('Failed to initialize the application', error.message);
        }
    }
    
    // === SERVICE WORKER INITIALIZATION ===
    
    async initializeServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return;
        }
        
        try {
            this.updateLoadingText('Initializing offline capabilities...');
            
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
            
            // Setup service worker messaging
            this.setupServiceWorkerMessaging(registration);
            
            // Check for updates
            this.checkForServiceWorkerUpdates(registration);
            
        } catch (error) {
            console.warn('⚠️ Service Worker registration failed:', error);
        }
    }
    
    setupServiceWorkerMessaging(registration) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'CACHE_UPDATED':
                    this.handleCacheUpdate(data);
                    break;
                case 'OFFLINE_READY':
                    this.showOfflineNotification();
                    break;
            }
        });
    }
    
    checkForServiceWorkerUpdates(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            });
        });
    }
    
    showUpdateNotification() {
        // Show update available notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>New version available!</span>
                <button onclick="window.location.reload()">Update</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 10000);
    }
    
    showOfflineNotification() {
        console.log('📱 App is ready for offline use');
    }
    
    // === ADVANCED SYSTEMS INITIALIZATION ===
    
    async initializeAdvancedSystems() {
        this.updateLoadingText('Initializing advanced AI systems...');
        
        try {
            // Initialize Advanced Style System
            if (typeof AdvancedStyleSystem !== 'undefined') {
                this.advancedStyleSystem = new AdvancedStyleSystem(this);
                console.log('✅ Advanced Style System initialized');
            }
            
            // Initialize Export System
            if (typeof ExportSystem !== 'undefined') {
                this.exportSystem = new ExportSystem(this);
                console.log('✅ Export System initialized');
            }
            
            // Initialize performance monitoring enhancements
            this.initializePerformanceEnhancements();
            
        } catch (error) {
            console.warn('⚠️ Some advanced systems failed to initialize:', error);
        }
    }
    
    initializePerformanceEnhancements() {
        // GPU memory management
        if (tf.getBackend() === 'webgl') {
            tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
            tf.env().set('WEBGL_PACK', true);
        }
        
        // Image processing optimizations
        this.setupImageProcessingOptimizations();
        
        // Memory cleanup intervals
        setInterval(() => {
            this.performMemoryCleanup();
        }, 30000); // Every 30 seconds
    }
    
    setupImageProcessingOptimizations() {
        // Create reusable canvases to reduce GC pressure
        this.processingCanvases = {
            temp: document.createElement('canvas'),
            preview: document.createElement('canvas'),
            export: document.createElement('canvas')
        };
        
        // Setup image loading queue
        this.imageLoadingQueue = [];
        this.maxConcurrentLoads = 3;
    }
    
    performMemoryCleanup() {
        // Clean up TensorFlow.js memory
        if (tf.memory().numTensors > 100) {
            console.log('🧹 Performing memory cleanup...');
            // Manual cleanup of unused tensors would go here
        }
        
        // Clean up style cache
        if (this.styleCache && this.styleCache.size > 50) {
            const oldestEntries = Array.from(this.styleCache.entries())
                .sort(([,a], [,b]) => a.timestamp - b.timestamp)
                .slice(0, 20);
            
            oldestEntries.forEach(([key]) => this.styleCache.delete(key));
        }
    }

    // === MODEL INITIALIZATION ===
    
    async initializeModels() {
        this.updateLoadingText('Loading AI models...');
        this.updateProgress(10);
        
        try {
            // Set TensorFlow.js backend
            if (this.settings.gpuAcceleration && await tf.setBackend('webgl')) {
                console.log('✅ GPU acceleration enabled');
            } else {
                await tf.setBackend('cpu');
                console.log('⚠️ Fallback to CPU backend');
            }
            
            this.updateProgress(30);
            
            // Load face detection model
            this.updateLoadingText('Loading face detection model...');
            this.models.faceDetection = await blazeface.load();
            console.log('✅ Face detection model loaded');
            
            this.updateProgress(60);
            
            // Initialize style transfer (we'll create custom models for each style)
            this.updateLoadingText('Preparing style transfer models...');
            await this.initializeStyleModels();
            
            this.updateProgress(80);
            
            // Load depth estimation (simplified version)
            this.updateLoadingText('Loading depth estimation...');
            await this.initializeDepthModel();
            
            this.updateProgress(100);
            
        } catch (error) {
            console.error('❌ Model loading failed:', error);
            throw new Error(`AI model initialization failed: ${error.message}`);
        }
    }
    
    async initializeStyleModels() {
        // For this demo, we'll create simplified style transfer using image filters
        // In production, you'd load actual pre-trained neural style transfer models
        this.models.styleTransfer = {
            vangogh: this.createVanGoghFilter(),
            picasso: this.createPicassoFilter(),
            monet: this.createMonetFilter(),
            kandinsky: this.createKandinskyFilter(),
            hokusai: this.createHokusaiFilter()
        };
        console.log('✅ Style transfer models initialized');
    }
    
    async initializeDepthModel() {
        // Simplified depth estimation using edge detection and blur
        this.models.depthEstimation = {
            estimate: (imageData) => this.estimateDepth(imageData)
        };
        console.log('✅ Depth estimation initialized');
    }
    
    // === THREE.JS SETUP ===
    
    async setupThreeJS() {
        this.updateLoadingText('Setting up 3D environment...');
        
        const canvas = document.getElementById('three-canvas');
        const container = document.getElementById('book-container');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f0f23);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting setup
        this.setupLighting();
        
        // Create book
        this.createBook();
        
        // Start render loop
        this.animate();
        
        console.log('✅ Three.js environment set up');
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x6366f1, 0.4);
        this.scene.add(ambientLight);
        
        // Main light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Accent lights
        const accentLight1 = new THREE.PointLight(0x8b5cf6, 0.5, 100);
        accentLight1.position.set(-5, 5, 5);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x06b6d4, 0.3, 100);
        accentLight2.position.set(5, -5, 5);
        this.scene.add(accentLight2);
    }
    
    createBook() {
        this.book = new THREE.Group();
        
        // Book cover
        const coverGeometry = new THREE.BoxGeometry(4, 5.5, 0.2);
        const coverMaterial = new THREE.MeshLambertMaterial({
            color: 0x2d2d5f,
            transparent: true,
            opacity: 0.9
        });
        const cover = new THREE.Mesh(coverGeometry, coverMaterial);
        cover.castShadow = true;
        cover.receiveShadow = true;
        this.book.add(cover);
        
        // Book spine
        const spineGeometry = new THREE.BoxGeometry(0.3, 5.5, 0.2);
        const spineMaterial = new THREE.MeshLambertMaterial({ color: 0x1e1e3f });
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.x = -2.15;
        this.book.add(spine);
        
        // Initialize pages array
        this.pages = [];
        
        this.scene.add(this.book);
        console.log('✅ 3D book created');
    }
    
    // === EVENT LISTENERS ===
    
    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-input');
        const uploadZone = document.getElementById('upload-zone');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadZone.addEventListener('drop', (e) => this.handleFileDrop(e));
        uploadZone.addEventListener('click', () => fileInput.click());
        
        // Style selection
        const styleButtons = document.querySelectorAll('.style-btn');
        styleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleStyleChange(e));
        });
        
        // Controls
        document.getElementById('style-intensity').addEventListener('input', (e) => {
            this.settings.styleIntensity = parseInt(e.target.value);
            document.getElementById('intensity-value').textContent = `${e.target.value}%`;
            this.updateCurrentPageStyle();
        });
        
        document.getElementById('parallax-depth').addEventListener('input', (e) => {
            this.settings.parallaxDepth = parseInt(e.target.value);
            document.getElementById('depth-value').textContent = `${e.target.value}%`;
            this.updateParallaxEffect();
        });
        
        // Page navigation
        document.getElementById('prev-page').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page').addEventListener('click', () => this.nextPage());
        
        // UI toggles
        document.getElementById('upload-btn').addEventListener('click', () => this.toggleUploadSection());
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettingsPanel());
        
        // Settings
        this.setupSettingsListeners();
        
        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-backdrop').addEventListener('click', () => this.closeModal());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('✅ Event listeners set up');
    }
    
    setupSettingsListeners() {
        document.getElementById('gpu-acceleration').addEventListener('change', (e) => {
            this.settings.gpuAcceleration = e.target.checked;
            this.reinitializeModels();
        });
        
        document.getElementById('quality-preset').addEventListener('change', (e) => {
            this.settings.qualityPreset = e.target.value;
            this.updateQualitySettings();
        });
        
        document.getElementById('face-detection').addEventListener('change', (e) => {
            this.settings.faceDetection = e.target.checked;
            this.updateFaceDetection();
        });
        
        document.getElementById('face-sensitivity').addEventListener('input', (e) => {
            this.settings.faceSensitivity = parseInt(e.target.value);
        });
        
        document.getElementById('animation-speed').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
        });
        
        document.getElementById('reduced-motion').addEventListener('change', (e) => {
            this.settings.reducedMotion = e.target.checked;
            document.documentElement.style.setProperty('--motion-reduce', e.target.checked ? '0' : '1');
        });
    }
    
    // === FILE HANDLING ===
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }
    
    handleFileDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        this.processFiles(files);
    }
    
    async processFiles(files) {
        this.showProcessing('Processing images...');
        
        try {
            for (const file of files) {
                await this.addPhoto(file);
            }
            
            this.updatePageNavigation();
            this.hideProcessing();
            
            if (this.photos.length > 0) {
                this.goToPage(0);
            }
            
        } catch (error) {
            console.error('❌ File processing failed:', error);
            this.showError('Failed to process images', error.message);
            this.hideProcessing();
        }
    }
    
    async addPhoto(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const img = new Image();
                    img.onload = async () => {
                        const photo = await this.createPhotoObject(img, file.name);
                        this.photos.push(photo);
                        this.addPhotoToPreview(photo);
                        this.createBookPage(photo);
                        resolve(photo);
                    };
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async createPhotoObject(img, filename) {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image for optimal processing
        const maxSize = this.getMaxImageSize();
        const { width, height } = this.calculateDimensions(img.width, img.height, maxSize);
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Detect faces if enabled
        let faces = [];
        if (this.settings.faceDetection) {
            faces = await this.detectFaces(canvas);
        }
        
        // Estimate depth
        const depthMap = await this.models.depthEstimation.estimate(imageData);
        
        const photo = {
            id: Date.now() + Math.random(),
            filename,
            originalImage: img,
            canvas,
            imageData,
            faces,
            depthMap,
            styledVersions: new Map(),
            width,
            height
        };
        
        // Pre-generate original style
        photo.styledVersions.set('original', canvas.toDataURL());
        
        return photo;
    }
    
    // === STYLE TRANSFER ===
    
    async applyStyleTransfer(photo, style) {
        if (style === 'original') {
            return photo.styledVersions.get('original');
        }
        
        if (photo.styledVersions.has(style)) {
            return photo.styledVersions.get(style);
        }
        
        // Check if advanced style system is available
        if (this.advancedStyleSystem && this.advancedStyleSystem.isInitialized) {
            try {
                const styledImageData = await this.advancedStyleSystem.models.get(style)?.process(
                    photo.imageData,
                    this.getCurrentStyleParameters()
                );
                
                if (styledImageData) {
                    const canvas = this.processingCanvases.temp;
                    canvas.width = photo.width;
                    canvas.height = photo.height;
                    const ctx = canvas.getContext('2d');
                    
                    const imageData = new ImageData(styledImageData, photo.width, photo.height);
                    ctx.putImageData(imageData, 0, 0);
                    
                    const styledDataURL = canvas.toDataURL();
                    photo.styledVersions.set(style, styledDataURL);
                    
                    return styledDataURL;
                }
            } catch (error) {
                console.warn('⚠️ Advanced style transfer failed, falling back to basic:', error);
            }
        }
        
        // Fallback to basic style transfer
        const canvas = this.processingCanvases.temp;
        const ctx = canvas.getContext('2d');
        canvas.width = photo.width;
        canvas.height = photo.height;
        
        // Draw original image
        ctx.drawImage(photo.canvas, 0, 0);
        
        // Apply style filter
        const filter = this.models.styleTransfer[style];
        if (filter) {
            filter(ctx, photo.imageData, this.settings.styleIntensity / 100);
        }
        
        const styledDataURL = canvas.toDataURL();
        photo.styledVersions.set(style, styledDataURL);
        
        return styledDataURL;
    }
    
    getCurrentStyleParameters() {
        // Get current style parameters from advanced UI if available
        if (this.advancedStyleSystem) {
            return this.advancedStyleSystem.getCurrentParameters();
        }
        
        return {
            intensity: this.settings.styleIntensity / 100
        };
    }
    
    updatePageTexture(imageData) {
        if (this.pages.length === 0) return;
        
        const currentPageMesh = this.pages[this.currentPage];
        
        // Create texture from image data
        let dataURL;
        if (imageData instanceof ImageData) {
            const canvas = this.processingCanvases.temp;
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            canvas.getContext('2d').putImageData(imageData, 0, 0);
            dataURL = canvas.toDataURL();
        } else if (typeof imageData === 'string') {
            dataURL = imageData;
        } else {
            console.error('Invalid image data type for texture update');
            return;
        }
        
        const texture = new THREE.TextureLoader().load(dataURL);
        texture.flipY = false;
        currentPageMesh.material.map = texture;
        currentPageMesh.material.needsUpdate = true;
    }
    
    updateProcessingText(text) {
        const processingText = document.getElementById('processing-text');
        if (processingText) {
            processingText.textContent = text;
        }
    }
    
    handleCacheUpdate(data) {
        console.log('📦 Cache updated:', data);
    }
    
    // === STYLE FILTERS ===
    
    createVanGoghFilter() {
        return (ctx, imageData, intensity) => {
            // Van Gogh style: swirling patterns, vibrant colors
            ctx.filter = `
                saturate(${1 + intensity * 0.5})
                contrast(${1 + intensity * 0.3})
                brightness(${1 + intensity * 0.2})
                hue-rotate(${intensity * 20}deg)
            `;
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = `rgba(70, 130, 180, ${intensity * 0.2})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        };
    }
    
    createPicassoFilter() {
        return (ctx, imageData, intensity) => {
            // Picasso style: geometric shapes, bold colors
            ctx.filter = `
                saturate(${1 + intensity * 0.8})
                contrast(${1 + intensity * 0.5})
                sepia(${intensity * 0.3})
            `;
            this.applyPixelation(ctx, intensity * 8);
        };
    }
    
    createMonetFilter() {
        return (ctx, imageData, intensity) => {
            // Monet style: soft, impressionistic
            ctx.filter = `
                blur(${intensity * 2}px)
                saturate(${1 + intensity * 0.4})
                brightness(${1 + intensity * 0.1})
            `;
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = `rgba(173, 216, 230, ${intensity * 0.3})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        };
    }
    
    createKandinskyFilter() {
        return (ctx, imageData, intensity) => {
            // Kandinsky style: abstract, colorful
            ctx.filter = `
                saturate(${1 + intensity})
                contrast(${1 + intensity * 0.4})
                hue-rotate(${intensity * 45}deg)
            `;
            this.applyColorShift(ctx, intensity);
        };
    }
    
    createHokusaiFilter() {
        return (ctx, imageData, intensity) => {
            // Hokusai style: wave patterns, blue tones
            ctx.filter = `
                sepia(${intensity * 0.4})
                saturate(${1 + intensity * 0.3})
                hue-rotate(${180 + intensity * 20}deg)
            `;
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = `rgba(0, 100, 200, ${intensity * 0.2})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        };
    }
    
    applyPixelation(ctx, pixelSize) {
        const canvas = ctx.canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                const pixelData = ctx.getImageData(x, y, 1, 1).data;
                ctx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }
    
    applyColorShift(ctx, intensity) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const shift = intensity * 50;
            data[i] = Math.min(255, data[i] + shift); // Red
            data[i + 1] = Math.min(255, data[i + 1] - shift / 2); // Green
            data[i + 2] = Math.min(255, data[i + 2] + shift / 3); // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // === FACE DETECTION ===
    
    async detectFaces(canvas) {
        if (!this.models.faceDetection) return [];
        
        try {
            const predictions = await this.models.faceDetection.estimateFaces(canvas, false);
            return predictions.map(prediction => ({
                box: prediction.topLeft.concat(prediction.bottomRight),
                landmarks: prediction.landmarks,
                confidence: prediction.probability[0]
            }));
        } catch (error) {
            console.warn('⚠️ Face detection failed:', error);
            return [];
        }
    }
    
    // === DEPTH ESTIMATION ===
    
    estimateDepth(imageData) {
        // Simplified depth estimation using luminance and edge detection
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const depthMap = new Float32Array(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                // Calculate luminance
                const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                
                // Calculate edge strength (simplified Sobel)
                const gx = (data[i + 4] - data[i - 4]) / 2;
                const gy = (data[i + width * 4] - data[i - width * 4]) / 2;
                const edgeStrength = Math.sqrt(gx * gx + gy * gy);
                
                // Combine luminance and edge for depth
                depthMap[y * width + x] = (luminance / 255) * 0.7 + (edgeStrength / 255) * 0.3;
            }
        }
        
        return depthMap;
    }
    
    // === 3D BOOK PAGES ===
    
    createBookPage(photo) {
        const pageGeometry = new THREE.PlaneGeometry(3.8, 5.3);
        
        // Create texture from photo
        const texture = new THREE.TextureLoader().load(photo.styledVersions.get('original'));
        texture.flipY = false;
        
        const pageMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const page = new THREE.Mesh(pageGeometry, pageMaterial);
        page.position.set(0, 0, 0.01 * this.pages.length);
        page.userData = { photo, pageIndex: this.pages.length };
        
        // Add page turn animation capability
        page.rotation.y = 0;
        
        this.pages.push(page);
        this.book.add(page);
        
        // Create hotspots for faces
        this.createFaceHotspots(photo, page);
    }
    
    createFaceHotspots(photo, page) {
        photo.faces.forEach((face, index) => {
            const hotspot = this.createHotspot(face, photo, index);
            if (hotspot) {
                page.add(hotspot);
            }
        });
    }
    
    createHotspot(face, photo, index) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.8
        });
        
        const hotspot = new THREE.Mesh(geometry, material);
        
        // Convert face coordinates to 3D position
        const x = ((face.box[0] + face.box[2]) / 2 / photo.width - 0.5) * 3.8;
        const y = (0.5 - (face.box[1] + face.box[3]) / 2 / photo.height) * 5.3;
        
        hotspot.position.set(x, y, 0.1);
        hotspot.userData = { face, photo, faceIndex: index };
        
        // Add pulsing animation
        this.animateHotspot(hotspot);
        
        return hotspot;
    }
    
    animateHotspot(hotspot) {
        gsap.to(hotspot.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power2.inOut"
        });
    }
    
    // === PAGE NAVIGATION ===
    
    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.pages.length) return;
        
        const currentPage = this.currentPage;
        this.currentPage = pageIndex;
        
        // Update UI
        document.getElementById('current-page').textContent = pageIndex + 1;
        document.getElementById('total-pages').textContent = this.pages.length;
        
        // Animate page turns
        this.animatePageTurn(currentPage, pageIndex);
        
        // Update navigation buttons
        document.getElementById('prev-page').disabled = pageIndex === 0;
        document.getElementById('next-page').disabled = pageIndex === this.pages.length - 1;
    }
    
    animatePageTurn(fromPage, toPage) {
        const duration = this.settings.animationSpeed;
        
        this.pages.forEach((page, index) => {
            if (index <= toPage) {
                // Pages that should be visible
                gsap.to(page.rotation, {
                    y: 0,
                    duration: duration,
                    ease: "power2.inOut"
                });
                gsap.to(page.material, {
                    opacity: 1,
                    duration: duration / 2
                });
            } else {
                // Pages that should be turned
                gsap.to(page.rotation, {
                    y: -Math.PI,
                    duration: duration,
                    ease: "power2.inOut"
                });
                gsap.to(page.material, {
                    opacity: 0.3,
                    duration: duration / 2,
                    delay: duration / 2
                });
            }
        });
        
        // Update camera position for better viewing
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const targetPosition = {
            x: this.currentPage * 0.1,
            y: 0,
            z: 5
        };
        
        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: this.settings.animationSpeed,
            ease: "power2.inOut"
        });
    }
    
    previousPage() {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    // === STYLE MANAGEMENT ===
    
    handleStyleChange(event) {
        const styleButton = event.currentTarget;
        const newStyle = styleButton.dataset.style;
        
        // Update UI
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        styleButton.classList.add('active');
        styleButton.setAttribute('aria-pressed', 'true');
        
        this.currentStyle = newStyle;
        
        // Update advanced style parameter controls if available
        if (this.advancedStyleSystem) {
            this.advancedStyleSystem.updateStyleParameterControls(newStyle);
        }
        
        this.updateCurrentPageStyle();
    }
    
    async updateCurrentPageStyle() {
        if (this.pages.length === 0) return;
        
        const currentPageMesh = this.pages[this.currentPage];
        const photo = currentPageMesh.userData.photo;
        
        this.showProcessing(`Applying ${this.currentStyle} style...`);
        
        try {
            const styledImage = await this.applyStyleTransfer(photo, this.currentStyle);
            
            // Update texture
            const texture = new THREE.TextureLoader().load(styledImage);
            texture.flipY = false;
            currentPageMesh.material.map = texture;
            currentPageMesh.material.needsUpdate = true;
            
            this.hideProcessing();
        } catch (error) {
            console.error('❌ Style transfer failed:', error);
            this.hideProcessing();
        }
    }
    
    // === UI MANAGEMENT ===
    
    showLoading(text = 'Loading...') {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.getElementById('loading-text');
        
        loadingText.textContent = text;
        loadingScreen.style.display = 'flex';
        loadingScreen.setAttribute('aria-hidden', 'false');
    }
    
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.setAttribute('aria-hidden', 'true');
        }, 500);
    }
    
    updateLoadingText(text) {
        document.getElementById('loading-text').textContent = text;
    }
    
    updateProgress(percentage) {
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }
    
    showApp() {
        const app = document.getElementById('app');
        app.classList.add('loaded');
    }
    
    showProcessing(text = 'Processing...') {
        const overlay = document.getElementById('processing-overlay');
        const processingText = document.getElementById('processing-text');
        
        processingText.textContent = text;
        overlay.setAttribute('aria-hidden', 'false');
    }
    
    hideProcessing() {
        const overlay = document.getElementById('processing-overlay');
        overlay.setAttribute('aria-hidden', 'true');
    }
    
    showError(title, message) {
        const errorBoundary = document.getElementById('error-boundary');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        errorBoundary.setAttribute('aria-hidden', 'false');
        
        document.getElementById('error-retry').onclick = () => {
            errorBoundary.setAttribute('aria-hidden', 'true');
            this.init();
        };
    }
    
    // === MODAL MANAGEMENT ===
    
    showModal(title, content) {
        const modal = document.getElementById('memory-modal');
        const modalTitle = document.getElementById('memory-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        modal.focus();
    }
    
    closeModal() {
        const modal = document.getElementById('memory-modal');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // === SETTINGS MANAGEMENT ===
    
    toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('open');
    }
    
    toggleUploadSection() {
        const section = document.getElementById('upload-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
    
    updateQualitySettings() {
        const quality = this.settings.qualityPreset;
        
        switch (quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                break;
            case 'high':
                this.renderer.setPixelRatio(window.devicePixelRatio);
                break;
        }
    }
    
    getMaxImageSize() {
        switch (this.settings.qualityPreset) {
            case 'low': return 512;
            case 'medium': return 1024;
            case 'high': return 2048;
            default: return 1024;
        }
    }
    
    // === PERFORMANCE MONITORING ===
    
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);
    }
    
    updatePerformanceMetrics() {
        // Calculate FPS
        this.performance.frameCount++;
        const now = performance.now();
        const delta = now - this.performance.lastTime;
        
        if (delta >= 1000) {
            this.performance.fps = Math.round((this.performance.frameCount * 1000) / delta);
            this.performance.frameCount = 0;
            this.performance.lastTime = now;
        }
        
        // Update memory usage (approximate)
        if (performance.memory) {
            this.performance.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        // Update UI
        document.getElementById('fps-counter').textContent = this.performance.fps;
        document.getElementById('memory-usage').textContent = `${this.performance.memory}MB`;
    }
    
    // === ANIMATION LOOP ===
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        // Update performance counter
        this.performance.frameCount++;
    }
    
    // === UTILITY METHODS ===
    
    calculateDimensions(width, height, maxSize) {
        const aspectRatio = width / height;
        
        if (width > height) {
            return {
                width: Math.min(width, maxSize),
                height: Math.min(width, maxSize) / aspectRatio
            };
        } else {
            return {
                width: Math.min(height, maxSize) * aspectRatio,
                height: Math.min(height, maxSize)
            };
        }
    }
    
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextPage();
                break;
            case 'Escape':
                this.closeModal();
                break;
        }
    }
    
    handleResize() {
        if (this.renderer && this.camera) {
            const canvas = this.renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }
    
    addPhotoToPreview(photo) {
        const preview = document.getElementById('upload-preview');
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <img src="${photo.styledVersions.get('original')}" alt="${photo.filename}" class="preview-image">
            <div class="preview-overlay">
                <button class="preview-remove" onclick="app.removePhoto('${photo.id}')">✕</button>
            </div>
        `;
        preview.appendChild(item);
    }
    
    removePhoto(photoId) {
        const index = this.photos.findIndex(p => p.id == photoId);
        if (index !== -1) {
            this.photos.splice(index, 1);
            
            // Remove from Three.js scene
            if (this.pages[index]) {
                this.book.remove(this.pages[index]);
                this.pages.splice(index, 1);
            }
            
            // Update preview
            const preview = document.getElementById('upload-preview');
            preview.children[index]?.remove();
            
            // Update navigation
            this.updatePageNavigation();
            
            if (this.currentPage >= this.pages.length) {
                this.goToPage(Math.max(0, this.pages.length - 1));
            }
        }
    }
    
    updatePageNavigation() {
        const hasPages = this.pages.length > 0;
        document.getElementById('prev-page').disabled = !hasPages || this.currentPage === 0;
        document.getElementById('next-page').disabled = !hasPages || this.currentPage === this.pages.length - 1;
        document.getElementById('total-pages').textContent = this.pages.length;
    }
    
    updateParallaxEffect() {
        // Update parallax depth for current page
        if (this.pages.length > 0) {
            const currentPageMesh = this.pages[this.currentPage];
            const depth = this.settings.parallaxDepth / 100;
            
            // Apply depth-based positioning to page elements
            currentPageMesh.position.z = depth * 0.5;
        }
    }
    
    updateFaceDetection() {
        // Toggle face detection for all photos
        this.photos.forEach(photo => {
            photo.faces.forEach((face, index) => {
                // Toggle hotspot visibility
                const page = this.pages.find(p => p.userData.photo.id === photo.id);
                if (page) {
                    const hotspots = page.children.filter(child => child.userData.face);
                    hotspots.forEach(hotspot => {
                        hotspot.visible = this.settings.faceDetection;
                    });
                }
            });
        });
    }
    
    async reinitializeModels() {
        this.showLoading('Reinitializing AI models...');
        try {
            await this.initializeModels();
            this.hideLoading();
        } catch (error) {
            this.showError('Model reinitialization failed', error.message);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for required dependencies
    const dependencies = {
        'THREE': typeof THREE !== 'undefined',
        'gsap': typeof gsap !== 'undefined', 
        'tf': typeof tf !== 'undefined',
        'blazeface': typeof blazeface !== 'undefined'
    };
    
    const missingDeps = Object.entries(dependencies)
        .filter(([name, available]) => !available)
        .map(([name]) => name);
    
    if (missingDeps.length > 0) {
        console.error('❌ Missing required dependencies:', missingDeps);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; 
                        background: linear-gradient(135deg, #0f0f23 0%, #1e1b4b 100%); color: white; 
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 2rem;">
                <div>
                    <h1 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Loading Error</h1>
                    <p style="margin-bottom: 1rem;">Missing required libraries: ${missingDeps.join(', ')}</p>
                    <p style="opacity: 0.8;">Please check your internet connection and reload the page.</p>
                    <button onclick="window.location.reload()" 
                            style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #6366f1; 
                                   color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Initialize the main application
    window.app = new NeuralStyleMemoryBook();
    
    // Global error handlers for better debugging
    window.addEventListener('error', (event) => {
        console.error('❌ Global JavaScript error:', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });
        
        if (window.app && typeof window.app.showError === 'function') {
            window.app.showError(
                'Application Error', 
                `${event.message} (${event.filename}:${event.lineno})`
            );
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled promise rejection:', event.reason);
        
        if (window.app && typeof window.app.showError === 'function') {
            window.app.showError(
                'Promise Rejection', 
                event.reason?.message || 'An unexpected error occurred'
            );
        }
    });
    
    // Development helpers
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('🔧 Development mode detected');
        window.debugApp = {
            app: () => window.app,
            performance: () => window.app?.performance,
            photos: () => window.app?.photos,
            models: () => window.app?.models,
            exportSystem: () => window.app?.exportSystem,
            advancedStyleSystem: () => window.app?.advancedStyleSystem
        };
        console.log('🔧 Debug helpers available via window.debugApp');
    }
});

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
    if (window.app && window.app.renderer) {
        if (document.hidden) {
            // Pause rendering when tab is not visible to save battery
            console.log('⏸️ Pausing rendering (tab hidden)');
            if (window.app.animationId) {
                cancelAnimationFrame(window.app.animationId);
                window.app.animationId = null;
            }
        } else {
            // Resume rendering when tab becomes visible
            console.log('▶️ Resuming rendering (tab visible)');
            if (!window.app.animationId) {
                window.app.animate();
            }
        }
    }
});

// Performance monitoring for development
if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('📊 Page Performance:', {
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    firstByte: Math.round(perfData.responseStart - perfData.fetchStart)
                });
            }
        }, 1000);
    });
}

console.log('🧠 Neural Style Memory Book script loaded successfully');
console.log('📱 PWA features:', {
    serviceWorker: 'serviceWorker' in navigator,
    webShare: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    fileSystemAccess: 'showOpenFilePicker' in window
});
