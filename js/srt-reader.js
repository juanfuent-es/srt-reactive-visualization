import Srt from './srt.js';

/**
 * Lector reactivo de subtítulos SRT que se sincroniza con video/audio
 */
export default class SRTLector {
    constructor(mediaElement, srtPath, options = {}) {
        this.mediaElement = mediaElement;
        this.srtPath = srtPath;
        this.options = {
            onSubtitleChange: options.onSubtitleChange || null,
            updateInterval: options.updateInterval || 100, // ms
            ...options
        };
        
        this.srt = null;
        this.currentSubtitle = null;
        this.updateInterval = null;
        this.isLoaded = false;
        
        this.init();
    }

    /**
     * Inicializa el lector cargando el archivo SRT
     */
    async init() {
        try {
            const response = await fetch(this.srtPath);
            const srtContent = await response.text();
            this.srt = new Srt(srtContent);
            this.isLoaded = true;
            
            // Configurar eventos del medio
            this.setupMediaEvents();
            
            console.log(`SRT cargado: ${this.srt.lines.length} subtítulos`);
        } catch (error) {
            console.error('Error al cargar el archivo SRT:', error);
        }
    }

    /**
     * Configura los eventos del elemento de media (video/audio)
     */
    setupMediaEvents() {
        // Escuchar cambios de tiempo durante la reproducción
        this.mediaElement.addEventListener('timeupdate', () => {
            this.updateSubtitle();
        });

        // Escuchar cuando el usuario hace seeking (arrastra la barra de progreso)
        this.mediaElement.addEventListener('seeked', () => {
            this.updateSubtitle();
        });

        // Actualizar cuando se pausa
        this.mediaElement.addEventListener('pause', () => {
            this.updateSubtitle();
        });

        // Actualizar cuando se reproduce
        this.mediaElement.addEventListener('play', () => {
            this.updateSubtitle();
        });

        // Limpiar subtítulo cuando termina
        this.mediaElement.addEventListener('ended', () => {
            this.clearSubtitle();
        });
    }

    /**
     * Actualiza el subtítulo actual basado en el tiempo del medio
     */
    updateSubtitle() {
        if (!this.isLoaded || !this.mediaElement) {
            return;
        }

        const currentTime = this.mediaElement.currentTime;
        const subtitle = this.srt.getSubtitleAtTime(currentTime);

        // Solo actualizar si el subtítulo cambió
        if (this.hasSubtitleChanged(subtitle)) {
            this.currentSubtitle = subtitle;

            // Llamar al callback si existe
            if (this.options.onSubtitleChange) {
                this.options.onSubtitleChange(subtitle, currentTime);
            }
        }
    }

    /**
     * Verifica si el subtítulo cambió comparando con el actual
     * @param {Object|null} newSubtitle - Nuevo subtítulo
     * @returns {boolean} true si el subtítulo cambió
     */
    hasSubtitleChanged(newSubtitle) {
        if (!this.currentSubtitle && !newSubtitle) {
            return false;
        }
        
        if (!this.currentSubtitle && newSubtitle) {
            return true;
        }
        
        if (this.currentSubtitle && !newSubtitle) {
            return true;
        }
        
        return this.currentSubtitle.index !== newSubtitle.index;
    }

    /**
     * Limpia el subtítulo actual
     */
    clearSubtitle() {
        if (this.currentSubtitle) {
            this.currentSubtitle = null;
            if (this.options.onSubtitleChange) {
                this.options.onSubtitleChange(null, this.mediaElement.currentTime);
            }
        }
    }

    /**
     * Obtiene el subtítulo actual
     * @returns {Object|null} Subtítulo actual
     */
    getCurrentSubtitle() {
        return this.currentSubtitle;
    }

    /**
     * Obtiene el subtítulo para un tiempo específico
     * @param {number} time - Tiempo en segundos
     * @returns {Object|null} Subtítulo para ese tiempo
     */
    getSubtitleAtTime(time) {
        if (!this.isLoaded) {
            return null;
        }
        return this.srt.getSubtitleAtTime(time);
    }

    /**
     * Obtiene todos los subtítulos
     * @returns {Array} Array de todos los subtítulos
     */
    getAllSubtitles() {
        if (!this.isLoaded) {
            return [];
        }
        return this.srt.getAllSubtitles();
    }

    /**
     * Destruye el lector y limpia los eventos
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Los event listeners se limpian automáticamente cuando el elemento se destruye
        this.srt = null;
        this.currentSubtitle = null;
        this.isLoaded = false;
    }
}

