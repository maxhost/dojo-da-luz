/**
 * El editor de campos de un formulario en el navegador (spec 0050, 0057, 0062): agregar y
 * descartar campos y opciones, moverlos con flechas y mostrar las opciones segun el tipo.
 *
 * Todo va por delegacion sobre `[data-editor-campos]`: lo que se agrega despues de cargar
 * tiene que responder igual que lo que pinto el servidor.
 *
 * El `name` de cada control **no** se renumera al mover: lleva el indice con el que viajan
 * sus opciones, y renumerarlo las despegaria de su campo. Lo que dice el orden es el `orden`
 * oculto de cada fila, que se reescribe en el orden de la pantalla.
 */

const FILAS = ':scope > [data-campo-fila], :scope > [data-opcion-fila]'

function renumerar(lista: Element): void {
  lista.querySelectorAll<HTMLElement>(FILAS).forEach((fila, i) => {
    const orden = fila.querySelector<HTMLInputElement>('[data-orden]')
    if (orden) orden.value = String(i)
    const numero = fila.querySelector<HTMLElement>('[data-numero]')
    if (numero && numero.textContent?.trim().startsWith('Campo')) numero.textContent = `Campo ${i + 1}`
  })
}

function mover(fila: HTMLElement, hacia: string): void {
  const hermano = hacia === 'arriba' ? fila.previousElementSibling : fila.nextElementSibling
  if (!hermano) return

  if (hacia === 'arriba') hermano.before(fila)
  else hermano.after(fila)

  if (fila.parentElement) renumerar(fila.parentElement)
  fila.querySelector<HTMLElement>(`[data-mover="${hacia}"], [data-mover-opcion="${hacia}"]`)?.focus()
}

/**
 * El proximo indice de una lista. Sube y nunca baja: contar filas repetiria un indice
 * despues de descartar una con ✕, y dos filas con el mismo `name` se mezclarian al publicar.
 */
function siguiente(lista: HTMLElement): number {
  const n = Number(lista.dataset.siguiente ?? 0)
  lista.dataset.siguiente = String(n + 1)
  return n
}

function instanciar(plantilla: HTMLTemplateElement, reemplazos: Record<string, string>): HTMLElement {
  let html = plantilla.innerHTML
  for (const [marca, valor] of Object.entries(reemplazos)) html = html.replaceAll(marca, valor)

  const molde = document.createElement('template')
  molde.innerHTML = html.trim()
  return molde.content.firstElementChild as HTMLElement
}

/** Centrada, y no pegada al borde: abajo esta la barra fija de «Publicar». */
function enfocar(fila: HTMLElement): void {
  fila.scrollIntoView({ block: 'center' })
  fila.querySelector<HTMLInputElement>('input[name$=".label"]')?.focus({ preventScroll: true })
}

/** Solo las presentaciones que ese tipo admite. El servidor lo corrige igual. */
function alCambiarTipo(tipo: HTMLSelectElement): void {
  const fila = tipo.closest<HTMLElement>('[data-campo-fila]')!
  const opciones = fila.querySelector<HTMLElement>('[data-opciones]')
  const presentacion = fila.querySelector<HTMLSelectElement>('[data-presentacion]')

  const seleccion = tipo.value === 'singleChoice' || tipo.value === 'multipleChoice'
  if (opciones) opciones.hidden = !seleccion
  if (!presentacion || !seleccion) return

  let primera: HTMLOptionElement | null = null
  for (const opcion of presentacion.options) {
    const sirve = opcion.dataset.para === tipo.value
    opcion.hidden = !sirve
    opcion.disabled = !sirve
    if (sirve && !primera) primera = opcion
  }
  if (presentacion.selectedOptions[0]?.disabled && primera) primera.selected = true
}

document.querySelectorAll<HTMLElement>('[data-editor-campos]').forEach((editor) => {
  const lista = editor.querySelector<HTMLElement>('[data-lista-campos]')!
  const plantillaCampo = editor.querySelector<HTMLTemplateElement>('template[data-plantilla-campo]')
  const plantillaOpcion = editor.querySelector<HTMLTemplateElement>('template[data-plantilla-opcion]')

  editor.addEventListener('click', (evento) => {
    const objetivo = evento.target as HTMLElement

    if (objetivo.closest('[data-agregar-campo]') && plantillaCampo) {
      const fila = instanciar(plantillaCampo, { __I__: String(siguiente(lista)) })
      lista.append(fila)
      renumerar(lista)
      enfocar(fila)
      return
    }

    const agregarOpcion = objetivo.closest('[data-agregar-opcion]')
    if (agregarOpcion && plantillaOpcion) {
      const campo = agregarOpcion.closest<HTMLElement>('[data-campo-fila]')!
      const opciones = campo.querySelector<HTMLElement>('[data-lista-opciones]')!
      const fila = instanciar(plantillaOpcion, {
        __I__: campo.dataset.indice!,
        __J__: String(siguiente(opciones)),
      })
      opciones.append(fila)
      renumerar(opciones)
      enfocar(fila)
      return
    }

    const descartar = objetivo.closest('[data-descartar]')
    if (descartar) {
      const fila = descartar.closest<HTMLElement>('[data-opcion-fila], [data-campo-fila]')!
      const padre = fila.parentElement!
      fila.remove()
      renumerar(padre)
      return
    }

    const boton = objetivo.closest<HTMLElement>('[data-mover], [data-mover-opcion]')
    if (!boton) return
    if (boton.dataset.mover) mover(boton.closest<HTMLElement>('[data-campo-fila]')!, boton.dataset.mover)
    if (boton.dataset.moverOpcion) {
      mover(boton.closest<HTMLElement>('[data-opcion-fila]')!, boton.dataset.moverOpcion)
    }
  })

  // El bloque de opciones aparece y desaparece con el tipo, sin esperar a publicar.
  editor.addEventListener('change', (evento) => {
    const tipo = evento.target as HTMLElement
    if (tipo instanceof HTMLSelectElement && tipo.matches('[data-tipo]')) alCambiarTipo(tipo)
  })
})
