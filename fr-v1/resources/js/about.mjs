export default class About {
  static async init() {
    const page = await About.#loadPage()
    document.querySelector('main').innerHTML = ''
    document.querySelector('main').insertAdjacentHTML('beforeend', page)
    page ? About.#listenLinks() : null
  }

  /**
   * Cargar página
   * @returns **Contenido principal**
   */
  static async #loadPage() {
    try {
      let content = await Helpers.fetchText('./resources/html/about.html')
      return content
    } catch (e) {
      Toast.show({ message: 'Erro al cargar la página "Acerca de..."' })
    }
  }

  /**
   * Escuchador de clicks de los botones de "#social-links"
   */
  static #listenLinks() {
    // redes "sociales" (íconos)
    const linksInIcons = document.querySelectorAll('#social-links > *')
    // Link de "E-Mail" dentro del main ("<-- Contacto -->")
    const emailP = document.querySelector('#emailParagraph')
    // Todos los "links" de proyectos
    const projects = document.querySelectorAll('* #projects > div > a')
    const contactme = document.querySelectorAll('#contactme > *')

    // Íconos de contacto (Redes)
    linksInIcons.forEach(btn => {
      btn.addEventListener('click', e => {
        const dataName = e.target.dataset.name.toLowerCase()
        switch (dataName) {
          case 'github':
            About.#popover('https://github.com/tutosrivegamerLQ')
            break
          case 'instagram':
            About.#popover('https://www.instagram.com/santiago.riveramarin.524/?utm_source=ig_web_button_share_sheet')
            break
          case 'email':
            About.#popoverMail('srm-ta@outlook.com')
            break
          case 'youtube':
            About.#popover('https://youtube.com/@ingesrm?si=nQLdiopmGLhW43TB')
            break
        }
      })
    })

    // Es un "link expandido", debo cancelar su comportamiento por defecto antes de redirigir
    projects.forEach(project => {
      project.addEventListener('click', e => {
        e.preventDefault()
        About.#popover(e.target.href)
      })
    })

    // Botón de "Contáctame", for Each para que si se presiona el "i" o el "button" funcione igual
    contactme.forEach(btn => {
      btn.addEventListener('click', () => {
        const buttonsPop = ['<button class="bg-info" id="btn-close">Cerrar</button>']
        const pop = Customs.popover('¡Contáctame!', '<img src="./resources/assets/images/qrw.webp" class="img-fluid" style="max-width: 300px">', buttonsPop, 'bg-dark')
        Customs.showPopover(pop)
        document.querySelector('#btn-close').addEventListener('click', e => {
          Customs.closePopover(pop)
        })
      })
    })

    emailP.addEventListener('click', () => About.#popoverMail(emailP.innerHTML))
  }

  /**
   * Mostrar popover con solicitud de redireccionamiento
   * @param {*} url Ruta a la cual se redireccionará, en caso de aceptar
   * @param {*} msg Mensaje que se mostrará antes del link, existe un por defecto pero si desea cambiarse...
   */
  static #popover(url = 'https://srm-ta.onrender.com/', msg = 'Acepta ser redireccionado a:') {
    const buttons = [`<button id="r-true" class="btn btn-success text-dark">Sí acepto</button>`, `<button id="r-false" class="btn btn-danger text-dark">No acepto</button>`]
    // const classes = 'bg-dark'
    const classes = 'bg-dark'
    const pop = Customs.popover('Autorizar Redirección', `${msg}<br> <span class="text-danger user-select-all">${url}</span>`, buttons, classes)
    Customs.showPopover(pop)
    About.#buttonsListen(pop, url)
  }

  /**
   * Popover con mensaje personalizado para E-Mails
   * @param {*} email Dirección E-Mail (Correo Electrónico)
   */
  static #popoverMail(email = 'tutosrivegamer@gmail.com') {
    const buttons = [`<button id="r-true" class="btn btn-success text-dark">Sí acepto</button>`, `<button id="r-false" class="btn btn-danger text-dark">No acepto</button>`]
    const classes = 'bg-dark'
    const pop = Customs.popover('E-Mail de contacto', `Puede redactar un correo a esta dirección para comunicarse conmigo: <br><br><span class="d-block text-center text-info user-select-all" style="font-size: 20px">${email}</span><br><span class="d-block text-center text-success">(Presione "Sí admito" para redactar un correo)</span>`, buttons, classes)
    Customs.showPopover(pop)
    About.#buttonsListen(pop, `mailto:${email}`)
  }

  /**
   * Agregar "escuchador" de eventos a botones
   * @param {*} pop Elemento HTML. Contenedor del **Popover**
   * @param {*} url Ruta a la cual se redireccionará
   */
  static #buttonsListen(pop = null, url = '') {
    document.querySelectorAll(`#${pop.id} > * button`).forEach(btn => {
      btn.addEventListener('click', async e => {
        Customs.closePopover(pop)
        About.#redirect(e.target.id, url)
      })
    })
  }

  /**
   * Redireccionar al usuario a la ruta indicada
   * @param {String} valRedirect **r-true** || **r-false**
   * @param {String} url Ruta a la cual se redireccionará
   */
  static #redirect(valRedirect = '', url = '') {
    switch (valRedirect) {
      case 'r-false':
        Toast.show({ message: 'El redireccionamiento fue descartado' })
        break
      case 'r-true':
        window.open(url)
        break
      default:
        console.log("Algo ha paso en la opción de 'redireccionamiento'")
        break
    }
  }
}
