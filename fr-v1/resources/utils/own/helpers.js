/**
 * Una clase con funciones de ayuda que normalmente son útiles en muchas partes de la aplicación,
 * evitan duplicar código y facilitan la reutilización y el mantenimiento de las aplicaciones.
 */
export default class Helpers {
  /**
   * Carga un recurso HTML en una capa de la aplicación
   * @param {String} url La ruta donde se encuentra el recurso
   * @param {String} container Opcionalmente, la capa donde se inserta el contenido
   * @returns Si el segundo argumento se da, se retorna el container, si no se retorna el recurso
   */
  static async fetchText(url, container = null) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        const html = await response.text()
        const element = document.querySelector(container)
        if (element) {
          element.innerHTML = html
        }
        return element || html // para permitir encadenamiento o para retornar el HTML
      } else {
        return `Se reporta ${response.status} - ${response.statusText}, al intentar acceder al recurso '${url}'`
      }
    } catch (e) {
      return `Se reporta ${e.message}, al intentar acceder al recurso '${url}'`
    }
  }

  /**
   * Hace una petición HTTP y retorna la respuesta obtenida
   * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   * @param {String} url La dirección donde se encuentra el recurso
   * @param {Object} body Un objecto con el cuerpo de la petición
   * @returns Un objeto JSON con la respuesta a la solicitud
   */
  static async fetchJSON(url, data = {}) {
    if (data instanceof Object && data.body instanceof Object && Object.keys(data.body).length > 0) {
      data.headers = { 'Content-Type': 'application/json; charset=utf-8' }
      data.body = JSON.stringify(data.body)
    }

    let response
    try {
      response = await fetch(url, data)

      if (!response.ok) {
        try {
          return await response.json()
        } catch (error) {
          return { ok: false, status: response.status, statusText: response.statusText, url: response.url }
        }
      }
      return await response.json()
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  /**
   * Despliega un aviso en la parte superior de la pantalla
   * Ejemplo de desestructuración y de setTimeout()
   * http://semantic-portal.net/javascript-basics-advanced-functions-scheduling
   * @param {Object} param0 Un objeto con los datos del aviso
   */
  static toast({ icon = 'icon', message = '¡Hola mundo!', log = '' } = {}) {
    if (log) {
      console.log(log)
    }

    // inyectar los elementos a mostrar en el toast
    const toast = document.querySelector('#toast')
    toast.innerHTML = `
            <div id="toast-simple" class="space-x visible fixed right-5 top-5 flex w-full max-w-xs items-center space-x-4 divide-x divide-gray-200 rounded-lg bg-white p-4 text-gray-500 shadow dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-400" role="alert">
                <div id="img">${icon}</div>
                <div class="pl-4 text-sm font-normal">${message}</div>
            </div>
        `
    // eliminar luego de los 4 segundos: https://es.javascript.info/settimeout-setinterval
    setTimeout(() => (toast.innerHTML = ''), 2000)
  }

  /**
   * Retorna el array de objetos recibido, aplanado
   * @param {Array} data Un array de objetos que contienen objetos
   * @returns Array
   */
  static flat = data => data.map(v => Helpers.flatten(v))

  /**
   * Aplana un objeto que contiene otros objetos
   * @param {Object} obj El objeto original que puede contener otros objetos
   * @param {Object} final El objeto aplanado
   * @returns Object
   */
  static flatten(obj, final = {}) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] != null && !Array.isArray(obj[key])) {
        this.flatten(obj[key], final)
      } else {
        final[key] = obj[key]
      }
    }
    return final
  }

  /**
   * Crea el HTML correspondiente a una lista de opciones para inyectar en un select
   * @param {Object} El objeto de definición de la lista
   * @returns El HTML con la lista de opciones
   */
  static toOptionList = ({
    items = [], // el array de objetos para crear la lista
    value = '', // el nombre del atributo de cada objeto que se usará como value
    text = '', // el nombre del atributo de cada objeto que se usará como text
    selected = '', // el valor que debe marcarse como seleccionado
    firstOption = '', // opcionalmente una opción adicional para iniciar la lista
  } = {}) => {
    let options = ''
    if (firstOption) {
      options += `<option value="">${firstOption}</option>`
    }
    items.forEach(item => {
      if (item[value] == selected) {
        // comprobación débil adrede
        options += `<option value="${item[value]}" selected>${item[text]}</option>`
      } else {
        options += `<option value="${item[value]}">${item[text]}</option>`
      }
    })
    return options
  }

  /**
   * Busca por la propiedad text, un elemento en un select y lo selecciona
   * @param {Element} select La referencia al select donde se hace la búsqueda
   * @param {String} text La cadena de texto a buscar
   */
  static selectOptionByText(select, text) {
    select = select instanceof Element ? select : document.querySelector(select)
    // buscar el índice de la opción cuyo texto sea igual al del argumento recibido
    let index = [...select.options].findIndex(option => option.innerText.trim().toLowerCase() === text.trim().toLowerCase())
    // seleccionar el elemento del indice dado
    select.selectedIndex = index
    return index
  }

  /**
   * Aplica las reglas de validación definidas para un formulario HTML.
   * Incluso puede indicar un callback como segundo argumento para complementar la validación
   * @param {String} formSelector Una regla CSS para referenciar el formulario a validar
   */
  static okForm = (formSelector, callBack) => {
    let ok = true
    const form = document.querySelector(formSelector)
    if (!form) {
      throw new Error(`El formulario "${formSelector}" no está disponible`)
    }
    // si los datos del formulario no son válidos, forzar un submit para que se muestren los errores
    if (!form.checkValidity()) {
      let tmpSubmit = document.createElement('button')
      form.appendChild(tmpSubmit)
      tmpSubmit.click()
      form.removeChild(tmpSubmit)
      ok = false
    }
    if (typeof callBack === 'function') {
      ok = ok && callBack()
    }
    return ok
  }

  static idRandom = (prefix = '') =>
    prefix +
    Math.floor(Math.random() * 99999999999999)
      .toString()
      .padStart(14, '0')
}

/**
 * Cambia las ocurrencias de $# por los strings indicados como argumento. Ejemplo:
 * let z = 'Probando $0 de $1 con $2'.translate('strings', 'JavaScript', 'expresiones regulares')
 * retorna 'Probando strings de JavaScript con expresiones regulares'
 *
 * @param  {...any} texts los strings que se usan para hacer el reemplazo
 * @returns El string original con los reemplazos realizados
 */
String.prototype.translate = function (...texts) {
  let str = this
  const regex = /\$(\d+)/gi // no requiere comprobación de mayúsculas pero se deja como ejemplo
  return str.replace(regex, (item, index) => texts[index])
}
