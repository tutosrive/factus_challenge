export default class FactuSearch {
  static #table
  constructor() {
    throw new Error('No se necesitan instancias de esta clase. Use FactuSearch.init()')
  }

  static async init() {
    try {
      // Cargar formulario de facturas
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

      // Datos del "formulario"
      const formData = FactuSearch.#getDataForm()
      Toast.show({ message: 'Buscando factura...' })
      // Buscar factura por su número "clave"
      const res_factus = await Helpers.fetchJSON(`${urlAPI}/factura/${formData.number}`)

      // Visibilizar el contenedor de información
      document.querySelector('#container-info').style.visibility = 'visible'

      // Validar respuesta
      if (res_factus.status === 200) {
        Toast.show({ message: `<p class="fs-6 text-dark">Se encontró la factura número: <span class="text-success">${formData.number}</span></p>`, mode: 'success' })
        const data = [res_factus.data]
        FactuSearch.#displayDataOnSearch(data)
      } else {
        FactuSearch.#displayDataOnError(res_factus.message)
        Toast.show({ message: res_factus.message, error: res_factus, mode: 'danger' })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la operación de búsqueda del registro', error: e, mode: 'danger' })
    }
  }

  /**
   * Descargar factura en formato PDF
   */
  static async download_pdf() {
    try {
      const number_fact = FactuSearch.#getDataForm().number
      Toast.show({ message: 'Espere un momento porfavor...', duration: 1000 })
      // PDF en base 64
      const req_pdf64 = await Helpers.fetchJSON(`${urlAPI}/factura-download/${number_fact}`)
      if (req_pdf64.status === 200) {
        const data = { pdf_b64: req_pdf64.data.pdf_base_64_encoded, name_factus: `${number_fact}_${req_pdf64.data.file_name}` }
        const fileurl = `data:application/pdf;base64,${data.pdf_b64}`
        const link_download = document.createElement('a')
        link_download.href = fileurl
        link_download.download = data.name_factus
        document.body.appendChild(link_download)
        link_download.click()
        URL.revokeObjectURL(fileurl)
        document.body.removeChild(link_download)
      } else {
        Toast.show({ message: 'No se pudo obtener la factura', mode: 'danger', error: req_pdf64 })
      }
    } catch (e) {
      Toast.show({ message: 'Error al solicitar el registro', mode: 'danger', error: e })
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
  static #displayDataOnSearch(response = []) {
    const button_download = `<div class="ctn_download_fact"><button class="btn_download_fact" id="download_btn">${icons.pdf_icon1}</button>`
    document.querySelector('#container-info').innerHTML = `
    <div><h4 class="mx-2 mt-2">Información del Envío</h4>${button_download}</div>
    <div class="alert alert-primary mx-2" name="info-estado" id="info-estado" readonly rows="4" style="resize: none"> </div>`

    document.querySelector('#download_btn').addEventListener('click', FactuSearch.download_pdf)
    const errors_response = () => {
      if (response[0].bill.errors.length > 0) {
        let res = `<div class="bg-danger text-warning p-2 rounded"><h3>Errores</h3>`
        for (let error of response[0].bill.errors) {
          res += `<p>${error}</p>`
        }
        res += '</div>'
        return res
      } else {
        return ''
      }
    }
    // Cargar los datos del Envío
    document.querySelector('#info-estado').innerHTML = `
    Tipo de documento: ${response[0].bill.document.name}<br>
    Observación: ${response[0].bill.observation ?? 'Sin observaciones'}<br>
    API de: ${response[0].company.name} - ${response[0].company.nit} - ${response[0].company.municipality}<br>
    Código de referencia: ${response[0].bill.reference_code}<br>
    Cliente: ${response[0].customer.names} - ${response[0].customer.legal_organization.name}<br>
    ${errors_response()}
    `
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
      height: '15vh',
      data: response,
      layout: 'fitColumns',
      columns: [
        { title: 'ID', field: 'bill.id', hozAlign: 'center', width: 90 },
        { title: 'ESTADO ', field: 'bill.status', hozAlign: 'center', width: 100, formatter: FactuSearch.#status_formatter },
        { title: 'DOCUMENTO', field: 'bill.document.name', hozAlign: 'left', width: 250 },
        { title: 'NÚMERO FACTURA', field: 'bill.number', hozAlign: 'center', width: 180 },
        { title: 'CUFE', field: 'bill.cufe', hozAlign: 'left', width: 200 },
        { title: 'ID CLIENTE', field: 'customer.identification', hozAlign: 'center', width: 200 },
        { title: 'NOMBRE CLIENTE', field: 'customer.graphic_representation_name', hozAlign: 'left', width: 200 },
        { title: 'FORMA DE PAGO', field: 'bill.payment_form.name', hozAlign: 'left', width: 200 },
        { title: 'PREFIJO RANGO', field: 'numbering_range.prefix', hozAlign: 'center', width: 200 },
        { title: 'HORA CREACIÓN', field: 'bill.created_at', hozAlign: 'left', width: 350, formatter: FactuSearch.#date_format },
        { title: 'HORA VALIDACIÓN', field: 'bill.validated', hozAlign: 'left', width: 350, formatter: FactuSearch.#date_format },
      ],
      responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
      columnDefaults: {
        tooltip: true, //show tool tips on cells
      },
    })
  }

  /**
   * Dar formato a fechas
   * @param {*} cell Objeto celda de Tabulator
   * @param {boolean} load ¿Es operación `POST`?
   * @param {*} value Solo si es operación `POST` (`load = true`), valor que se formateará
   * @returns String con formato de fecha según corresponda:<hr> `08:32 p.m., del jueves 23 de enero de 2025` => `load = false` || `23-01-2025 09:16:27 PM` => `load = true`
   */
  static #date_format(cell = null, load = false, value = null) {
    if (cell !== null) {
      // Valores que no sean nulos
      if (cell.getValue() !== null) {
        const value = cell.getValue()
        const dt = DateTime.fromFormat(value, 'dd-MM-yyyy hh:mm:ss a').setLocale('es-419')
        return dt.toFormat("hh:mm a, 'del' cccc dd 'de' LLLL 'de' yyyy")
      } else {
        return '----'
      }
    }
    // load = "method: POST",
    else if (load === true) {
      return DateTime.fromFormat(value).setLocale('es-419').toFormat('dd-MM-yyyy hh:mm:ss a')
    }
  }

  /**
   * Dar formato al estado de la factura
   * @param {*} cell
   * @returns
   */
  static #status_formatter(cell) {
    const val = cell.getValue()
    return val === 0 ? 'En espera' : 'Enviada'
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
