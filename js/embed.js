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
