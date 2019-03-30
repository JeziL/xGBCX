function gbc_load_url(url) {
  let xhr = new XMLHttpRequest()
  xhr.open("GET", url)
  xhr.overrideMimeType("text/plain; charset=x-user-defined")

  xhr.onerror = () => {
    console.log(`Error loading ${path}: ${xhr.statusText}`)
  }

  xhr.onload = () => {
    switch (xhr.status) {
      case 200:
        let canvas = document.getElementById("mainCanvas")
        initPlayer()
        start(canvas, xhr.responseText)
        break
      case 0:
        break
      default:
        xhr.onerror()
        break
    }
  }

  xhr.send()
}

function gbc_load_state(dataURL) {
  let xhr = new XMLHttpRequest()
  xhr.open("GET", dataURL)

  xhr.onerror = () => {
    console.log(`Error loading ${path}: ${xhr.statusText}`)
  }

  xhr.onload = () => {
    switch (xhr.status) {
      case 200:
        gameboy.returnFromState(JSON.parse(xhr.responseText))
        break
      case 0:
        break
      default:
        xhr.onerror()
        break
    }
  }

  xhr.send()
}

function GameBoyStickButtonsDown(btns) {
  ["up", "right", "left", "down"].forEach(b => {
    if (btns.includes(b)) {
      GameBoyKeyDown(b)
    } else {
      GameBoyKeyUp(b)
    }
  })
}

function axesDegree2Buttons(deg) {
  if (deg >= -22.5 && deg < 22.5) {
    GameBoyStickButtonsDown(["up"])
  }
  else if (deg >= 22.5 && deg < 67.5) {
    GameBoyStickButtonsDown(["up", "right"])
  }
  else if (deg >= 67.5 && deg < 112.5) {
    GameBoyStickButtonsDown(["right"])
  }
  else if (deg >= 112.5 && deg < 157.5) {
    GameBoyStickButtonsDown(["right", "down"])
  }
  else if (deg >= 157.5 && deg < 202.5) {
    GameBoyStickButtonsDown(["down"])
  }
  else if (deg >= 202.5 && deg < 247.5) {
    GameBoyStickButtonsDown(["down", "left"])
  }
  else if (deg >= 247.5 && deg < 292.5) {
    GameBoyStickButtonsDown(["left"])
  }
  else if (deg >= 292.5 && deg < 337.5) {
    GameBoyStickButtonsDown(["left", "up"])
  }
  else if (deg >= 337.5 && deg < 382.5) {
    GameBoyStickButtonsDown([])
  }
}
