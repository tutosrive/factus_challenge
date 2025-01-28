// importación estática de módulos necesarios
// los import locales de JS tienen rutas relativas a la ruta del script que hace el enrutamiento
import * as Popper from '../utils/popper/popper.min.js'
import * as bootstrap from '../utils/bootstrap-5.3.3/js/bootstrap.bundle.min.js'
import { TabulatorFull as Tabulator } from '../utils/tabulator-6.3/js/tabulator_esm.min.js'
import { DateTime, Duration } from '../utils/luxon3x.min.js'
import icons from '../utils/own/icons.js'
import Helpers from '../utils/own/helpers.js'
import Popup from '../utils/own/popup.js'
import Toast from '../utils/own/toast.js'
import * as Customs from './customs.mjs'
import Inicio from './inicio.mjs'

class App {
  static async main() {
    const config = await Helpers.fetchJSON('/resources/assets/config.json')
    window.urlAPI = config.url
    window.icons = icons
    window.DateTime = DateTime
    window.DateTime.local().setLocale('es-CO')

    window.formatDateTime = {
      inputFormat: 'dd-MM-yyyy hh:mm:ss a', // Formato de entrada para "23-01-2025 09:16:27 PM"
      outputFormat: "hh:mm a, 'del' cccc dd 'de' LLLL 'de' yyyy",
      invalidPlaceholder: 'fecha inválida',
      locale: 'es-CO',
    }

    window.Customs = Customs
    window.Home = Inicio

    window.Duration = Duration
    window.Helpers = Helpers
    window.Tabulator = Tabulator
    window.Toast = Toast
    window.Modal = Popup
    window.current = null
    // lo siguiente es para estandarizar el estilo de los botones usados para add, edit y delete en las tablas
    window.addRowButton = `<button id='add-row' class='btn btn-info btn-sm'>${icons.plusSquare}&nbsp;&nbsp;Nuevo registro</button>`
    window.addProductButton = `<button id='add-product' class='btn btn-info btn-sm'>${icons.plusSquare}&nbsp;&nbsp;Agregar producto</button>`
    window.editRowButton = () => `<button id="edit-row" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar">${icons.edit}</button>`
    window.deleteRowButton = () => `<button id="delete-row" class="border-0 bg-transparent d-inline" data-bs-toggle="tooltip" title="Eliminar">${icons.delete}</button>`

    // lo siguiente es para estandarizar los botones de los formularios
    window.addButton = `${icons.plusSquare}&nbsp;&nbsp;<span>Agregar</span>`
    window.editButton = `${icons.editWhite}&nbsp;&nbsp;<span>Actualizar</span>`
    window.deleteButton = `${icons.deleteWhite}<span>Eliminar</span>`
    window.cancelButton = `${icons.xLg}<span>Cancelar</span>`
    window.tableHeight = 'calc(100vh - 190px)' // la altura de todos los elementos de tipo Tabulator que mostrará la aplicación

    try {
      // confirmación de acceso a la API REST
      const response = await Helpers.fetchJSON(`${urlAPI}/`)
      console.log(response)
      let option = ''

      if (response.status === 200) {
        const extract_href = /[^/]+\.html$/
        option = window.location.href
        option = option.match(extract_href)[0]
        if (option === 'index.html') Toast.show({ title: '¡Bienvenido!', message: 'Bienvenido al reto FACTUS - SRM', duration: 1000 })
        App.#mainMenu(option)
      } else {
        Toast.show({ message: 'Problemas con el servidor de datos', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la conexión con el servidor de datos', mode: 'danger', error: e })
    }
    return true
  }

  /**
   * Determina la acción a llevar a cabo según la opción elegida en el menú principal
   * @param {String} option El texto del ancla seleccionada
   */
  static async #mainMenu(option) {
    try {
      if (option === 'index.html') {
        document.querySelector('body').classList.add('bodyHome')
      } else {
        document.querySelector('body').classList.remove('bodyHome')
      }

      switch (option) {
        case 'index.html':
          App.#loadHome()
          // document.querySelector('main').innerText = ''
          break
        case 'factus.html':
          const { default: Factus } = await import('./factus.mjs')
          Factus.init()
          break
        case 'cliente.html':
          const { default: Clientes } = await import('./clientes.mjs')
          Clientes.init()
          break
        case 'about.html':
          const { default: About } = await import('./about.mjs')
          About.init()
          break
        case 'factusget.html':
          const { default: FactuSearch } = await import('./factusearch.mjs')
          FactuSearch.init()
          break
        default:
          if (option !== 'Envíos') {
            Toast.show({ message: `La opción ${option} no ha sido implementada`, mode: 'warning', delay: 3000, close: false })
          }
      }
    } catch (e) {
      Toast.show({ message: `Falló la carga del módulo ${option}`, mode: 'danger', error: e })
    }
  }

  /**
   * Carga la página inicial
   */
  static #loadHome() {
    Home.init()
  }
}

App.main()
