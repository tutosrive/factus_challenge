export default class Clientes {
  static #table
  static #modal
  static #currentOption
  static #cities
  static #form

  constructor() {
    throw new Error('No requiere instancias, todos los métodos son estáticos. Use Clientes.init()')
  }

  static async init() {
    try {
      Clientes.#form = await Helpers.fetchText('./resources/html/clientes.html')

      let response = await Helpers.fetchJSON('./resources/assets/ciudades.json')

      Clientes.#cities = Helpers.toOptionList({
        items: response,
        value: 'codigo',
        text: 'nombre',
        firstOption: 'Seleccione una ciudad',
      })

      // Intentar cargar los datos de los datos de los clientes
      response = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // Agregar al <main> index.html el contenedor de la tabla
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2 bg-dark"></div>
      </dv>`

      Clientes.#table = new Tabulator('#table-container', {
        height: tableHeight,
        data: response.data,
        layout: 'fitColumns',
        columns: [
          // Columnas de la tabla
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#deleteRowClick },
          { title: 'ID', field: 'id', hozAlign: 'center', width: 90 },
          { title: 'NOMBRE', field: 'nombre', hozAlign: 'left', width: 367 },
          { title: 'DIRECCIÓN', field: 'direccion', hozAlign: 'left', width: 420 },
          { title: 'TELÉFONO', field: 'telefono', hozAlign: 'center', width: 220 },
          { title: 'CIUDAD', field: 'ciudad', hozAlign: 'left', width: 140 },
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

      Clientes.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach(e => e.addEventListener('click', Clientes.#addRow)))
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse('clientes')
    } catch (e) {
      Toast.show({ title: 'Clientes', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }

    return this
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

  static async #add() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-clientes')) {
        Customs.toastBeforeAddRecord()
        return
      }

      // Crear objeto con los datos del formulario
      const body = Clientes.#getFormData()

      // Realizar solicitud de registro a la API
      let response = await Helpers.fetchJSON(`${urlAPI}/cliente`, {
        method: 'POST',
        body,
      })

      // Verificar respuesta de la API
      if (response.message === 'ok') {
        Toast.show({ message: 'Cliente creado correctamente' })
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
    console.log(cell.getRow().getData())
    Clientes.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Actualización de mercancías</h5>',
      content: Clientes.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Clientes.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
      doSomething: idModal => Clientes.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Clientes.#modal.show()
    // Deshabilitar campo de ID
    document.querySelector(`#form-clientes #id`).disabled = true
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

      // Crear ruta para la solicitud
      const url = `${urlAPI}/cliente/${cell.getRow().getData().id}`

      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body,
      })

      if (response.message === 'ok') {
        Toast.show({ message: 'Cliente actualizado correctamente' })
        // actualizar fila correspondiente con la información actualizada
        cell.getRow().update(response.data)
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
    console.log(cell.getRow().getData())
    Clientes.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Eliminación de clientes</h5>',
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación del cliente: <br>
                  ${cell.getRow().getData().id} - ${cell.getRow().getData().nombre}<br>
                  Ciudad: ${cell.getRow().getData().ciudad}<br>
                  Teléfono: ${cell.getRow().getData().telefono}<br>
                  Dirección: ${cell.getRow().getData().direccion}<br>
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Clientes.#delete(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
    })
    Clientes.#modal.show()
  }

  static async #delete(cell) {
    try {
      const url = `${urlAPI}/cliente/${cell.getRow().getData().id}`

      let response = await Helpers.fetchJSON(url, {
        method: 'DELETE',
      })

      if (response.message === 'ok') {
        Toast.show({ message: 'Cliente eliminado exitosamente' })
        cell.getRow().delete()
        Clientes.#modal.remove()
      } else {
        Toast.show({ message: response.message, mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'No se pudo eliminar el cliente', mode: 'danger', error: e })
    }
  }

  static #toComplete(idModal, rowData) {
    console.warn('Sin implementar Clientes.toComplete()')
  }

  static #displayDataOnForm(idModal, rowData) {
    const selectCities = document.querySelector(`#${idModal} #ciudad`)

    selectCities.innerHTML = Clientes.#cities

    if (Clientes.#currentOption === 'edit') {
      console.log(rowData.ciudad)
      document.querySelector(`#${idModal} #id`).value = rowData.id
      document.querySelector(`#${idModal} #nombre`).value = rowData.nombre
      document.querySelector(`#${idModal} #direccion`).value = rowData.direccion
      document.querySelector(`#${idModal} #telefono`).value = rowData.telefono

      Helpers.selectOptionByText(selectCities, rowData.ciudad)
    }
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del usuario
   */
  static #getFormData() {
    // Guardar el índice seleccionado en el <select> ciudad
    const idModal = Clientes.#modal.id
    const cities = document.querySelector(`#${idModal} #ciudad`)
    const index = cities.selectedIndex

    return {
      id: document.querySelector(`#${idModal} #id`).value,
      nombre: document.querySelector(`#${idModal} #nombre`).value,
      direccion: document.querySelector(`#${idModal} #direccion`).value,
      telefono: document.querySelector(`#${idModal} #telefono`).value,
      ciudad: cities.options[index].text,
    }
  }
}
