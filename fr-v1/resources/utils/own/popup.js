import Dialog from './dialog.js'

export default class Popup extends Dialog {
  #buttons

  constructor({
    modal = true,
    classes = '',
    title = 'Sin título',
    content = 'Sin contenido',
    buttons = [], // los botones que se agregan al footer
    doSomething = null, // un callBack
  } = {}) {
    super({ content, modal, classes })
    this.#buttons = buttons

    document.querySelector(`#${this.id}`).insertAdjacentHTML(
      'afterbegin',
      `<header id="title-${this.id}">
          ${title}
          <button id="_close">✖</button>
        </header>
        <hr>`
    )

    this.addButtons()

    if (typeof doSomething === 'function') {
      doSomething(this.id)
    }
  }

  /**
   * Agregar al popup un pie de página con botones
   * @param {Object[]} _buttons La definición de los botones
   */
  addButtons() {
    // el botón de cierre de la parte superior derecha, elimina la instancia de <dialog>
    document.querySelector(`#${this.id} #_close`).addEventListener('click', () => this.remove())

    if (this.#buttons.length) {
      // si el array de botones tiene elementos se agrega un pié de página con ellos
      document.querySelector(`#${this.id}`).insertAdjacentHTML('beforeend', `<hr><footer></footer>`)
      const footer = document.querySelector(`#${this.id} footer`)

      this.#buttons.forEach((b, i) => {
        // si no se proporcionan estilos para el botón se asigna lo básico
        if (!b.classes) {
          b.classes = 'me-2 btn btn-secondary'
        }

        // se define un string con el código html del botón
        const idButton = `${this.id}-btn${i}`
        const html = `<button id="${idButton}" class="${b.classes}">${b.caption}</button>`
        // se agrega el botón al pie de página del popup
        footer.insertAdjacentHTML('beforeend', html)

        // se referencia el botón creado y se le agregan las posibles clases CSS definidas para él
        const button = document.querySelector(`#${idButton}`)

        // se le asigna la posible acción asignada en su creación
        if (typeof b.action === 'function') {
          button.addEventListener('click', b.action)
        }

        // reemplazar la definición de botones por referencias a botones
        this.#buttons[i] = button
      })
    }
  }

  /**
   *
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
        // Agregar el botón ✖ de la cabecera al array de buttons
        this.#buttons.push(document.querySelector(`#${this.id} #_close`))

        // Para cada botón retornar una promesa con su nombre
        this.#buttons.forEach(button => {
          button.addEventListener('click', e => {
            resolve(e.target.innerText)
          })
        })
      } else {
        reject('No se puede mostrar un popup removido del DOM')
      }
    })
  }

  doSomething(fx) {
    if (typeof fx === 'function') {
      return fx(this.id)
    }
  }
}
