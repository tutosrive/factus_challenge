export default class Dialog {
  id
  instance
  modal
  body

  constructor({ content = 'Sin contenido', modal = true, classes = '' } = {}) {
    // this.modal = modal
    this.modal = false
    // generar un ID de hasta 10 caracteres aleatorios
    this.id = 'dialog-' + Math.random().toString(36).slice(2, 12)
    this.body = document.querySelector('body')
    this.body.insertAdjacentHTML(
      'beforeend',
      `<dialog id="${this.id}" class="dialog ${classes}">
      <section id="content-${this.id}"></section>
      </dialog>`
    )

    this.#blurContent(true)

    this.instance = document.querySelector(`#${this.id}`)

    // llamado a los métodos set para asignar los valores del objeto recibido y desestructruado
    this.content = content

    // Cuando se presiona "Escape" se cierra el diálogo
    this.body.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault()
      }
    })
  }

  /**
   * Agregar efecto "blur(2px)" los elementos pasados por parámetro
   * @param {[elementsHTML]} elements Elementos HTML a los cuales se les agregará el efecto
   * @param {boolean} blur true: Agregar efecto || false: Quitar efecto
   * @author Dejo huella aquí pa' que me recuerden (SRM-2024)
   */
  #blurContent(blur = false, elements = document.querySelectorAll('body > *:not(#toast):not(.dialog)')) {
    elements.forEach(element => {
      blur ? (element.style.filter = 'blur(2px)') : (element.style.filter = 'none')
    })
  }

  get id() {
    return this.id
  }

  /**
   * Establecer el contenido del cuadro de diálogo
   * @param {string} _content
   */
  set content(_content) {
    if (this.instance) {
      document.querySelector(`#content-${this.id}`).innerHTML = _content
    } else {
      console.error('No se puede asignar contenido a una instancia eliminada del DOM')
    }
  }

  /**
   * @param {string} _style
   */
  set classCSS(_classCSS = '') {
    if (this.instance && _classCSS) {
      this.instance.addClass('classCSS', _classCSS)
    } else {
      console.error('No se pueden asignar estilos a una instancia eliminada del DOM')
    }
  }

  /**
   * bla bla bla
   * @returns bla bla bla
   */
  show() {
    return new Promise((resolve, reject) => {
      if (this.instance) {
        if (this.modal) {
          // el usuario sólo puede interactuar con el cuadro de diálogo abierto
          this.instance.showModal()
        } else {
          // el usuario puede seguir interactuando con otros elementos de la página
          this.instance.show()
        }

        resolve('ok')
      } else {
        reject('No se puede mostrar un dialog removido del DOM')
      }
    })
  }

  close() {
    if (this.instance) {
      this.instance.close()
      // "Quitar" filtro "blur"
      this.#blurContent(false)
    } else {
      console.warn('Nada para cerrar. La instancia ya no existe en el DOM')
    }
    return this
  }

  remove() {
    if (this.instance) {
      this.instance.remove()
      // "Quitar" filtro "blur"
      this.#blurContent(false)
      // otra forma de eliminar nodos del DOM:
      // this.instance.parentNode.removeChild(this.instance)
    } else {
      console.warn('Nada para eliminar. La instancia ya no existe en el DOM')
    }
    this.instance = undefined
    this.id = undefined
  }
}
