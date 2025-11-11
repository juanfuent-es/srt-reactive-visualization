import SRTLector from './srt-reader.js'

class App {
  constructor() {
    this.audio = document.querySelector("audio")
    // this.video = document.querySelector("video")
    this.subtitleDisplay = document.querySelector("#subtitle-display")
    
    // Inicializar lectores de SRT
    this.initSRTReaders()
  }

  /**
   * Inicializa los lectores de SRT para audio y video
   */
  initSRTReaders() {
    // Lector para audio
    if (this.audio) {
      this.audioSRTReader = new SRTLector(
        this.audio,
        '/subtitles.srt',
        {
          onSubtitleChange: (subtitle, currentTime) => {
            // Solo actualizar si el audio está reproduciéndose
            if (!this.audio.paused) {
              this.updateSubtitleDisplay(subtitle, currentTime)
            }
          }
        }
      )
    }

    // Lector para video
    if (this.video) {
      this.videoSRTReader = new SRTLector(
        this.video,
        '/subtitles.srt',
        {
          onSubtitleChange: (subtitle, currentTime) => {
            // Priorizar video si está reproduciéndose
            if (!this.video.paused) {
              this.updateSubtitleDisplay(subtitle, currentTime)
            }
          }
        }
      )
    }
  }

  /**
   * Actualiza la visualización del subtítulo
   * @param {Object|null} subtitle - Subtítulo actual o null
   * @param {number} currentTime - Tiempo actual en segundos
   */
  updateSubtitleDisplay(subtitle, currentTime) {
    if (!this.subtitleDisplay) {
      return
    }

    if (subtitle && subtitle.text) {
      // Reemplazar saltos de línea con <br> para mantener el formato
      const formattedText = subtitle.text.replace(/\n/g, '<br>')
      this.subtitleDisplay.innerHTML = formattedText
      this.subtitleDisplay.classList.add('active')
      
      // Log para debugging (solo texto sin HTML)
      console.log(`[${currentTime.toFixed(2)}s] ${subtitle.text}`)
    } else {
      this.subtitleDisplay.innerHTML = ''
      this.subtitleDisplay.classList.remove('active')
    }
  }
}

const _app = new App()