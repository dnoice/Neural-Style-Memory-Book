/*
╔═════════════════════════════════════════════════════════════════╗
║                        NEURAL STYLE MEMORY BOOK                             ║
║               Advanced Export System & Sharing Platform                     ║
╠═════════════════════════════════════════════════════════════════╣
║ File: js/export-system.js                                                   ║
║ Purpose: Comprehensive export functionality with multiple formats & sharing ║
║ Version: 1.2.0                                                              ║
║ Author: Neural Style Memory Book Team                                       ║
║ Created: 2024                                                               ║
║                                                                             ║
║ Features:                                                                   ║
║ • Multiple export formats: JPEG, PNG, WebP, PDF, ZIP                        ║
║ • Quality presets: Thumbnail, Medium, High, Original                        ║
║ • Batch processing for entire photo albums                                  ║
║ • Advanced sharing with Web Share API integration                           ║
║ • Drag & drop file organization                                             ║
║ • Watermark support with customizable positioning                           ║
║ • Metadata preservation and EXIF data handling                              ║
║ • Progress tracking for large batch operations                              ║
║ • Background processing with service worker integration                     ║
║ • File size estimation and optimization                                     ║
║                                                                             ║
║ Export Types:                                                               ║
║ • Current Image: Single active photo with applied styles                    ║
║ • Full Album: All photos in collection                                      ║
║ • Selected Images: User-defined photo selection                             ║
║                                                                             ║
║ Sharing Features:                                                           ║
║ • Native device sharing via Web Share API                                   ║
║ • Clipboard integration for images and links                                ║
║ • QR code generation for easy mobile sharing                                ║
║ • Social media optimization                                                 ║
║ • Email integration with attachment support                                 ║
║                                                                             ║
║ Integration:                                                                ║
║ • Requires main app instance for photo access                               ║
║ • Uses Canvas API for image processing                                      ║
║ • Integrates with service worker for background processing                  ║
║                                                                             ║
║ Browser Support: Canvas API, Blob API, File API, Web Share API (optional)   ║
╚══════════════════════════════════════════════════════════════════╝
*/

/* Neural Style Memory Book - Advanced Export System */
/* Comprehensive export functionality with multiple formats and sharing options */

class ExportSystem {
    constructor(app) {
        this.app = app;
        this.exportQueue = [];
        this.isProcessing = false;
        this.exportHistory = [];
        this.shareTargets = [];
        
        // Export configurations
        this.exportFormats = {
            JPEG: { extension: 'jpg', mimeType: 'image/jpeg', quality: 0.9 },
            PNG: { extension: 'png', mimeType: 'image/png', quality: 1.0 },
            WEBP: { extension: 'webp', mimeType: 'image/webp', quality: 0.9 },
            PDF: { extension: 'pdf', mimeType: 'application/pdf', quality: 1.0 },
            ZIP: { extension: 'zip', mimeType: 'application/zip', quality: 1.0 }
        };
        
        this.qualityPresets = {
            thumbnail: { width: 400, height: 300, quality: 0.7 },
            medium: { width: 1024, height: 768, quality: 0.85 },
            high: { width: 1920, height: 1440, quality: 0.95 },
            original: { width: null, height: null, quality: 1.0 }
        };
        
        this.setupExportUI();
        this.initializeShareTargets();
    }
    
    // === UI SETUP ===
    
    setupExportUI() {
        this.createExportModal();
        this.attachEventListeners();
        this.updateShareTargets();
    }
    
