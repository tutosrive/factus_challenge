export default class FactuSearch {
  static #states
  static #table
  static #modal
  static #currentOpt
  static #form // Formulario para agregar estados
  static #intervalId // Por si un día se requiere eliminar el setinterval() en el input "fecha-hora"
  static #fechaHoraInput // true cuando se activa el evento "input" en '#fecha-hora-add'

  constructor() {
    throw new Error('No se necesitan instancias de esta clase. Use FactuSearch.init()')
  }

  static async init() {
    try {
      FactuSearch.#fechaHoraInput = false
      // Insertar sección del HTML
      document.querySelector('main').innerHTML = await Helpers.fetchText('/resources/html/search_factus.html')

      // Añadir evento "click" al botón de búsqueda
      document.querySelector('#buscar-envio').addEventListener('click', (e) => {
        e.preventDefault()
        // Realizar búsqueda
        FactuSearch.#search()
      })
    } catch (e) {
      Toast.show({ message: 'Fallo la carga de la información', error: e, mode: 'danger' })
    }
    return true
  }

  /**
   * Buscar estados de un envío
   */
  static async #search() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-factus-get')) {
        return
      }

      // Datos del "formulario" (nroGuia, tipo)
      const formData = FactuSearch.#getDataForm()

      // Buscar Envío por su "tipo" y su "nroGuia"
      const res_factus = await Helpers.fetchJSON(`${urlAPI}/factura/${formData.number}`)
      console.log(res_factus)

      // Visibilizar el contenedor de información
      document.querySelector('#container-info').style.visibility = 'visible'

      // Validar si existe el Envío
      if (res_factus.status === 200) {
        FactuSearch.#displayDataOnSearch(res_factus.data)
      } else {
        FactuSearch.#displayDataOnError(res_factus.message)
        Toast.show({ message: res_factus.message, error: res_factus, mode: 'danger' })
      }
    } catch (e) {
      Toast.show({ messgae: 'Falló la operación de búsqueda del registro', error: e, mode: 'danger' })
    }
  }

  /**
   * Mostrar informacón sobre el error generado en la respuesta
   * @param {String} error Mensaje de error
   */
  static #displayDataOnError(error) {
    document.querySelector('#container-info').innerHTML = `
      <h4 class="mx-2">Información del Envío</h4>
      <div class="alert alert-warning text-dark mx-2">
        <h5>Búsqueda fállida</h5>
        <p>${error}</p>
      </div>
    `
  }

  /**
   * Mostrar datos del envío (cuando respuesta válida)
   * @param {Object} response   Objeto con los datos del Envío
   */
  static #displayDataOnSearch(response = {}) {
    document.querySelector('#container-info').innerHTML = `
      <h4 class="mx-2 mt-2">Información del Envío</h4>
      <div class="alert alert-primary mx-2" name="info-estado" id="info-estado" readonly rows="4" style="resize: none"> </div>`

    // Cargar los datos del Envío
    document.querySelector('#info-estado').innerHTML = `
    Remitente: ${response.remitente.nombre} - ${response.remitente.direccion} - ${response.remitente.ciudad}<br>
    Destinatario: ${response.destinatario.nombre} - ${response.destinatario.direccion} - ${response.destinatario.ciudad}<br>
    Dice Contener: ${response.contenido} - Valor del Envío $${response.valorDeclarado}<br>`
    // Crear tabla con los datos
    FactuSearch.#createTable(response)
  }

  /**
   * Crear tabla de Tabulator
   * @param {Object} response Datos del envío
   */
  static async #createTable(response = {}) {
    const html = `
      <!-- Contendrá la tabla de tabulator -->
      <div class="w-full">
        <div id="table-container" class="m-2 bg-dark"></div>
      </div>`
    // Añadir contenedor al HTML antes del fin de <sección>
    document.querySelector('#container-info').insertAdjacentHTML('beforeend', html)

    // Crear tabla conTabulator
    FactuSearch.#table = new Tabulator('#table-container', {
      height: '27vh',
      data: response.estados,
      layout: 'fitColumns',
      columns: [
        { title: 'Hora y fecha', field: 'fechaHora' },
        { title: 'Estado', field: 'estado' },
      ],
      responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
      initialSort: [
        // establecer el ordenamiento inicial de los datos
        { column: 'fechaHora', dir: 'asc' },
      ],
      columnDefaults: {
        tooltip: true, //show tool tips on cells
      },
    })
  }

  /**
   * Obtener los datos ingresados en el formulario, según la opción actual ('add' || 'delete')
   * @returns Un objeto con los datos obtenidos
   */
  static #getDataForm() {
    const dataSearch = {
      number: document.querySelector('#form-factus-get #number-fact').value.toUpperCase(),
    }
    return dataSearch
  }
}
