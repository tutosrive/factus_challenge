export default class Inicio {
  static async init() {
    await Inicio.#load()
    Inicio.#loadContentPage()
  }

  /**
   * Cargar página de inicio
   */
  static async #load() {
    try {
      const container = document.querySelector('main')
      container.innerHTML = await Helpers.fetchText('./resources/html/inicio.html')
    } catch (e) {
      Toast.show({ message: 'Ha ocurrido un error. Intente recargar la página', mode: 'danger', error: e })
    }
  }

  /**
   * Cargar contenido a la página principal
   */
  static #loadContentPage() {
    // Círculo de "verificado" verde
    const checkFillCircle = `
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#00ff22" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
    `
    Inicio.#putAllContent('div[data-name="checkCircleFill"]', checkFillCircle)
  }

  /**
   * Agregar el mismo contenido a elementos que son idénticos
   * @param {String} selector Nombre del identificado por el cual se buscará el elemento.Ej: '#back-main'
   * @param {String} content Cadena de texto (Con sintaxis HTML) que se agregará como contenido
   */
  static #putAllContent(selector, content) {
    document.querySelectorAll(selector).forEach(element => {
      element.innerHTML = content
    })
  }
}