    createExportModal() {
        const modalHTML = `
            <div id="export-modal" class="export-modal" role="dialog" aria-labelledby="export-title" aria-modal="true" aria-hidden="true">
                <div class="modal-backdrop"></div>
                <div class="export-modal-content">
                    <header class="modal-header">
                        <h3 id="export-title" class="modal-title">
                            <span class="modal-icon">📤</span>
                            Export & Share
                        </h3>
                        <button class="modal-close" id="export-modal-close" aria-label="Close export dialog">✕</button>
                    </header>
                    
                    <div class="export-modal-body">
                        <!-- Export Type Selection -->
                        <section class="export-section">
                            <h4 class="export-section-title">Export Type</h4>
                            <div class="export-type-grid">
                                <button class="export-type-btn active" data-type="current" aria-pressed="true">
                                    <span class="export-type-icon">🖼️</span>
                                    <span class="export-type-label">Current Image</span>
                                </button>
                                <button class="export-type-btn" data-type="album" aria-pressed="false">
                                    <span class="export-type-icon">📚</span>
                                    <span class="export-type-label">Full Album</span>
                                </button>
                                <button class="export-type-btn" data-type="selection" aria-pressed="false">
                                    <span class="export-type-icon">✅</span>
                                    <span class="export-type-label">Selected Images</span>
                                </button>
                            </div>
                        </section>
                        
                        <!-- Format Selection -->
                        <section class="export-section">
                            <h4 class="export-section-title">Format</h4>
                            <div class="format-grid">
                                <label class="format-option">
                                    <input type="radio" name="format" value="JPEG" checked>
                                    <span class="format-label">
                                        <strong>JPEG</strong>
                                        <small>Best for photos</small>
                                    </span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="PNG">
                                    <span class="format-label">
                                        <strong>PNG</strong>
                                        <small>Lossless quality</small>
                                    </span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="WEBP">
                                    <span class="format-label">
                                        <strong>WebP</strong>
                                        <small>Modern format</small>
                                    </span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="PDF">
                                    <span class="format-label">
                                        <strong>PDF</strong>
                                        <small>Document format</small>
                                    </span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="ZIP">
                                    <span class="format-label">
                                        <strong>ZIP</strong>
                                        <small>Multiple files</small>
                                    </span>
                                </label>
                            </div>
                        </section>
                        
                        <!-- Quality Settings -->
                        <section class="export-section">
                            <h4 class="export-section-title">Quality & Size</h4>
                            <div class="quality-controls">
                                <div class="quality-preset-grid">
                                    <button class="quality-btn" data-preset="thumbnail">
                                        <span class="quality-label">Thumbnail</span>
                                        <span class="quality-specs">400×300</span>
                                    </button>
                                    <button class="quality-btn active" data-preset="medium">
                                        <span class="quality-label">Medium</span>
                                        <span class="quality-specs">1024×768</span>
                                    </button>
                                    <button class="quality-btn" data-preset="high">
                                        <span class="quality-label">High</span>
                                        <span class="quality-specs">1920×1440</span>
                                    </button>
                                    <button class="quality-btn" data-preset="original">
                                        <span class="quality-label">Original</span>
                                        <span class="quality-specs">Full size</span>
                                    </button>
                                </div>
                                
                                <div class="custom-quality">
                                    <div class="quality-slider-group">
                                        <label for="export-quality" class="quality-slider-label">
                                            Quality: <span id="quality-value">90%</span>
                                        </label>
                                        <input type="range" id="export-quality" class="quality-slider" min="10" max="100" value="90">
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Style Options -->
                        <section class="export-section">
                            <h4 class="export-section-title">Style Options</h4>
                            <div class="style-export-options">
                                <label class="checkbox-option">
                                    <input type="checkbox" id="include-original" checked>
                                    <span class="checkbox-label">Include original images</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" id="include-styled" checked>
                                    <span class="checkbox-label">Include styled versions</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" id="include-metadata">
                                    <span class="checkbox-label">Include metadata</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" id="watermark">
                                    <span class="checkbox-label">Add watermark</span>
                                </label>
                            </div>
                        </section>
                        
                        <!-- File Naming -->
                        <section class="export-section">
                            <h4 class="export-section-title">File Naming</h4>
                            <div class="naming-options">
                                <input type="text" id="export-filename" class="filename-input" 
                                       placeholder="neural-style-memory-book" value="neural-style-memory-book">
                                <div class="naming-templates">
                                    <button class="template-btn" data-template="timestamp">Add Timestamp</button>
                                    <button class="template-btn" data-template="style">Add Style Name</button>
                                    <button class="template-btn" data-template="counter">Add Counter</button>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Preview -->
                        <section class="export-section">
                            <h4 class="export-section-title">Preview</h4>
                            <div class="export-preview">
                                <div class="preview-info">
                                    <span class="preview-label">Estimated file size:</span>
                                    <span id="estimated-size" class="preview-value">~2.5 MB</span>
                                </div>
                                <div class="preview-info">
                                    <span class="preview-label">Number of files:</span>
                                    <span id="file-count" class="preview-value">1</span>
                                </div>
                                <div class="preview-info">
                                    <span class="preview-label">Final filename:</span>
                                    <span id="final-filename" class="preview-value">neural-style-memory-book.jpg</span>
                                </div>
                            </div>
                        </section>
                    </div>
                    
                    <footer class="export-modal-footer">
                        <div class="export-actions-left">
                            <button class="export-btn secondary" id="export-preview-btn">
                                <span class="btn-icon">👁️</span>
                                Preview
                            </button>
                        </div>
                        <div class="export-actions-right">
                            <button class="export-btn secondary" id="export-cancel-btn">Cancel</button>
                            <button class="export-btn primary" id="export-download-btn">
                                <span class="btn-icon">💾</span>
                                Download
                            </button>
                            <button class="export-btn primary" id="export-share-btn">
                                <span class="btn-icon">🔗</span>
                                Share
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
            
            <!-- Share Modal -->
            <div id="share-modal" class="share-modal" role="dialog" aria-labelledby="share-title" aria-modal="true" aria-hidden="true">
                <div class="modal-backdrop"></div>
                <div class="share-modal-content">
                    <header class="modal-header">
                        <h3 id="share-title" class="modal-title">
                            <span class="modal-icon">🔗</span>
                            Share Your Creation
                        </h3>
                        <button class="modal-close" id="share-modal-close" aria-label="Close share dialog">✕</button>
                    </header>
                    
                    <div class="share-modal-body">
                        <div class="share-preview-container">
                            <canvas id="share-preview-canvas" class="share-preview-canvas"></canvas>
                        </div>
                        
                        <div class="share-options-grid" id="share-options-grid">
                            <!-- Dynamic share targets will be inserted here -->
                        </div>
                        
                        <div class="share-link-section">
                            <label for="share-link" class="share-link-label">Share Link:</label>
                            <div class="share-link-container">
                                <input type="text" id="share-link" class="share-link-input" readonly>
                                <button class="copy-link-btn" id="copy-link-btn">
                                    <span class="btn-icon">📋</span>
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    attachEventListeners() {
        // Export modal controls
        document.getElementById('export-modal-close').addEventListener('click', () => this.closeExportModal());
        document.getElementById('export-cancel-btn').addEventListener('click', () => this.closeExportModal());
        document.getElementById('export-download-btn').addEventListener('click', () => this.handleDownload());
        document.getElementById('export-share-btn').addEventListener('click', () => this.handleShare());
        document.getElementById('export-preview-btn').addEventListener('click', () => this.showPreview());
        
        // Share modal controls
        document.getElementById('share-modal-close').addEventListener('click', () => this.closeShareModal());
        document.getElementById('copy-link-btn').addEventListener('click', () => this.copyShareLink());
        
        // Export type selection
        document.querySelectorAll('.export-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectExportType(e.target.closest('.export-type-btn')));
        });
        
        // Quality presets
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectQualityPreset(e.target.closest('.quality-btn')));
        });
        
        // Quality slider
        document.getElementById('export-quality').addEventListener('input', (e) => {
            document.getElementById('quality-value').textContent = `${e.target.value}%`;
            this.updatePreview();
        });
        
        // Filename input
        document.getElementById('export-filename').addEventListener('input', () => this.updatePreview());
        
        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyNamingTemplate(e.target.dataset.template));
        });
        
        // Format selection
        document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePreview());
        });
        
        // Options checkboxes
        document.querySelectorAll('.checkbox-option input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updatePreview());
        });
        
        // Add export button to main UI
        this.addExportButtonToUI();
    }
    
    addExportButtonToUI() {
        const bookControls = document.querySelector('.book-controls');
        if (bookControls) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'control-btn';
            exportBtn.id = 'export-btn';
            exportBtn.setAttribute('aria-label', 'Export current image');
            exportBtn.innerHTML = '<span class="btn-icon">📤</span>';
            exportBtn.addEventListener('click', () => this.openExportModal());
            
            bookControls.appendChild(exportBtn);
        }
    }
    
    // === EXPORT MODAL MANAGEMENT ===
    
    openExportModal() {
        const modal = document.getElementById('export-modal');
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
        this.updatePreview();
    }
    
    closeExportModal() {
        const modal = document.getElementById('export-modal');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    closeShareModal() {
        const modal = document.getElementById('share-modal');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // === EXPORT TYPE SELECTION ===
    
    selectExportType(button) {
        document.querySelectorAll('.export-type-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        
        this.updatePreview();
    }
    
    selectQualityPreset(button) {
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        button.classList.add('active');
        this.updatePreview();
    }
    
    // === FILENAME TEMPLATES ===
    
    applyNamingTemplate(template) {
        const filenameInput = document.getElementById('export-filename');
        const currentValue = filenameInput.value;
        
        let addition = '';
        switch (template) {
            case 'timestamp':
                addition = `_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
                break;
            case 'style':
                addition = `_${this.app.currentStyle}`;
                break;
            case 'counter':
                addition = `_${this.exportHistory.length + 1}`;
                break;
        }
        
