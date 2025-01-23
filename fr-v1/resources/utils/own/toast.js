/**
 * Basado en
 * https://codepen.io/ng-ngc-sn-the-bashful/pen/Exgmxqp
 */

/**
 * Mostrar alertas con mensajes para el usuario (Puede mandar errores, saldrán en consola)
 * ### Ejemplo de uso:
 * ```javascript
 * Toast.show({
 *   title: 'Sistema de ventas',
 *   message: 'Cargando producto...', // Puede contener HTML
 *   mode: 'success', // también: 'info' | 'warning' | 'danger'
 *   duration: 5000, // Milisegundos
 * })
 * ```
 * @author Carlos Cuesta Iglesias
 * @copyright https://codepen.io/ng-ngc-sn-the-bashful/pen/Exgmxqp
 */
export default class Toast {
  /**
   * Crear la alerta con su contenido y mostrarla en pantall
   * @param {*} => Un objeto con {**title**: Optional, **message**, **mode**: Optional, **duration**: Optional, **error**. Optional}
   */
  static async show({ title = '', message = '', mode = 'info', duration = 3000, error = null }) {
    const body = document.querySelector('body')
    // Verificar si ya existe un "Toast", de ser así se remueve del "body" :)
    body.contains(document.querySelector('#toast')) ? body.removeChild(document.querySelector('#toast')) : null

    body.insertAdjacentHTML('beforeend', '<dialog id="toast"></dialog>')
    const container = document.querySelector('#toast')
    const toast = document.createElement('div')

    // remover el toast automáticamente
    const autoRemoveId = setTimeout(function () {
      // container.removeChild(toast)
      toast.remove()
      // Remover contenedor del "Toast"
      container.remove()
    }, duration + 1000)

    // remover el toast cuando se pulse clic
    toast.onclick = function (e) {
      if (e.target.closest('.toast__close')) {
        //main.removeChild(toast)
        toast.remove()
        // Remover contenedor del "Toast"
        container.remove()
        clearTimeout(autoRemoveId)
      }
    }

    const type = {
      success: icons.checkCircleFill,
      info: icons.infoCircleFill,
      warning: icons.exclamationCircleFill2,
      danger: icons.xCircleFill,
    }
    const iconType = type[mode]
    const delay = (duration / 1000).toFixed(2)

    toast.classList.add('mytoast', `toast--${mode}`)
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`

    toast.innerHTML = `
    <div class="toast__icon">
    <i class="">${iconType}</i>
    </div>
    <div class="toast__body">
    <h3 class="toast__title">${title}</h3>
    <p class="toast__msg">${message}</p>
    </div>
    <div class="toast__close">
    <i>${icons.xLg}</i>
    </div>
    `
    if (error) {
      console.error(error)
    }
    container.appendChild(toast)
    container.show()
  }
}
