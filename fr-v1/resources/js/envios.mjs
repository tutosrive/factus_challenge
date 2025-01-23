export default class Envios {
  static #table
  static #modal
  static #currentOption
  static #customers // Clientes
  static #form
  static #mode
  static #states

  constructor() {
    throw new Error('No se requiere instancias, todos los métodos son estáticos. User Paquetes.init()')
  }

  static async init(mode = '') {
    // El modo será "Sobre" || "Paquete" || "Bulto"
    Envios.#mode = mode.toLowerCase()
    try {
      // Cargar formulario
      Envios.#form = await Helpers.fetchText('./resources/html/envios.html')

      let response = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      if (response.message != 'ok') {
        return
      }

      Envios.#customers = Helpers.toOptionList({
        items: response.data,
        value: 'id',
        text: 'nombre',
        firstOption: 'Seleccione un cliente',
      })

      // Cargar arreglo de estados de envíos
      response = await Helpers.fetchJSON(`${urlAPI}/envio/estados`)
      Envios.#states = response.data

      // Intentar cargar los datos de los paquetes
      response = await Helpers.fetchJSON(`${urlAPI}/${Envios.#mode}`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // Agregar la capa que contendrá la tabla al <main> de index.html
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2 bg-dark"></div>
      </div>`

      Envios.#table = new Tabulator('#table-container', {
        height: tableHeight, // establecer la altura para habilitar el DOM virtual y mejorar la velocidad de procesamiento
        data: response.data,
        layout: 'fitData',
        columns: [
          // definir las columnas de la tabla, para tipos datetime se utiliza formatDateTime definido en index.mjs
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Envios.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Envios.#deleteRowClick },
          { title: 'Guía', field: 'nroGuia', hozAlign: 'center', width: 90 },
          { title: 'Remitente', field: 'remitente.nombre', hozAlign: 'left', width: 200 },
          { title: 'Destinatario', field: 'destinatario.nombre', hozAlign: 'left', width: 200 },
          { title: 'Dice contener', field: 'contenido', hozAlign: 'left', width: 200 },
          { title: 'Valor', field: 'valorDeclarado', hozAlign: 'right', width: 100, formatter: 'money', formatterParams: { precision: 2 }, visible: Envios.#mode !== 'sobre' },
          { title: 'Costo', field: 'costo', hozAlign: 'right', width: 100, formatter: 'money', formatterParams: { precision: 0 } },
          { title: 'Peso', field: 'peso', hozAlign: 'right', width: 100, formatterParams: { precision: 0 }, visible: Envios.#mode !== 'sobre' },
          { title: 'Frágil', field: 'fragil', hozAlign: 'center', width: 90, formatter: 'tickCross', visible: Envios.#mode !== 'sobre' },
          { title: 'Certificado', field: 'certificado', hozAlign: 'center', width: 90, formatter: 'tickCross', visible: Envios.#mode === 'sobre' },
          { title: 'Estado actual', field: 'estados', formatter: Envios.#getState },
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
      Envios.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach(e => e.addEventListener('click', Envios.#addRow)))
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse(`${Envios.#mode}s`)
    } catch (e) {
      Toast.show({ title: 'paquetes', message: 'Falló la carga de la información', mode: 'dange', error: e })
    }
    return this
  }

  static #getState(cell) {
    const data = cell.getValue()
    const ultimoEstado = data[data.length - 1]

    // Buscar el "estado" cuyo valor coincida con el último estado (ultimoEstado)
    const estado = Envios.#states.find(state => ultimoEstado.estado == state.key)

    // Fecha del último "estado" en formato (año-mes-día hora:minuto)
    const fecha = DateTime.fromISO(ultimoEstado.fechaHora)
      .setLocale('es-co') // Establecer un "formato" local (Colombia)
      .toFormat('yyyy-MM-dd - hh:mm a') // (año-mes-día hora:minuto pm/am)

    // Devolver "${Estado}" año-mes-día hora:minuto
    return `${fecha} - ${estado.value}`
  }

  static async #add() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-envios', Envios.#otherValidations)) {
        Customs.toastBeforeAddRecord()
        return
      }

      // Objeto que contiene los datos del envío
      const body = Envios.#getFormData()

      const response = await Helpers.fetchJSON(`${urlAPI}/${Envios.#mode}/`, {
        method: 'POST',
        body,
      })

      // Validar respuesta de la consulta
      if (response.message === 'ok') {
        // Agregar fila con el nuevo envío
        Envios.#table.addRow(response.data)
        // Eliminar de pantalla el Modal (Formulario)
        Envios.#modal.remove()
        Toast.show({ message: `Se agregó el ${Envios.#mode} correctamente` })
      } else {
        Toast.show({ message: 'No se pudo agregar el registro', mode: 'danger', error: response })
      }
    } catch (error) {
      Toast.show({ message: 'Falló la operación de creación del registro', mode: 'danger', error: e })
    }
  }

  static async #edit(cell) {
    try {
      if (!Helpers.okForm('#form-envios', Envios.#otherValidations)) {
        return
      }
      // Obtener objeto con los datos a editar del formulario
      const body = Envios.#getFormData()

      // Construir ruta de actualización
      const url = `${urlAPI}/${Envios.#mode}/${cell.getRow().getData().id}`

      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body,
      })

      // Validar respuesta de la solicitud
      if (response.message === 'ok') {
        // Actualizar fila correspondiente al envío eliminado
        cell.getRow().update(response.data)
        Envios.#modal.remove()
        Toast.show({ message: `El ${Envios.#mode} ha sido actualizado correctamente` })
      } else {
        document.querySelector(`#form-envios #div-peso-valor`).style.display = 'none'
        Toast.show({ message: response.message, mode: 'danger', error: response })
      }
    } catch (e) {
      // document.querySelector(`#form-envios #div-peso-valor`).style.display = 'none'
      Toast.show({ message: 'Falló la solicituda de actualización del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Realizar peticiones DELETE a la API con endpoint según tipo/modo de envío
   */
  static async #delete(cell) {
    try {
      const url = `${urlAPI}/${Envios.#mode}/${cell.getRow().getData().id}`
      let response = await Helpers.fetchJSON(url, { method: 'DELETE' })

      if (response.message === 'ok') {
        // Eliminar fila correspondiente al envío eliminado
        cell.getRow().delete()
        Envios.#modal.remove()
        Toast.show({ message: `El ${Envios.#mode} ha sido eliminado correctamente` })
      } else {
        Toast.show({ message: `No se pudo eliminar el ${Envios.#mode}`, mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la solicituda de eliminación del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Disponer diálogo para agregar envíos
   */
  static #addRow() {
    Envios.#currentOption = 'add'
    Envios.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: `<h5>Ingreso de ${Envios.#mode}s</h5>`,
      content: Envios.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Envios.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Envios.#modal.remove() },
      ],
      doSomething: Envios.#displayDataOnForm,
    })
    Envios.#modal.show()
  }

  /**
   * Disponer diálogo para actualizar envíos
   */
  static #editRowClick = async (e, cell) => {
    Envios.#currentOption = 'edit'
    Envios.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: `<h5>Actualización de ${Envios.#mode}s</h5>`,
      content: Envios.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Envios.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Envios.#modal.remove() },
      ],
      doSomething: idModal => Envios.#displayDataOnForm(idModal, cell.getRow().getData()),
    })

    Envios.#modal.show()
  }

  /**
   * Disponer diálogo para eliminar envíos
   */
  static #deleteRowClick = async (e, cell) => {
    Envios.#currentOption = 'delete'
    Envios.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: `<h5>Eliminación de ${Envios.#mode}s</h5>`,
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación del ${Envios.#mode}: <br>
                  ${cell.getRow().getData().nroGuia} - ${cell.getRow().getData().contenido}<br>
                  Remitente: ${cell.getRow().getData().remitente.nombre}<br>
                  Destinatario: ${cell.getRow().getData().destinatario.nombre}<br>
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Envios.#delete(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Envios.#modal.remove() },
      ],
    })

    Envios.#modal.show()
  }

  static #displayDataOnForm(idModal, rowData) {
    const selectSender = document.querySelector(`#${idModal} #remitente`)
    const selectAddressee = document.querySelector(`#${idModal} #destinatario`)

    // Agregar los clientes disponibles en los <select> de clientes
    selectSender.innerHTML = Envios.#customers
    selectAddressee.innerHTML = Envios.#customers

    // Ciertas validaciones para los envíos de tipo Sobre
    if (Envios.#mode === 'sobre') {
      document.querySelector(`#${idModal} #div-certificado`).style.visibility = 'visible'
      document.querySelector(`#${idModal} #div-peso-valor`).style.display = 'none'
      // Establecer un valor por defecto
      document.querySelector(`#${idModal} #contenido`).value = 'Documentos'
      document.querySelector(`#${idModal} #fragil`).disabled = true
    }

    if (Envios.#currentOption === 'edit') {
      document.querySelector(`#${idModal} #nroGuia`).value = rowData.nroGuia
      document.querySelector(`#${idModal} #contenido`).value = rowData.contenido
      document.querySelector(`#${idModal} #certificado`).checked = rowData.certificado
      document.querySelector(`#${idModal} #fragil`).checked = rowData.fragil

      // Los elementos no serán "Focusables" por estar con display = none, en el caso de los sobres
      if (Envios.#mode !== 'sobre') {
        document.querySelector(`#${idModal} #valor`).value = rowData.valorDeclarado
        document.querySelector(`#${idModal} #peso`).value = rowData.peso
      }

      selectSender.value = rowData.remitente.id
      selectAddressee.value = rowData.destinatario.id
    }
  }

  static #otherValidations() {
    //Referencie los elementos <select> remitente y destinatario
    const selectSender = document.querySelector(`#${Envios.#modal.id} #remitente`).value
    const selectAddressee = document.querySelector(`#${Envios.#modal.id} #destinatario`).value

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

  static #getFormData() {
    // Habilitar campo de peso
    const idModal = Envios.#modal.id
    document.querySelector(`#${idModal} #div-peso-valor`).style.display = ''

    return {
      nroGuia: document.querySelector(`#${idModal} #nroGuia`).value,
      contenido: document.querySelector(`#${idModal} #contenido`).value,
      peso: parseFloat(document.querySelector(`#${idModal} #peso`).value),
      valorDeclarado: parseFloat(document.querySelector(`#${idModal} #valor`).value),
      certificado: document.querySelector(`#${idModal} #certificado`).checked,
      fragil: document.querySelector(`#${idModal} #fragil`).checked,
      remitente: document.querySelector(`#${idModal} #remitente`).value,
      destinatario: document.querySelector(`#${idModal} #destinatario`).value,
    }
  }
}
