/**
 * Mostrar una "alerta" (Toast) cuando el formulario es incǘalido y
 * se presiona el botón "Añadir" del "Dialog"
 * @param {String} span Mensaje de alerta
 */
export function toastBeforeAddRecord(msg = null) {
  const span = msg ?? 'Debe <span class="text-warning">completar</span> el formulario'
  Toast.show({ message: `${span} antes de presionar el botón <button class="btn btn-primary">${addButton}</button>`, mode: 'warning', duration: 1000 })
}

/**
 * Mostrar "Toast" con información adicional sobre **como añadir y eliminar** registros :)
 * @param {String} msg Opción actual. `Ej: clientes`
 */
export function showInfoAboutUse(msg) {
  let cont // Para regular las veces que se mostrará el "Toast"
  const countOnLocalStorage = localStorage.getItem(`alertInfoOn${msg}`)
  // Verificar la existencia del contador
  if (!countOnLocalStorage) {
    // Si no existe, crearlo
    localStorage.setItem(`alertInfoOn${msg}`, 1)
    cont = countOnLocalStorage
  } else {
    // Castear el valor del contador almacenado
    cont = parseInt(countOnLocalStorage)
    // Contador menor a 3? seguir aumentando contador : null
    cont < 2 ? localStorage.setItem(`alertInfoOn${msg}`, cont + 1) : null
  }
  // Si el contador es menor a 2, el "Toast" se mostrará
  cont < 2 ? Toast.show({ message: `Puede <span class="text-info">agregar</span> ${msg} con <span class="d-inline">${addRowButton}</span> y <span class="text-danger">eliminarlos</span> con ${deleteRowButton()}` }) : null
}

// Versión original de showInfoAboutUse (copia por si la daño...)
/**
 * * export function showInfoAboutUse(msg = null) {
 *  const span = msg ?? 'registros'
 *  let cont // Para regular las veces que se mostrará el "Toast"
 *  const countOnLocalStorage = localStorage.getItem('alertInfoOnSearch')
   // Verificar la existencia del contador
 *  if (!countOnLocalStorage) {
     // Si no existe, crearlo
 *    localStorage.setItem('alertInfoOnSearch', 1)
 *    cont = countOnLocalStorage
 *  } else {
     // Castear el valor del contador almacenado
 *    cont = parseInt(countOnLocalStorage)
     // Contador menor a 3? seguir aumentanfo contador : null
 *    cont < 3 ? localStorage.setItem('alertInfoOnSearch', cont + 1) : null
 *  }
   // Si el contador es menor a 3, el "Toast" se mostrará
 *  cont < 3 ? Toast.show({ message: `Puede <span class="text-info">agregar</span> ${span} con <span class="d-inline">${addRowButton}</span> y <span class="text-danger">eliminarlos</span> con ${deleteRowButton()}` }) : null
 *}
 */

export const classesModal = 'position-absolute top-50 start-50 translate-middle bg-dark col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7'

/**
 * Crear popover
 * @param {String} title Título del popover
 * @param {String} message Mensaje/Contenido del popover. Puede tener sintaxis HTML
 * @param {String} buttons Con sintaxis HTML. Botones que tendrá el popover (en el footer)
 * @param {String} classPop Lista de clases separadas por un espacio, se aplicarán al popover
 * @returns
 */
export function popover(title = '', message = '', buttons = [], classPop = '') {
  const body = document.querySelector('body')
  let buttonsPop = ''
  const pop = document.createElement('div')
  const classes = classPop.split(' ')

  body.querySelector('#pop-pup') ? body.querySelector('#pop-pup').remove() : null
  pop.setAttribute('popover', 'manual')
  pop.classList.add(...classes)
  pop.id = `pop-pup-${Helpers.idRandom()}`

  buttons.forEach(btn => {
    buttonsPop += `<div class="col">${btn}</div>`
  })

  pop.innerHTML = `
    <div class="p-4" style="max-width: 450px;">
      <div class="pop-header">
        <h5 class="pop-title">${title}</h5>
      </div>
      <hr>
      <div class="pop-body">
        <p>${message}</p>
      </div>
      <hr>
      <div class="pop-footer card-footer">
        <div class="row mx-0 p-0 text-center">
          ${buttonsPop}
        </div>
      </div>
    </div>
  `
  body.insertAdjacentElement('beforeend', pop)
  return pop
}

/**
 * Abrir popover y aplicar blur(2px) al body
 * @param {*} pop Elemento HTML con atributo **popover**
 */
export function showPopover(pop) {
  pop.showPopover()
  document.querySelectorAll('body > *').forEach(e => {
    e.addEventListener('click', ev => {
      ev.preventDefault()
      ev.stopPropagation()
    })
  })
  document.querySelector('body').style.filter = 'blur(2px)'
}

/**
 * Cerrar popover (Eliminar)
 * @param {*} pop Elemento HTML con atributo **popover**
 */
export function closePopover(pop) {
  // pop.hidePopover()
  pop.remove()
  document.querySelector('body').style.filter = ''
}
