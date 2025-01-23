export default class Estados {
  static #states
  static #table
  static #modal
  static #currentOpt
  static #form // Formulario para agregar estados
  static #intervalId // Por si un día se requiere eliminar el setinterval() en el input "fecha-hora"
  static #fechaHoraInput // true cuando se activa el evento "input" en '#fecha-hora-add'

  constructor() {
    throw new Error('No se necesitan instancias de esta clase. Use Estados.init()')
  }

  static async init() {
    try {
      Estados.#fechaHoraInput = false
      // Tratar de cargar la lista de estados
      let response = await Helpers.fetchJSON(`${urlAPI}/envio/estados/`)
      if (response.message !== 'ok') {
        return
      }

      // Carga de la lista de estados en el atributo de clase
      Estados.#states = response.data

      // Insertar sección del HTML
      document.querySelector('main').innerHTML = await Helpers.fetchText('./resources/html/estadosEnvios.html')

      // Invisibilizar el contenedor de información cuando el valor del selector de tipos cambia
      document.querySelector('#tipo-envio').addEventListener('change', () => {
        document.querySelector('#container-info').style.visibility = 'hidden'
      })

      // Agregar los tipos de Envíos al <select> de Tipos
      document.querySelector('#tipo-envio').innerHTML = Helpers.toOptionList({
        items: [
          { tipo: 'Bultos', valor: 'bulto' },
          { tipo: 'Sobres', valor: 'sobre' },
          { tipo: 'Cajas', valor: 'caja' },
          { tipo: 'Paquetes', valor: 'paquete' },
        ],
        text: 'tipo',
        value: 'valor',
        firstOption: 'Seleccione un tipo',
      })

      // Iniciar "intervalo" de actualización de la fecha
      Estados.#updateDate('#fecha-hora')

      // Añadir evento "click" al botón de búsqueda
      document.querySelector('#buscar-envio').addEventListener('click', e => {
        e.preventDefault()
        // Realizar búsqueda
        Estados.#search()
      })
    } catch (e) {
      Toast.show({ message: 'Fallo la carga de la información', error: e, mode: 'danger' })
    }
    return true
  }

  /**
   * Mostrar información del Estado que se eliminará
   * @param {*} e Evento de Tabulator
   * @param {Object} cell **Componente** celda de Tabulator
   */
  static #showInfoDelete = async (e, cell) => {
    Estados.#currentOpt = 'delete'
    Estados.#modal = new Modal({
      modal: false,
      classes: 'position-absolute top-50 start-50 translate-middle bg-dark col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7',
      title: '<h5>Eliminación de estados</h5>',
      content: `<span class="text-back dark:text-gray-300">
                  Confirme la eliminación del estado:<br>
                  ${Estados.#getState('estado', cell)} - ${Estados.#getState('fechaHora', cell)}
                </span>`,
      buttons: [
        { caption: deleteButton, classes: 'btn btn-primary me-2', action: () => Estados.#updateStates(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Estados.#modal.remove() },
      ],
    })
    Estados.#modal.show()
  }

  /**
   * Mostrar el formulario para el ingreso del nuevo estado
   * @param {*} e Evento de Tabulator
   * @param {*} cell Componente "**celda**" de Tabulator
   */
  static async #addShow() {
    Estados.#currentOpt = 'add'
    Estados.#form = await Helpers.fetchText('./resources/html/ingresoEstados.html')

    Estados.#modal = new Modal({
      modal: false,
      // classes: 'position-absolute top-50 start-50 translate-middle bg-dark col-10 col-sm-8 col-md-6 col-lg-5 col-xl-4',
      classes: 'position-absolute top-50 start-50 translate-middle bg-dark col-10 col-md-8 col-lg-6 col-xl-5',
      title: '<h5>Agregar estados</h5>',
      content: Estados.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Estados.#updateStates() },
        {
          caption: cancelButton,
          classes: 'btn btn-secondary',
          action: () => {
            /*
             * Lo necesito así porque en Estados.#getFormData() obtengo el valor de "tipo estado", el cual
             * esta en el "Modal", por tanto, si modal no existe, generará un error :)
             */
            Estados.#modal.remove()
            Estados.#currentOpt = '' // Necesario para el Estados.#getDataForm()
            Estados.#fechaHoraInput = false
          },
        },
      ],
      doSomething: () => {
        Estados.#removeStateSelected()
        Estados.#dateController()
      },
    })
    Estados.#modal.show()
  }

  /**
   * Eliminar del <select> el estado registrado en la tabla
   */
  static #removeStateSelected() {
    document.querySelector('#_close').addEventListener('click', () => {
      Estados.#currentOpt = '' // Necesario para el Estados.#getDataForm()
    })
    // Eliminar las opciones de estados que ya se encuentran en la tabla
    Estados.#table.getData().forEach(e => {
      document.querySelector(`#tipo-estado option[value="${e.estado}"]`).remove()
    })
  }

  /**
   * "Controlar" el intervalo de la fecha del estado a añadir
   */
  static #dateController() {
    Estados.#updateDate('#fecha-hora-add', false)
    // "Liberar" la fecha-hora del intervalo de ejecución, cuando se quiere ingresar manualmente
    document.querySelector('#fecha-hora-add').addEventListener('input', () => {
      clearInterval(Estados.#intervalId)
      Estados.#fechaHoraInput = true
    })
  }

  /**
   * Actualizar fecha cada segundo
   * @param {String} selector Cadena de texto que contiene el tipo y nombre del selector de elemento
   * @param {boolean} format ¿Se pasará la fecha a un formato "**humanizado**"?
   */
  static #updateDate(selector = null, format = true) {
    const element = document.querySelector(selector)
    const dateNow = () => {
      const date = DateTime.now()
      const val = format ? date.toFormat('yyyy/MM/dd, hh:mm:ss a') : date.toISO().slice(0, 19)
      // Se debe verificar que el elemento exista (Cuando se cambia de "opción" hay un pequeño retardo y este elemento pasa a ser null)
      if (element) {
        element.value = val
      }
    }
    // Cargar fecha desde el primer momento
    dateNow()
    // Establecer un intervalo de ejecución
    // Ejecutar cada segundo, si establezco cada minuto, habrá un retraso
    Estados.#intervalId = setInterval(() => {
      dateNow()
    }, 1000)
  }

  /**
   * Buscar estados de un envío
   */
  static async #search() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-estados')) {
        return
      }
      // Mostrar información sobre como usar el crud básico
      Customs.showInfoAboutUse('estados')

      // Datos del "formulario" (nroGuia, tipo)
      const formData = Estados.#getDataForm()

      // Buscar Envío por su "tipo" y su "nroGuia"
      const envio = await Helpers.fetchJSON(`${urlAPI}/${formData.tipo}/id/${formData.nroGuia}`)

      // Visibilizar el contenedor de información
      document.querySelector('#container-info').style.visibility = 'visible'

      // Validar si existe el Envío
      if (envio.message === 'ok') {
        Estados.#displayDataOnSearch(envio.data)
      } else {
        Estados.#displayDataOnError(envio.message)
        Toast.show({ message: envio.message, error: envio, mode: 'danger' })
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
    Estados.#createTable(response)
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
    Estados.#table = new Tabulator('#table-container', {
      height: '27vh',
      data: response.estados,
      layout: 'fitColumns',
      columns: [
        { formatter: deleteRowButton, width: 40, cellClick: Estados.#showInfoDelete },
        {
          title: 'Hora y fecha',
          field: 'fechaHora',
          formatter: cell => Estados.#getState('fechaHora', cell),
        },
        {
          title: 'Estado',
          field: 'estado',
          formatter: cell => Estados.#getState('estado', cell),
        },
      ],
      responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
      initialSort: [
        // establecer el ordenamiento inicial de los datos
        { column: 'fechaHora', dir: 'asc' },
      ],
      columnDefaults: {
        tooltip: true, //show tool tips on cells
      },
      footerElement: `<div id="addState" class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
    })

    // Se hace un forEach() de los elementos "#add-row" porque al momento de buscar, se muestra un Toast de info, con este mismo botón (funcional)
    Estados.#table.on('tableBuilt', () => document.querySelectorAll('#add-row').forEach(e => e.addEventListener('click', Estados.#addShow)))
  }

  /**
   * Actualizar estados (add/remove)
   * @param {Object} cell Componente celda de **Tabulator**
   * */
  static async #updateStates(cell = null) {
    try {
      // Validar el <select> estados está en la opción "Seleccione un estado"
      if (Estados.#getDataForm().estado === 'Seleccione un estado') {
        // Código comentado, ví que se podía reutilizar... (Customs.toastBeforeAddRecord(span))
        // Toast.show({
        //   message: `Debe "<span class="text-warning">seleccionar un estado</span>" antes
        //   de presionar el botón <button class="btn btn-primary me-2">${addButton}</button>`,
        //   mode: 'warning',
        // })
        Customs.toastBeforeAddRecord('Debe "<span class="text-warning">seleccionar un estado</span>"')
        return
      }

      // Validar estados
      if (!Estados.#verifyStates(cell)) {
        // Estados.#updateDate('#fecha-hora-add', false)
        return
      }

      let msg // Mensaje seún opción ("eliminó" || "agregó")
      const info = Estados.#getDataForm()
      switch (Estados.#currentOpt) {
        case 'delete':
          msg = '<span class="text-danger">eliminó</span>'
          cell.getRow().delete()
          break
        case 'add':
          msg = '<span class="text-info">agregó</span>'
          Estados.#table.addRow([{ estado: info.estado, fechaHora: info.fechaHora }])
          break
      }
      const data = { estados: Estados.#table.getData() }

      // Ruta de solicitud
      const url = `${urlAPI}/${info.tipo}/${info.nroGuia}`
      // Realizar solicitud a la API
      let response = await Helpers.fetchJSON(url, {
        method: 'PATCH',
        body: data,
      })

      // Validar respuesta de la API
      if (response.message === 'ok') {
        Toast.show({ message: `Se ${msg} el estado correctamente` })
        Estados.#modal.remove()
      } else {
        /*
         * Se ejecuta cuando el front-end "deja" pasar solicitudes erróneas (Un estado en posición incorrecta),
         * el backend envía un error con el filtro => Ej: "El primer estado debe ser Recibido"
         */
        Toast.show({ message: response.message, error: response, mode: 'danger' })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la actualización de estados', error: e, mode: 'danger' })
    }
  }

  /**
   * "**Humanizar**" un/a *fecha/TipoEstado*
   * @param {Object} cell Componente "celda" que proviene de **Tabulator.formatter**
   * @param {String} field Nombre del campo que se formateará.
   * @returns Un/a hora/estado "**Humanizado/a**"
   * ```javascript
   * // Ejemplo de uso
   *  Estados.#getState('estado', cell)
   * // Si estado de cell = "RECIBIDO", return = "Recibido"
   * ```
   */
  static #getState(field = null, cell = null) {
    let state
    switch (field) {
      case 'fechaHora':
        // Valor actual de "fechaHora" actual
        const fechaHora = Estados.#currentOpt === 'delete' ? cell.getRow().getData().fechaHora : cell.getValue()
        // "Parsear"/convertir string 'fechaHora' a tipo DateTime, con un locale
        const fecha = DateTime.fromISO(fechaHora).setLocale('es-CO')
        // String formateado (año-mes-dia hora-minuto-segundo)
        const fechaNormalized = `${fecha.toFormat('yyyy-MM-dd HH:mm:ss')}`
        // String formateado ("Humanizado" 100% :)
        const fechaHumanized = `${fecha.toFormat('hh-mm a')} del ${fecha.toFormat('cccc dd')} de ${fecha.toFormat('LLLL')} de ${fecha.toFormat('yyyy')}`
        return Estados.#currentOpt === 'delete' ? fechaNormalized : fechaHumanized
      case 'estado':
        // Valor actual de "estado" actual
        const stateActual = Estados.#currentOpt === 'delete' ? cell.getRow().getData().estado : cell.getValue()
        // Buscar el valor "Humanizado" según el TIPO ESTADO
        state = Estados.#states.find(val => stateActual === val.key)
        // Retornar el valor "Humanizado" del TIPO ESTADO
        return state.value
      default:
        state = Estados.#states.find(val => field === val.key)
        // Retornar el valor "Humanizado" del TIPO ESTADO
        return state.value
    }
  }

  /**
   * Obtener los datos ingresados en el formulario, según la opción actual ('add' || 'delete')
   * @returns Un objeto con los datos obtenidos
   */
  static #getDataForm() {
    const dataSearch = {
      nroGuia: document.querySelector('#form-estados #nroGuia').value.toUpperCase(),
      tipo: document.querySelector('#form-estados #tipo-envio').value,
    }
    return Estados.#currentOpt === 'add'
      ? {
          ...dataSearch,
          estado: document.querySelector(`#${Estados.#modal.id} #tipo-estado`).value,
          fechaHora: document.querySelector(`#${Estados.#modal.id} #fecha-hora-add`).value,
        }
      : dataSearch
  }

  /**
   * Ejecutar validaciones de estados antes de "actualizar"
   * @param {*} cell Componente celda de Tabulator (Sólo es necesario cuando se va a eliminar)
   * @returns
   */
  static #verifyStates(cell = null) {
    const statesTable = Estados.#table.getData()

    // Validar opciones antes de eliminar
    switch (Estados.#currentOpt) {
      case 'delete':
        return Estados.#verifyBeforeDelete(statesTable, cell)
      case 'add':
        return Estados.#verifyBeforeAdd(statesTable)
    }
  }

  /**
   * Validar estado antes de eliminar
   * @returns boolean. true: Sin errores || false: Hay errores
   */
  static #verifyBeforeDelete(statesTable, cell) {
    const states = cell ? cell.getRow().getData() : Estados.#getDataForm()
    const stateHuman = Estados.#getState(states.estado, cell)
    // Cuando se quiere eliminar el estado 'RECIBIDO'
    if (states.estado === 'RECIBIDO') {
      Toast.show({
        message: `No se puede eliminar un estado de tipo <span class="text-warning">${stateHuman}</span>`,
        mode: 'warning',
        error: `El estado ${states.estado} no se puede eliminar`,
      })
      return false
    }
    // caso envío entregado
    else if (statesTable[statesTable.length - 1].estado === 'ENTREGADO') {
      Toast.show({ message: `El envío <span class="text-warning">${Estados.#getDataForm().nroGuia}</span> ha sido entregado. No se pueden actualizar sus estados`, mode: 'warning' })
      return false
    }
    // Si no hay errores
    return true
  }

  /**
   * Verificar estado antes de agregar
   * @param {*} states Objeto con los estados del envío actual
   * @returns boolean. **true**: Sin errores || **false**: Hay errores
   */
  static #verifyBeforeAdd(states) {
    let ok = true
    const nroGuia = Estados.#getDataForm().nroGuia
    // Último estado (de la tabla)
    const lastState = states[states.length - 1].estado
    // Estado que se añadirá (si cumple las condiciones)
    const stateToAdd = Estados.#getDataForm().estado
    // Estado que se añadirá (con formato humano => Enum.getValue())
    const stateToAddHuman = Estados.#getState(stateToAdd).toLowerCase()

    // Último estado (con formato humano => Enum.getValue())
    const lastHuman = Estados.#getState(lastState).toLowerCase()
    // Para ahorrar código :) Se usará muchas veces abajo
    const toastError = (before, stateOptional) => {
      const span = before === true ? 'antes de' : 'depués de' // Refactorizar?? línea 271 evita un estado anterior a...
      const stateLast = stateOptional ? Estados.#getState(stateOptional).toLowerCase() : lastHuman
      Toast.show({ message: `No se permite el estado <strong class="text-warning">${stateToAddHuman}</strong> ${span} <strong class="text-warning">${stateLast}</strong>`, error: `La posición en la cual se ingresó el estado ${stateToAdd} es incorrecta, no es permitido ${span} el estado ${stateLast.toUpperCase()}`, mode: 'warning' })
    }

    // Validar fecha antes de verificar estados
    if (Estados.#verifyDate(Estados.#getDataForm().fechaHora) === true) {
      // Validar último estado, respecto al nuevo estado
      switch (lastState) {
        case 'ENTREGADO':
          // Toast con el mensaje de "ERROR"
          toastError()
          ok = false
          break
        case 'RECIBIDO':
          if (stateToAdd !== 'EN_PREPARACION') {
            // Toast con el mensaje de "ERROR"
            toastError(true, 'EN_PREPARACION')
            ok = false
          }
          break
        case 'EN_PREPARACION':
          if (stateToAdd !== 'ENVIADO') {
            // Toast con el mensaje de "ERROR"
            toastError(true, 'ENVIADO')
            ok = false
          }
          break
        case 'ENVIADO':
          if (stateToAdd !== 'EN_CAMINO') {
            // Toast con el mensaje de "ERROR"
            toastError(true, 'EN_CAMINO')
            ok = false
          }
          break
        case 'EN_CAMINO':
          if (!'EXTRAVIADO|REENVIADO|DEVUELTO|ENTREGADO'.includes(stateToAdd)) {
            // Toast con el mensaje de "ERROR"
            Toast.show({ messgae: 'Debe ingresar un estado válido (Extraviado, Enviado Nuevamente, Devuelto)' })
            ok = false
          }
          break
        default:
          console.error('Hay un error en verifyBeforeAdd()')
          break
      }
    } else {
      ok = false
    }

    return ok
  }

  /**
   * Validar fecha-hora antes de agregar
   * @param {*} dateAndTime
   * @returns
   */
  static #verifyDate(dateAndTime) {
    /**
     * Otros detalles a tener en cuenta con los estados
     *  es que al agregar uno, éste debe registrarse con
     *  una fecha y hora no inferior a 1 hora de la actual y no superior a 1 hora de la actual.
     */

    // Significa no se activó el evento "input", por tanto se está actualizando automáticamente
    if (Estados.#fechaHoraInput === false) {
      return true
    }
    // Se activó el evento "input", y el usaurio puede cometer errores
    else {
      let ok = false
      const date = DateTime.fromISO(dateAndTime)
      const now = DateTime.now()
      const oneHourAfter = now.plus({ hour: 1 })
      const oneHourBefore = now.minus({ hour: 1 })

      if (date > oneHourBefore && date < oneHourAfter) {
        ok = true
      }
      /**
       * Dar formato rápido a la fecha-hora
       * @param {*} dateTo
       * @returns Fecha-Hora formateada
       */
      const format = dateTo => {
        return DateTime.fromISO(dateTo).toFormat('hh:mm:ss a')
      }

      // Mostrar mensaje de precaución y reactivar la actualización de la hora automática
      if (ok === false) {
        Toast.show({ message: `La fecha a registrar, debe ser mayor a <span class="text-warning">${format(oneHourBefore)}</span> y menor a <span class="text-warning">${format(oneHourAfter)}</span>`, mode: 'warning' })
        Estados.#updateDate('#fecha-hora-add', false)
      } else {
        // Eliminar intervalo
        clearInterval(Estados.#intervalId)
      }
      return ok
    }
  }
}
