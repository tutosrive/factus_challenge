export default class Mercancias {
  static #table
  static #modal
  static #currentOption
  static #form
  static #customers

  constructor() {
    throw new Error('No requiere instancias, todos los métodos son estáticos. Use Mercancias.init()')
  }

  static async init() {
    try {
      Mercancias.#form = await Helpers.fetchText('./resources/html/mercancias.html')

      // acceder a la información de clientes
      let response = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // crear las opciones para un select de clientes
      Mercancias.#customers = Helpers.toOptionList({
        items: response.data,
        value: 'id',
        text: 'nombre',
        firstOption: 'Seleccione un cliente',
      })

      // intentar cargar los datos de las mercancías
      response = await Helpers.fetchJSON(`${urlAPI}/mercancia`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // agregar al <main> de index.html la capa que contendrá la tabla
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2 bg-dark"></div>
      </div>`

      Mercancias.#table = new Tabulator('#table-container', {
        height: tableHeight, // establecer la altura para habilitar el DOM virtual y mejorar la velocidad de procesamiento
        data: response.data,
        layout: 'fitColumns', // ajustar columnas al ancho disponible. También fitData|fitDataFill|fitDataStretch|fitDataTable|fitColumns
        columns: [
          // definir las columnas de la tabla, para tipos datetime se utiliza formatDateTime definido en index.mjs
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Mercancias.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Mercancias.#deleteRowClick },
          { title: 'ID', field: 'id', hozAlign: 'center', width: 90 },
          { title: 'Cliente', field: 'cliente.nombre', width: 200 },
          { title: 'Dice contener', field: 'contenido', width: 300 },
          { title: 'Ingreso', field: 'fechaHoraIngreso', width: 150, formatter: 'datetime', formatterParams: formatDateTime },
          { title: 'Salida', field: 'fechaHoraSalida', width: 150, formatter: 'datetime', formatterParams: formatDateTime },
          { title: 'Días', field: 'diasAlmacenado', hozAlign: 'center', width: 65 },
          { title: 'Alto', field: 'alto', hozAlign: 'center', visible: false },
          { title: 'Ancho', field: 'ancho', hozAlign: 'center', visible: false },
          { title: 'Largo', field: 'largo', hozAlign: 'center', visible: false },
          { title: 'Vol. m³', field: 'volumen', hozAlign: 'center', width: 80 },
          { title: 'Costo', field: 'costo', hozAlign: 'right', width: 100, formatter: 'money' },
          { title: 'Bodega', field: 'bodega', width: 280 },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'fechaHoraIngreso', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },

        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Mercancias.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach(e => e.addEventListener('click', Mercancias.#addRow)))
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse('mercancías')
    } catch (e) {
      Toast.show({ title: 'Mercancias', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }

    return this
  }

  /**
   * Disponer diálogo para editar mercancías
   */
  static #editRowClick = async (e, cell) => {
    Mercancias.#currentOption = 'edit'
    console.log(cell.getRow().getData())

    Mercancias.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Actualización de mercancías</h5>',
      content: Mercancias.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Mercancias.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Mercancias.#modal.remove() },
      ],
      doSomething: idModal => Mercancias.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Mercancias.#modal.show()
  }

  /**
   * Disponer diálogo con la información de la mercancía a eliminar
   */
  static #deleteRowClick = async (e, cell) => {
    Mercancias.#currentOption = 'delete'
    console.log(cell.getRow().getData())
    Mercancias.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Eliminación de mercancías</h5>',
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación de la mercancía: <br>
                  ${cell.getRow().getData().id} - ${cell.getRow().getData().contenido}<br>
                  Bodega: ${cell.getRow().getData().bodega}<br>
                  Propietario: ${cell.getRow().getData().cliente.nombre}<br>
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Mercancias.#delete(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Mercancias.#modal.remove() },
      ],
    })
    Mercancias.#modal.show()
  }

  /**
   * Disponer diálogo para agregar mercancías
   */
  static #addRow() {
    Mercancias.#currentOption = 'add'
    Mercancias.#modal = new Modal({
      modal: false,
      classes: Customs.classesModal, // En customs.mjs están las clases (Se repiten habitualmente)
      title: '<h5>Ingreso de mercancías</h5>',
      content: Mercancias.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Mercancias.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Mercancias.#modal.remove() },
      ],
      doSomething: Mercancias.#displayDataOnForm,
    })
    Mercancias.#modal.show()
  }

  /**
   * Realizar peticiones POST a la API con endpoint "mercancia"
   */
  static async #add() {
    try {
      // Validar formulario de adición de mercancías
      if (!Helpers.okForm('#form-mercancias', Mercancias.#otherValidations)) {
        Customs.toastBeforeAddRecord()
        return
      }

      // Obtener el objeto con los datos del formulario
      const body = Mercancias.#getFormData()

      // Envviar solicitud de creación con los datos del formulario
      let response = await Helpers.fetchJSON(`${urlAPI}/mercancia`, {
        method: 'POST',
        body,
      })

      if (response.message === 'ok') {
        // Añadir una fila con los datos adicionados
        Mercancias.#table.addRow(response.data)
        // "Destruir" vista de formulario
        Mercancias.#modal.remove()
        // Mostrar notificación de éxito
        Toast.show({ message: 'Agregado exitosamente' })
      } else {
        Toast.show({ message: 'No se pudo agregar el registro', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la operación de creación de registro', mode: 'danger', error: e })
    }
  }

  /**
   * Realizar peticiones PATCH a la API con endpoint "mercancia"
   */
  static async #edit(cell) {
    try {
      // verificar formulario
      if (!Helpers.okForm('#form-mercancias', Mercancias.#otherValidations)) {
        return
      }

      // Obtener objeto con los datos del formulario
      const body = Mercancias.#getFormData()

      // Establecer la url a la cual se hará la solicitud PATCH
      // la url contiene el ID de la mercancía que se actualizará
      const url = `${urlAPI}/mercancia/${cell.getRow().getData().id}`

      // Realizar solicitud de actualización a la API
      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body,
      })

      if (response.message === 'ok') {
        Toast.show({ message: 'Mercancía actualizada exitosamente' })
        cell.getRow().update(response.data)
        Mercancias.#modal.remove()
      } else {
        Toast.show({ message: 'No se pudo actualizar la mercancía', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'No se pudo actualizar la mercancía', mode: 'danger', error: e })
    }
  }

  /**
   * Realizar peticiones DELETE a la API con endpoint "mercancia"
   */
  static async #delete(cell) {
    try {
      const url = `${urlAPI}/mercancia/${cell.getRow().getData().id}`

      // Realizar solicitud de eliminación
      let response = await Helpers.fetchJSON(url, {
        method: 'DELETE',
      })

      if (response.message === 'ok') {
        Toast.show({ message: 'Mercancía eliminada exitosamente' })
        // Eliminar fila
        cell.getRow().delete()
        Mercancias.#modal.remove()
      } else {
        Toast.show({ message: 'No se pudo eliminar la mercancía', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'No se pudo eliminar la mercancía', mode: 'danger', error: e })
    }
  }

  /**
   * Editar y mostrar datos de un regsitro
   */
  static #displayDataOnForm(idModal, rowData) {
    // referenciar el select "cliente"
    const selectCustomers = document.querySelector(`#${idModal} #cliente`)
    // asignar la lista de opciones al select "cliente" de mercancias.html
    selectCustomers.innerHTML = Mercancias.#customers

    if (Mercancias.#currentOption === 'edit') {
      // Mostrar los datos de la fila actual en el formulario html
      document.querySelector(`#${idModal} #id`).value = rowData.id
      document.querySelector(`#${idModal} #contenido`).value = rowData.contenido
      document.querySelector(`#${idModal} #alto`).value = rowData.alto
      document.querySelector(`#${idModal} #ancho`).value = rowData.ancho
      document.querySelector(`#${idModal} #largo`).value = rowData.largo
      document.querySelector(`#${idModal} #ingreso`).value = rowData.fechaHoraIngreso
      document.querySelector(`#${idModal} #salida`).value = rowData.fechaHoraSalida
      document.querySelector(`#${idModal} #bodega`).value = rowData.bodega
      // Seleccionar cliente correspondiente
      selectCustomers.value = rowData.cliente.id
    } else {
      // Asignar fecha-hora actual por defecto al formulario
      const now = DateTime.now()
      document.querySelector(`#${idModal} #ingreso`).value = now.toFormat('yyyy-MM-dd HH:mm')
      // Establecer como hora de salida la hora actual + 1 hora
      document.querySelector(`#${idModal} #salida`).value = now.plus({ hour: 1 }).toFormat('yyyy-MM-dd HH:mm')
    }
  }

  /**
   * Obtener los valores del formulario
   * @returns Objeto con las claves:valor del formulario
   */
  static #getFormData() {
    return {
      id: document.querySelector(`#${Mercancias.#modal.id} #id`).value,
      cliente: document.querySelector(`#${Mercancias.#modal.id} #cliente`).value,
      contenido: document.querySelector(`#${Mercancias.#modal.id} #contenido`).value,
      alto: parseFloat(document.querySelector(`#${Mercancias.#modal.id} #alto`).value),
      ancho: parseFloat(document.querySelector(`#${Mercancias.#modal.id} #ancho`).value),
      largo: parseFloat(document.querySelector(`#${Mercancias.#modal.id} #largo`).value),
      fechaHoraIngreso: document.querySelector(`#${Mercancias.#modal.id} #ingreso`).value,
      fechaHoraSalida: document.querySelector(`#${Mercancias.#modal.id} #salida`).value,
      bodega: document.querySelector(`#${Mercancias.#modal.id} #bodega`).value,
    }
  }

  static #otherValidations() {
    //Referencie los elementos <select> clientes
    const selectClient = document.querySelector(`#${Mercancias.#modal.id} #cliente`).value
    console.log(selectClient)

    //Si cliente es ""
    if (selectClient == '') {
      Toast.show({ message: 'Falta seleccionar un cliente', mode: 'warning' })
      return false
    }

    return true
  }
}
