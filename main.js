import './style.css'

class App {
  constructor() {
    this.audio = document.querySelector("audio")
    this.events()
  }

  events() {
    console.log("events")
    this.audio.onplay = () => this.togglePlay()
  }

  togglePlay() {
    console.log("onplay")
  }
}

const _app = new App()