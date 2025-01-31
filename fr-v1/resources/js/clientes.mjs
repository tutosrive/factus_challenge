export default class Clientes {
  static #table
  static #modal
  static #currentOption
  static #municipality // request.response
  static #form
  static #id_org // request.response
  static #tribute_id // request.response
  static #type_id // request.response

  static #cities // <select>
  static #id_org_option // <select>
  static #tribute_id_option // <select>
  static #type_id_option // <select>

  constructor() {
    throw new Error('No requiere instancias, todos los métodos son estáticos. Use Clientes.init()')
  }

  static async init() {
    try {
      // Precargar formulario de clientes
      Clientes.#form = await Helpers.fetchText('/resources/html/clientes.html')
      // " " municipios
      Clientes.#municipality = await Helpers.fetchJSON(`${urlAPI}/get-data/municipality`)
      // " " tipos de identificación (NIT, Cédula de ciudadnía, e.t.c.)
      Clientes.#type_id = await Helpers.fetchJSON(`${urlAPI}/get-data/identification_document`)
      // " " Tributos de cliente
      Clientes.#tribute_id = await Helpers.fetchJSON(`${urlAPI}/get-data/customer_tribute`)
      // " " Tipos de organización (Persona natural || Jurídica)
      Clientes.#id_org = await Helpers.fetchJSON(`${urlAPI}/get-data/legal_organization`)

      // Crear String (con formato HTML) con la lista de <option> para cada <select>
      Clientes.#cities = Helpers.toOptionList({
        items: Clientes.#municipality.data,
        value: 'id',
        text: 'name',
        firstOption: 'Seleccione un municipio',
      })
      Clientes.#id_org_option = Helpers.toOptionList({
        items: Clientes.#id_org.data,
        value: 'id',
        text: 'name',
        firstOption: 'Seleccione el tipo de organización',
      })
      Clientes.#tribute_id_option = Helpers.toOptionList({
        items: Clientes.#tribute_id.data,
        value: 'id',
        text: 'name',
        firstOption: 'Seleccione un tributo',
      })
      Clientes.#type_id_option = Helpers.toOptionList({
        items: Clientes.#type_id.data,
        value: 'id',
        text: 'name',
        firstOption: 'Seleccione el tipo de identificación',
      })

      Toast.show({ message: 'Cargando datos...', duration: 1000 })
      // Intentar cargar los datos de los datos de los clientes
      let response = await Helpers.fetchJSON(`${urlAPI}/get-data/customer`)
      if (response.status !== 200) {
        throw new Error(response.message)
      }

      document.querySelector('main').innerHTML = `
      <h2 class="my-0 mx-4">Clientes</h2>
      <div class="p-2 w-full">
          <div id="table-container" class="m-2 bg-dark"></div>
      </dv>`

      Clientes.#table = new Tabulator('#table-container', {
        height: tableHeight,
        data: response.data,
        layout: 'fitColumns',
        progressiveLoad: 'scroll', // Carga datos progresivamente
        columns: [
          // Columnas de la tabla
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#deleteRowClick },
          { title: 'ID', field: 'id', hozAlign: 'center', width: 90 },
          { title: 'NOMBRE', field: 'names', hozAlign: 'left', width: 250 },
          { title: 'E-MAIL', field: 'email', hozAlign: 'left', width: 200 },
          { title: 'TIPO ID', field: 'type_id', hozAlign: 'center', width: 200, formatter: Clientes.#type_id_format },
          { title: 'COMPAÑÍA', field: 'company', hozAlign: 'left', width: 200, formatter: Clientes.#val_format },
          { title: 'DIRECCIÓN', field: 'address', hozAlign: 'left', width: 320 },
          { title: 'TELÉFONO', field: 'phone', hozAlign: 'center', width: 200 },
          { title: 'NOMBRE COMERCIAL', field: 'trade_name', hozAlign: 'center', width: 200, formatter: Clientes.#val_format },
          { title: 'MUNICIPIO', field: 'municipality_id', hozAlign: 'left', width: 140, formatter: Clientes.#municipality_format },
          { title: 'DV', field: 'verification_digit', hozAlign: 'center', width: 60, formatter: Clientes.#val_format },
          { title: 'ORG', field: 'id_org', hozAlign: 'center', width: 150, formatter: Clientes.#id_org_format },
          { title: 'TRIBUTO', field: 'tribute_id', hozAlign: 'center', width: 150, formatter: Clientes.#tribute_format },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'id', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },
        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Clientes.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach((e) => e.addEventListener('click', Clientes.#addRow)))
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse('clientes')
    } catch (e) {
      Toast.show({ title: 'Clientes', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }
    return this
  }

  /**
   * Formatear el tipo de identificación
   * @param {*} cell Objeto celda de Tabulator
   * @returns String.
   */
  static #type_id_format(cell, property) {
    const val = Clientes.#val_format(cell)
    if (val === '----') return val
    else return Clientes.#type_id.data.find((type) => type.id == val).name
  }

  /**
   * Formatear el tributo
   * @param {*} cell Objeto celda de Tabulator
   * @returns String.
   */
  static #tribute_format(cell = null, id = null) {
    const val = cell !== null ? cell.getValue() : id
    if (val === '----') return val
    else return Clientes.#tribute_id.data.find((tribut) => tribut.id == val).name
  }

  /**
   * Formatear el tipo de organización
   * @param {*} cell Objeto celda de Tabulator
   * @returns String.
   */
  static #id_org_format(cell = null, id = null) {
    const val = cell !== null ? cell.getValue() : id
    if (val === '----') return val
    else return Clientes.#id_org.data.find((org) => org.id == val).name
  }

  /**
   * Cambiar valores vacíos del DV por guiones (----)
   * @param {*} cell Objeto celda de Tabulator
   * @returns String. Valor DV ó '----' si es null
   */
  static #val_format(cell) {
    const val = cell.getValue()
    return val === ' ' || val === '' || !val ? '----' : val
  }

  /**
   * Cambiar ID municipio por el nombre
   * @param {*} cell Objeto celda de Tabulator
   */
  static #municipality_format(cell = null, id = null) {
    const val = cell !== null ? cell.getValue() : id
    // Buscar el municipio correspondiente
    const municipality = Clientes.#municipality.data.find((mun) => mun.id === val)
    return municipality.name
  }

  /**
   * Disponer diálogo para agregar clientes
   */
  static async #addRow() {
    Clientes.#currentOption = 'add'
    Clientes.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Ingreso de clientes</h5>',
      content: Clientes.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Clientes.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
      doSomething: Clientes.#displayDataOnForm,
    })

    Clientes.#modal.show()
  }

  /**
   * Agregar cliente
   */
  static async #add() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-clientes')) {
        Customs.toastBeforeAddRecord()
        return
      }

      // Crear objeto con los datos del formulario
      const body = Clientes.#getFormData()
      Toast.show({ message: 'Validando información...' })
      // Realizar solicitud de registro a la API
      let response = await Helpers.fetchJSON(`${urlAPI}/add-data/customer`, {
        method: 'POST',
        body,
      })

      // // Verificar respuesta de la API
      if (response.status === 200) {
        Toast.show({ message: 'Cliente creado correctamente', mode: 'success' })
        // Agregar fila a la tabla
        Clientes.#table.addRow(response.data)
        Clientes.#modal.remove()
      } else {
        Toast.show({ message: 'No se pudo agregar el registro', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la operación de creación del registro', mode: 'danger', error: e })
    }
  }

  /**
   * Disponer diálogo para editar clientes
   */
  static #editRowClick = async (e, cell) => {
    Clientes.#currentOption = 'edit'
    Clientes.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Actualización de clientes</h5>',
      content: Clientes.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Clientes.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
      doSomething: (idModal) => Clientes.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Clientes.#modal.show()
  }

  /**
   * Realizar peticiones PATCH a la API con endpoint "mercancia"
   */
  static async #edit(cell) {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-clientes')) {
        return
      }

      // Obtener los datos del formulario
      const body = Clientes.#getFormData()
      Toast.show({ message: 'Validando información...' })
      // Crear ruta para la solicitud
      const url = `${urlAPI}/update-data/customer/id/${cell.getRow().getData().id}`

      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body,
      })

      if (response.status === 200) {
        Toast.show({ message: 'Cliente actualizado correctamente', mode: 'success' })
        // actualizar fila correspondiente con la información actualizada
        cell.getRow().update(response.updated_fields)
        Clientes.#modal.remove()
      } else {
        Toast.show({ message: 'No se pudo actualizar el cliente', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'No se pudo actualizar el cliente', mode: 'danger', error: e })
    }
  }

  /**
   * Disponer diálogo con la información del cliente a eliminar
   */
  static #deleteRowClick = async (e, cell) => {
    Clientes.#currentOption = 'delete'
    Clientes.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Eliminación de clientes</h5>',
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación del cliente: <br>
                  ${cell.getRow().getData().id} - ${cell.getRow().getData().names}<br>
                  Municipio: ${cell.getRow().getData().municipality_id}<br>
                  Tipo de identificación: ${cell.getRow().getData().type_id}<br>
                  E-Mail: ${cell.getRow().getData().email}<br>
                  Teléfono: ${cell.getRow().getData().phone}<br>
                  Dirección: ${cell.getRow().getData().address}<br>
                  Tipo de organización: ${cell.getRow().getData().id_org}<br>
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Clientes.#delete(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
    })
    Clientes.#modal.show()
  }

  /**
   * Eliminar cliente
   * @param {*} cell Objeto celda de tabulator
   */
  static async #delete(cell) {
    try {
      const url = `${urlAPI}/delete/customer/id/${cell.getRow().getData().id}`
      let response = await Helpers.fetchJSON(url, {
        method: 'DELETE',
      })

      if (response.status === 200) {
        Toast.show({ message: 'Cliente eliminado exitosamente', mode: 'success' })
        cell.getRow().delete()
        Clientes.#modal.remove()
      } else {
        Toast.show({ message: response.message, mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'No se pudo eliminar el cliente', mode: 'danger', error: e })
    }
  }

  /**
   * Cargar datos dentro del formulario
   * @param {String} idModal ID del diálogo (Modal)
   * @param {Object} rowData Datos de la fila actual
   */
  static #displayDataOnForm(idModal, rowData) {
    const selectCities = document.querySelector(`#${idModal} #ciudad`)
    const selectIdOrg = document.querySelector(`#${idModal} #org`)
    const selectIdTribute = document.querySelector(`#${idModal} #tribute`)
    const selectIdType = document.querySelector(`#${idModal} #tipo-id`)
    Clientes.#verify_type_id(selectIdType)

    // Cargar opciones disponibles dentro de los <select>
    selectCities.innerHTML = Clientes.#cities
    selectIdOrg.innerHTML = Clientes.#id_org_option
    selectIdTribute.innerHTML = Clientes.#tribute_id_option
    selectIdType.innerHTML = Clientes.#type_id_option

    // cargar datos dentro del formulario (Cuando se edita)
    if (Clientes.#currentOption === 'edit') {
      document.querySelector(`#${idModal} #id`).value = rowData.id
      document.querySelector(`#${idModal} #dv`).value = rowData.verification_digit
      document.querySelector(`#${idModal} #tipo-id`).value = rowData.type_id
      document.querySelector(`#${idModal} #nombre`).value = rowData.names
      document.querySelector(`#${idModal} #direccion`).value = rowData.address
      document.querySelector(`#${idModal} #telefono`).value = rowData.phone
      document.querySelector(`#${idModal} #email`).value = rowData.email
      document.querySelector(`#${idModal} #company`).value = rowData.company
      document.querySelector(`#${idModal} #org`).value = rowData.id_org
      document.querySelector(`#${idModal} #tribute`).value = rowData.tribute_id
      document.querySelector(`#${idModal} #trade-name`).value = rowData.trade_name

      Helpers.selectOptionByText(selectCities, Clientes.#municipality_format(null, rowData.municipality_id))
    }
  }

  /**
   * Añadir evento cuando el tipo de identificación es NIT
   * @param {HTMLElement} element Contenedor del elemento
   */
  static #verify_type_id(element) {
    const ctn_dv = document.querySelector('#dv-ctn')
    element.addEventListener('change', (e) => {
      // NIT
      if (element.value === '6') {
        ctn_dv.classList.remove('visually-hidden')
        ctn_dv.children[1].required = true
      }
      // No NIT
      else {
        ctn_dv.classList.add('visually-hidden')
        ctn_dv.children[1].required = false
      }
    })
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del usuario
   */
  static #getFormData() {
    const idModal = Clientes.#modal.id
    const cities = document.querySelector(`#${idModal} #ciudad`)
    const index = cities.selectedIndex
    const ctn_dv = document.querySelector('#dv-ctn').children[1]

    const data = {
      id: document.querySelector(`#${idModal} #id`).value,
      type_id: parseInt(document.querySelector(`#${idModal} #tipo-id`).value),
      names: document.querySelector(`#${idModal} #nombre`).value,
      address: document.querySelector(`#${idModal} #direccion`).value,
      phone: document.querySelector(`#${idModal} #telefono`).value,
      email: document.querySelector(`#${idModal} #email`).value,
      company: document.querySelector(`#${idModal} #company`).value,
      id_org: parseInt(document.querySelector(`#${idModal} #org`).value),
      tribute_id: parseInt(document.querySelector(`#${idModal} #tribute`).value),
      trade_name: document.querySelector(`#${idModal} #trade-name`).value,
      municipality_id: parseInt(cities.options[index].value),
    }
    // Si cliente se identifica con NIT
    if (ctn_dv.required === true) data.verification_digit = parseInt(document.querySelector(`#${idModal} #dv`).value)

    return data
  }
}
