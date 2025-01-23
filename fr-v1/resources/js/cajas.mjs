export default class Cajas {
  static #table
  static #modal
  static #form
  static #currentOption
  static #customers // Clientes
  static #states

  constructor() {
    throw new Error('No se requieren instancias, todos los métodos son estáticos. User Clientes.init()')
  }
  static async init() {
    try {
      // Cargar formulario
      Cajas.#form = await Helpers.fetchText('./resources/html/cajas.html')

      // Solicitar los clientes disponibles
      let response = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // Crear un "listado" de opciones con los clientes disponibles
      Cajas.#customers = Helpers.toOptionList({
        items: response.data,
        value: 'id',
        text: 'nombre',
        firstOption: 'Seleccione un cliente',
      })

      // Arreglo de estados
      response = await Helpers.fetchJSON(`${urlAPI}/envio/estados`)
      Cajas.#states = response.data

      // Cargar datos de las cajas
      response = await Helpers.fetchJSON(`${urlAPI}/caja`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // agregar al <main> de index.html la capa que contendrá la tabla
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2 bg-dark"></div>
      </div>`

      Cajas.#table = new Tabulator('#table-container', {
        height: tableHeight, // establecer la altura para habilitar el DOM virtual y mejorar la velocidad de procesamiento
        data: response.data,
        layout: 'fitData', // ajustar columnas al ancho disponible. También fitData|fitDataFill|fitDataStretch|fitDataTable|fitColumns
        columns: [
          // definir las columnas de la tabla, para tipos datetime se utiliza formatDateTime definido en index.mjs
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Cajas.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Cajas.#deleteRowClick },
          { title: 'Guía', field: 'nroGuia', hozAlign: 'center', width: 90 },
          { title: 'Remitente', field: 'remitente.nombre', hozAlign: 'left', width: 200 },
          { title: 'Destinatario', field: 'destinatario.nombre', hozAlign: 'left', width: 200 },
          { title: 'Dice contener', field: 'contenido', hozAlign: 'left', width: 200 },
          { title: 'Valor', field: 'valorDeclarado', hozAlign: 'right', width: 100, formatter: 'money', formatterParams: { precision: 2 } },
          { title: 'Costo', field: 'costo', hozAlign: 'right', width: 100, formatter: 'money' },
          { title: 'Alto', field: 'alto', hozAlign: 'center', visible: false },
          { title: 'Ancho', field: 'ancho', hozAlign: 'center', visible: false },
          { title: 'Largo', field: 'largo', hozAlign: 'center', visible: false },
          { title: 'Vol. m³', field: 'volumen', hozAlign: 'right', width: 100 },
          { title: 'Frágil', field: 'fragil', hozAlign: 'center', width: 90, formatter: 'tickCross' },
          { title: 'Estado actual', field: 'estados', width: 257, formatter: Cajas.#getState },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'nroGuia', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },

        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Cajas.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach(e => e.addEventListener('click', Cajas.#addRow)))
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse('cajas')
    } catch (e) {
      Toast.show({ title: 'Cajas', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }
  }

  /**
   * Disponer diálogo para editar cajas
   */
  static #addRow() {
    Cajas.#currentOption = 'add'
    Cajas.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Ingreso de cajas</h5>',
      content: Cajas.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Cajas.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Cajas.#modal.remove() },
      ],
      doSomething: Cajas.#displayDataOnForm,
    })
    Cajas.#modal.show()
  }

  /**
   * Disponer diálogo para editar cajas
   */
  static #editRowClick(e, cell) {
    Cajas.#currentOption = 'edit'

    Cajas.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Actualización de cajas</h5>',
      content: Cajas.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Cajas.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Cajas.#modal.remove() },
      ],
      doSomething: idModal => Cajas.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Cajas.#modal.show()
  }

  /**
   * Disponer diálogo con la información de la mercancía a eliminar
   */
  static #deleteRowClick = async (e, cell) => {
    Cajas.#currentOption = 'delete'
    console.log(cell.getRow().getData())
    Cajas.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Eliminación de cajas</h5>',
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación de la caja: <br>
                  ${cell.getRow().getData().nroGuia} - ${cell.getRow().getData().contenido}<br>
                  Remitente: ${cell.getRow().getData().remitente.nombre}<br>
                  Destinatario: ${cell.getRow().getData().destinatario.nombre}<br>
                  Valor declarado: ${cell.getRow().getData().valorDeclarado}<br>
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Cajas.#delete(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Cajas.#modal.remove() },
      ],
    })

    Cajas.#modal.show()
  }

  /**
   * Formatear estados de envío
   * @param {Cell} cell Objeto celda el cual contiene los datos/valores a extraer
   * @returns Cadena de texto formateada. Ej: '2024-11-14 - 10:22 p.m'
   */
  static #getState(cell) {
    const data = cell.getValue() // Objeto con los datos
    const lastState = data[data.length - 1] // Último estado
    const fecha = DateTime.fromISO(lastState.fechaHora).setLocale('es-co').toFormat('yyyy-MM-dd - hh:mm a')
    const state = Cajas.#states.find(state => lastState.estado == state.key)
    return `${fecha} - ${state.value}`
  }

  /**
   * Realizar peticiones POST a la API con endpoint "mercancia"
   */
  static async #add() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-cajas', Cajas.#otherValidations)) {
        Customs.toastBeforeAddRecord()
        return
      }

      // Invocar el método que retorna los datos del formulario como objeto
      const body = Cajas.#getFormData()

      // Realizar petición para agregar registro (caja)
      let response = await Helpers.fetchJSON(`${urlAPI}/caja`, {
        method: 'POST',
        body,
      })

      // Validar respuesta de la solicitud
      if (response.message === 'ok') {
        // Agregar una fila con la nueva caja
        Cajas.#table.addRow(response.data)
        Cajas.#modal.remove()
        Toast.show({ message: 'Caja agregada exitosamente' })
      } else {
        Toast.show({ message: 'No se pudo agregar el registro', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la operación de creación del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Realizar peticiones PATCH a la API con endpoint "mercancia"
   */
  static async #edit(cell) {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-cajas', Cajas.#otherValidations)) {
        return
      }

      // Obtener datos del formulario como objeto
      const body = Cajas.#getFormData()

      // Crear url a la cual se enviarán los datos a actualizar
      const url = `${urlAPI}/caja/${cell.getRow().getData().id}`

      // Enviar solicitud de actualización
      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body,
      })

      // Validar respuesta de la solicitud
      if (response.message === 'ok') {
        // Actualizar fila correspondiente con la información actualizada
        cell.getRow().update(response.data)
        Cajas.#modal.remove()
        Toast.show({ message: 'Caja actualizada correctamente' })
      } else {
        Toast.show({ message: 'No se pudo actualizar la caja', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la operación de actualización del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Realizar peticiones DELETE a la API con endpoint "mercancia"
   */
  static async #delete(cell) {
    try {
      // url para la solicitud de eliminación
      const url = `${urlAPI}/caja/${cell.getRow().getData().id}`

      // Enviar solicitud de eliminación
      let response = await Helpers.fetchJSON(url, {
        method: 'DELETE',
      })

      if (response.message === 'ok') {
        // Eliminar fila correspondiente al registro eliminado
        cell.getRow().delete()
        Cajas.#modal.remove()
        Toast.show({ message: 'Caja eliminada correctamente' })
      } else {
        Toast.show({ message: 'No se pudo eliminar la caja', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la solicitud de eliminación del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Editar y mostrar datos de un regsitro
   */
  static #displayDataOnForm(idModal, rowData) {
    // Referenciar los <select> de clientes (remitente, destinatario)
    const selectSender = document.querySelector(`#${idModal} #remitente`)
    const selectAddressee = document.querySelector(`#${idModal} #destinatario`)

    // Agregar los clientes disponibles en los <select> de clientes
    selectSender.innerHTML = Cajas.#customers
    selectAddressee.innerHTML = Cajas.#customers

    // Si la opción actual es "editar"
    if (Cajas.#currentOption === 'edit') {
      // Cargar los datos de la "celda" que se editará
      document.querySelector(`#${idModal} #nroGuia`).value = rowData.nroGuia
      document.querySelector(`#${idModal} #contenido`).value = rowData.contenido
      document.querySelector(`#${idModal} #alto`).value = rowData.alto
      document.querySelector(`#${idModal} #ancho`).value = rowData.ancho
      document.querySelector(`#${idModal} #largo`).value = rowData.largo
      document.querySelector(`#${idModal} #peso`).value = rowData.peso
      document.querySelector(`#${idModal} #valorDeclarado`).value = rowData.valorDeclarado
      document.querySelector(`#${idModal} #fragil`).checked = rowData.fragil

      selectSender.value = rowData.remitente.id
      selectAddressee.value = rowData.destinatario.id
    }
  }

  static #getFormData() {
    const idModal = Cajas.#modal.id

    return {
      nroGuia: document.querySelector(`#${idModal} #nroGuia`).value,
      contenido: document.querySelector(`#${idModal} #contenido`).value,
      alto: parseFloat(document.querySelector(`#${idModal} #alto`).value),
      ancho: parseFloat(document.querySelector(`#${idModal} #ancho`).value),
      largo: parseFloat(document.querySelector(`#${idModal} #largo`).value),
      peso: parseFloat(document.querySelector(`#${idModal} #peso`).value),
      valorDeclarado: parseFloat(document.querySelector(`#${idModal} #valorDeclarado`).value),
      fragil: document.querySelector(`#${idModal} #fragil`).checked,
      remitente: document.querySelector(`#${idModal} #remitente`).value,
      destinatario: document.querySelector(`#${idModal} #destinatario`).value,
    }
  }

  static #otherValidations() {
    //Referencie los elementos <select> remitente y destinatario
    const selectSender = document.querySelector(`#${Cajas.#modal.id} #remitente`).value
    const selectAddressee = document.querySelector(`#${Cajas.#modal.id} #destinatario`).value

    //Si remitente es ""
    if (selectSender == '') {
      Toast.show({ message: 'Falta seleccionar un remitente', mode: 'warning' })
      return false
    }

    // Si destinatario es ""
    if (selectAddressee == '') {
      Toast.show({ message: 'Falta seleccionar un destinatario', mode: 'warning' })
      return false
    }

    //Si el remitente es igual al destinatario
    if (selectAddressee === selectSender) {
      Toast.show({ message: 'El destinatario debe ser distinto al remitente' })
      return false
    }

    return true
  }
}
