/**
 * Mostrar una "alerta" (Toast) cuando el formulario es incǘalido y
 * se presiona el botón "Añadir" del "Dialog"
 * @param {String} msg Mensaje de alerta
 * @param {boolean} just ¿Debe incluirse solo el mensaje enviado?
 */
export function toastBeforeAddRecord(msg = null, just = false) {
  const span = msg ?? 'Debe <span class="text-warning">completar</span> el formulario'
  let message = ''
  if (just === true) {
    message = msg
  } else {
    message = `${span} antes de presionar el botón <button class="btn btn-primary">${addButton}</button>`
  }
  Toast.show({ message, mode: 'warning', duration: 5000 })
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

export const classesModal = 'position-absolute top-50 start-50 translate-middle bg-dark col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7'

/**
 * Crear popover
 * @param {String} title Título del popover
 * @param {String} message Mensaje/Contenido del popover. Puede tener sintaxis HTML
 * @param {String} buttons Con sintaxis HTML. Botones que tendrá el popover (en el footer)
 * @param {String} classPop Lista de clases separadas por un espacio, se aplicarán al popover
 * @returns
 */
export function popover(title = '', message = '', buttons = [], classPop = null) {
  const body = document.querySelector('body')
  let buttonsPop = ''
  const pop = document.createElement('div')
  if (classPop !== null) {
    const classes = classPop.split(' ')
    pop.classList.add(...classes)
  }

  body.querySelector('#pop-pup') ? body.querySelector('#pop-pup').remove() : null
  pop.setAttribute('popover', 'manual')
  pop.id = `pop-pup-${Helpers.idRandom()}`

  buttons.forEach((btn) => {
    buttonsPop += `<div class="col">${btn}</div>`
  })

  pop.innerHTML = `
    <div class="p-4" style="max-width: 450px;">
      <div class="pop-header">
      <h5 class="pop-title">${title}</h5>
      </div>
      <hr>
      <div class="pop-body overflow-y-auto" style="max-height: 60vh">
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
  document.querySelectorAll('body > *').forEach((e) => e.addEventListener('click', __block_events))
  document.querySelector('body').style.filter = 'blur(2px)'
}

function __block_events(ev) {
  ev.preventDefault()
  ev.stopPropagation()
}

/**
 * Cerrar popover (Eliminar)
 * @param {*} pop Elemento HTML con atributo **popover**
 */
export function closePopover(pop) {
  // pop.hidePopover()
  pop.remove()
  document.querySelectorAll('body > *').forEach((e) => e.removeEventListener('click', __block_events))
  document.querySelector('body').style.filter = ''
}

export async function new_client() {
  try {
    window.open('/pages/cliente.html', '_blank')
  } catch (error) {
    console.warn(error)
  }
}