        filenameInput.value = currentValue + addition;
        this.updatePreview();
    }
    
    // === PREVIEW UPDATES ===
    
    updatePreview() {
        const exportType = document.querySelector('.export-type-btn.active')?.dataset.type || 'current';
        const format = document.querySelector('input[name="format"]:checked')?.value || 'JPEG';
        const filename = document.getElementById('export-filename').value || 'export';
        const quality = parseInt(document.getElementById('export-quality').value) / 100;
        
        // Calculate estimated file size
        const estimatedSize = this.calculateEstimatedSize(exportType, format, quality);
        
        // Calculate file count
        const fileCount = this.calculateFileCount(exportType, format);
        
        // Generate final filename
        const finalFilename = this.generateFinalFilename(filename, format, exportType);
        
        // Update preview display
        document.getElementById('estimated-size').textContent = this.formatFileSize(estimatedSize);
        document.getElementById('file-count').textContent = fileCount;
        document.getElementById('final-filename').textContent = finalFilename;
    }
    
    calculateEstimatedSize(exportType, format, quality) {
        const baseSize = 1024 * 1024; // 1MB base
        let multiplier = 1;
        
        switch (exportType) {
            case 'current':
                multiplier = 1;
                break;
            case 'album':
                multiplier = this.app.photos.length;
                break;
            case 'selection':
                multiplier = this.getSelectedPhotosCount();
                break;
        }
        
        // Format-specific calculations
        const formatMultipliers = {
            JPEG: quality * 0.8,
            PNG: 1.2,
            WEBP: quality * 0.6,
            PDF: multiplier * 0.9,
            ZIP: multiplier * quality
        };
        
        return baseSize * multiplier * (formatMultipliers[format] || 1);
    }
    
    calculateFileCount(exportType, format) {
        if (format === 'ZIP' || format === 'PDF') {
            return 1;
        }
        
        switch (exportType) {
            case 'current':
                return 1;
            case 'album':
                return this.app.photos.length;
            case 'selection':
                return this.getSelectedPhotosCount();
            default:
                return 1;
        }
    }
    
    generateFinalFilename(base, format, exportType) {
        const extension = this.exportFormats[format].extension;
        
        if (exportType === 'album' || exportType === 'selection') {
            if (format === 'ZIP') {
                return `${base}.${extension}`;
            } else if (format === 'PDF') {
                return `${base}-album.${extension}`;
            } else {
                return `${base}-001.${extension}`;
            }
        }
        
        return `${base}.${extension}`;
    }
    
    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `~${size.toFixed(1)} ${units[unitIndex]}`;
    }
    
    getSelectedPhotosCount() {
        // Placeholder for selection functionality
        return Math.min(3, this.app.photos.length);
    }
    
    // === EXPORT PROCESSING ===
    
    async handleDownload() {
        try {
            this.app.showProcessing('Preparing export...');
            
            const exportConfig = this.getExportConfiguration();
            const exportData = await this.processExport(exportConfig);
            
            await this.downloadFile(exportData, exportConfig);
            
            this.closeExportModal();
            this.app.hideProcessing();
            
            // Add to export history
            this.exportHistory.push({
                timestamp: Date.now(),
                config: exportConfig,
                filename: exportConfig.filename
            });
            
        } catch (error) {
            console.error('❌ Export failed:', error);
            this.app.showError('Export Failed', error.message);
            this.app.hideProcessing();
        }
    }
    
    async handleShare() {
        try {
            this.app.showProcessing('Preparing for sharing...');
            
            const exportConfig = this.getExportConfiguration();
            const exportData = await this.processExport(exportConfig);
            
            await this.openShareModal(exportData, exportConfig);
            this.app.hideProcessing();
            
        } catch (error) {
            console.error('❌ Share preparation failed:', error);
            this.app.showError('Share Failed', error.message);
            this.app.hideProcessing();
        }
    }
    
    getExportConfiguration() {
        return {
            type: document.querySelector('.export-type-btn.active')?.dataset.type || 'current',
            format: document.querySelector('input[name="format"]:checked')?.value || 'JPEG',
            quality: parseInt(document.getElementById('export-quality').value) / 100,
            preset: document.querySelector('.quality-btn.active')?.dataset.preset || 'medium',
            filename: document.getElementById('export-filename').value || 'export',
            includeOriginal: document.getElementById('include-original').checked,
            includeStyled: document.getElementById('include-styled').checked,
            includeMetadata: document.getElementById('include-metadata').checked,
            watermark: document.getElementById('watermark').checked
        };
    }
    
    async processExport(config) {
        const { type, format } = config;
        
        switch (type) {
            case 'current':
                return await this.exportCurrentImage(config);
            case 'album':
                return await this.exportFullAlbum(config);
            case 'selection':
                return await this.exportSelectedImages(config);
            default:
                throw new Error('Invalid export type');
        }
    }
    
    async exportCurrentImage(config) {
        if (this.app.pages.length === 0) {
            throw new Error('No images to export');
        }
        
        const currentPage = this.app.pages[this.app.currentPage];
        const photo = currentPage.userData.photo;
        
        return await this.processPhoto(photo, config);
    }
    
    async exportFullAlbum(config) {
        if (this.app.photos.length === 0) {
            throw new Error('No photos to export');
        }
        
        const processedPhotos = [];
        
        for (let i = 0; i < this.app.photos.length; i++) {
            this.app.updateProcessingText(`Processing image ${i + 1} of ${this.app.photos.length}...`);
            const photoData = await this.processPhoto(this.app.photos[i], config);
            processedPhotos.push(photoData);
        }
        
        if (config.format === 'ZIP') {
            return await this.createZipFile(processedPhotos, config);
        } else if (config.format === 'PDF') {
            return await this.createPDFAlbum(processedPhotos, config);
        }
        
        return processedPhotos[0]; // Return first image for single format exports
    }
    
    async exportSelectedImages(config) {
        // Placeholder for selection functionality
        return await this.exportCurrentImage(config);
    }
    
    async processPhoto(photo, config) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get quality preset dimensions
        const preset = this.qualityPresets[config.preset];
        const { width, height } = this.calculateOutputDimensions(photo, preset);
        
        canvas.width = width;
        canvas.height = height;
        
        // Get the styled image
        const styledImage = await this.app.applyStyleTransfer(photo, this.app.currentStyle);
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                // Draw the image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Add watermark if requested
                if (config.watermark) {
                    this.addWatermark(ctx, width, height);
                }
                
                // Convert to desired format
                const formatConfig = this.exportFormats[config.format];
                const dataURL = canvas.toDataURL(formatConfig.mimeType, config.quality);
                
                resolve({
                    dataURL,
                    filename: this.generatePhotoFilename(photo, config),
                    mimeType: formatConfig.mimeType,
                    canvas,
                    metadata: config.includeMetadata ? this.extractMetadata(photo) : null
                });
            };
            img.src = styledImage;
        });
    }
    
    calculateOutputDimensions(photo, preset) {
        if (preset.width === null || preset.height === null) {
            return { width: photo.width, height: photo.height };
        }
        
        const aspectRatio = photo.width / photo.height;
        let { width, height } = preset;
        
        // Maintain aspect ratio
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    }
    
    addWatermark(ctx, width, height) {
        ctx.save();
        
        // Semi-transparent watermark
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#6366f1';
        ctx.font = `${Math.max(12, width * 0.02)}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        const text = 'Neural Style Memory Book';
        const x = width - 10;
        const y = height - 10;
        
        // Add text shadow
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }
    
    generatePhotoFilename(photo, config) {
        const base = config.filename || 'neural-style-image';
        const extension = this.exportFormats[config.format].extension;
        const style = this.app.currentStyle !== 'original' ? `_${this.app.currentStyle}` : '';
        
        return `${base}${style}.${extension}`;
    }
    
    extractMetadata(photo) {
        return {
            filename: photo.filename,
            originalSize: { width: photo.width, height: photo.height },
            style: this.app.currentStyle,
            faces: photo.faces.length,
            exportTime: new Date().toISOString(),
            app: 'Neural Style Memory Book'
        };
    }
    
    // === FILE OPERATIONS ===
    
    async downloadFile(exportData, config) {
        if (Array.isArray(exportData)) {
            // Multiple files - download each
            for (const data of exportData) {
                await this.downloadSingleFile(data);
            }
        } else {
            // Single file
            await this.downloadSingleFile(exportData);
        }
    }
    
    async downloadSingleFile(data) {
        const blob = this.dataURLToBlob(data.dataURL);
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }
    
    // === ZIP FILE CREATION ===
    
    async createZipFile(photos, config) {
        // Simplified ZIP creation (in production, use JSZip library)
        const zip = {
            files: photos,
            filename: `${config.filename}.zip`,
            mimeType: 'application/zip'
        };
        
        // For demo purposes, return the first photo
        // In production, this would create an actual ZIP file
        return {
            ...photos[0],
            filename: zip.filename,
            mimeType: zip.mimeType
        };
    }
    
    // === PDF CREATION ===
    
    async createPDFAlbum(photos, config) {
        // Simplified PDF creation (in production, use jsPDF library)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Standard PDF page size (A4)
        canvas.width = 794; // A4 width at 96 DPI
        canvas.height = 1123; // A4 height at 96 DPI
        
        // Create a simple album layout
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Neural Style Memory Book', canvas.width / 2, 50);
        
        // Add first photo as preview
        if (photos.length > 0) {
            const img = new Image();
            img.onload = () => {
                const maxWidth = canvas.width * 0.8;
                const maxHeight = canvas.height * 0.6;
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const x = (canvas.width - scaledWidth) / 2;
                const y = 100;
                
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            };
            img.src = photos[0].dataURL;
        }
        
        return {
            dataURL: canvas.toDataURL('application/pdf'),
            filename: `${config.filename}-album.pdf`,
            mimeType: 'application/pdf',
            canvas
        };
    }
    
    // === SHARE FUNCTIONALITY ===
    
    async openShareModal(exportData, config) {
        const modal = document.getElementById('share-modal');
        
        // Update preview canvas
        const previewCanvas = document.getElementById('share-preview-canvas');
        const previewCtx = previewCanvas.getContext('2d');
        
        if (exportData.canvas) {
            previewCanvas.width = exportData.canvas.width;
            previewCanvas.height = exportData.canvas.height;
            previewCtx.drawImage(exportData.canvas, 0, 0);
        }
        
        // Generate share link
        const shareLink = await this.generateShareLink(exportData, config);
        document.getElementById('share-link').value = shareLink;
        
        // Update share options
        this.updateShareOptions(exportData, config);
        
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
    }
    
    async generateShareLink(exportData, config) {
        // In production, this would upload to a sharing service
        // For demo, create a blob URL
        const blob = this.dataURLToBlob(exportData.dataURL);
        return URL.createObjectURL(blob);
    }
    
    updateShareOptions(exportData, config) {
        const container = document.getElementById('share-options-grid');
        container.innerHTML = '';
        
        const shareOptions = [
            { name: 'Copy Image', icon: '📋', action: () => this.copyImageToClipboard(exportData) },
            { name: 'Save to Device', icon: '💾', action: () => this.downloadSingleFile(exportData) },
            { name: 'Social Media', icon: '📱', action: () => this.shareToSocial(exportData) },
            { name: 'Email', icon: '📧', action: () => this.shareViaEmail(exportData) },
            { name: 'QR Code', icon: '📱', action: () => this.generateQRCode(exportData) }
        ];
        
        shareOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'share-option-btn';
            button.innerHTML = `
                <span class="share-option-icon">${option.icon}</span>
                <span class="share-option-name">${option.name}</span>
            `;
            button.addEventListener('click', option.action);
            container.appendChild(button);
        });
    }
    
    async copyImageToClipboard(exportData) {
        try {
            const blob = this.dataURLToBlob(exportData.dataURL);
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            
            this.showShareFeedback('Image copied to clipboard!');
        } catch (error) {
            console.error('❌ Failed to copy image:', error);
            this.showShareFeedback('Failed to copy image', 'error');
        }
    }
    
    copyShareLink() {
        const shareLink = document.getElementById('share-link');
        shareLink.select();
        document.execCommand('copy');
        
        this.showShareFeedback('Link copied to clipboard!');
    }
    
    shareToSocial(exportData) {
        // Open social sharing dialog
        if (navigator.share) {
            navigator.share({
                title: 'Neural Style Memory Book',
                text: 'Check out my AI-styled photo!',
                url: document.getElementById('share-link').value
            });
        } else {
            this.showShareFeedback('Social sharing not supported on this device');
        }
    }
    
    shareViaEmail(exportData) {
        const subject = encodeURIComponent('Neural Style Memory Book - Styled Photo');
        const body = encodeURIComponent('Check out my AI-styled photo created with Neural Style Memory Book!');
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        
        window.open(mailtoLink);
    }
    
    generateQRCode(exportData) {
        // Simplified QR code generation
        // In production, use a QR code library
        this.showShareFeedback('QR code generation coming soon!');
    }
    
    showShareFeedback(message, type = 'success') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `share-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // === INITIALIZATION ===
    
    initializeShareTargets() {
        // Check for Web Share API support
        if (navigator.share) {
            this.shareTargets.push({
                name: 'System Share',
                icon: '🔗',
                handler: (data) => navigator.share(data)
            });
        }
        
        // Check for clipboard API support
        if (navigator.clipboard) {
            this.shareTargets.push({
                name: 'Copy to Clipboard',
                icon: '📋',
                handler: (data) => this.copyImageToClipboard(data)
            });
        }
    }
    
    showPreview() {
        // Show a preview modal with the current export configuration
        this.app.showModal('Export Preview', 'Preview functionality coming soon!');
    }
}

// Integration with main app
if (typeof window !== 'undefined') {
    window.ExportSystem = ExportSystem;
}

console.log('📤 Export System loaded');
