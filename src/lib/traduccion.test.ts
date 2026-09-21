import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LISTAS_AULAS, indicesSinTraducir, propagarEstructura } from './traduccion.ts'

/**
 * El ADR-0030 dice que algo que no existe en portugues no puede existir en ingles. Lo que
 * se prueba aca es esa frase: que el largo de cada lista lo decida siempre el portugues, y
 * que propagar la estructura no pise una traduccion ya hecha.
 */

const LISTAS = ['pricing.items'] as const

const cuota = (name: string) => ({ name, price: '35 €/mês', detail: 'Até 3 aulas por semana' })

const pt = (...names: string[]) => ({
  pricing: { label: 'Quotas', items: names.map(cuota) },
  qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
})

test('una fila nueva en portugues nace en el otro idioma con el texto portugues', () => {
  const otro = propagarEstructura(pt('Normal', 'Anual'), pt('Normal'), LISTAS)

  assert.equal(otro.pricing.items.length, 2)
  assert.deepEqual(otro.pricing.items[1], cuota('Anual'))
})

test('quitar una fila en portugues la borra en el otro idioma', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [cuota('Normal'), cuota('Anual')] },
    qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal'), traducido, LISTAS)

  assert.equal(otro.pricing.items.length, 1)
  assert.equal(otro.pricing.items[0]!.name, 'Normal')
})

test('propagar no pisa lo ya traducido', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [{ name: 'Normal', price: '35 €/mes', detail: 'Hasta 3 clases por semana' }] },
    qa: { items: [{ pregunta: 'P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal', 'Anual'), traducido, LISTAS)

  assert.equal(otro.pricing.items[0]!.detail, 'Hasta 3 clases por semana')
  assert.equal(otro.pricing.items[1]!.detail, 'Até 3 aulas por semana')
})

test('lo que no es una lista declarada no se toca', () => {
  const traducido = {
    pricing: { label: 'Cuotas', items: [cuota('Normal')] },
    qa: { items: [{ pregunta: '¿P?', respuesta: 'R.' }] },
  }

  const otro = propagarEstructura(pt('Normal'), traducido, LISTAS)

  assert.equal(otro.pricing.label, 'Cuotas')
  assert.deepEqual(otro.qa.items, [{ pregunta: '¿P?', respuesta: 'R.' }])
})

test('propagar no muta el original', () => {
  const traducido = { pricing: { label: 'Cuotas', items: [cuota('Normal')] }, qa: { items: [] } }
  propagarEstructura(pt('Normal', 'Anual'), traducido, LISTAS)

  assert.equal(traducido.pricing.items.length, 1)
})

test('una fila copiada tal cual queda marcada como sin traducir', () => {
  const fuente = pt('Normal', 'Anual')
  const traducido = {
    pricing: { label: 'Cuotas', items: [{ name: 'Normal', price: '35 €/mes', detail: 'Hasta 3 clases por semana' }] },
    qa: { items: [] },
  }

  const otro = propagarEstructura(fuente, traducido, LISTAS)

  assert.deepEqual(indicesSinTraducir(fuente, otro, 'pricing.items'), [1])
})

test('las cinco listas de /aulas son las declaradas', () => {
  assert.deepEqual(
    [...LISTAS_AULAS],
    ['pricing.items', 'pricing.notes', 'children.paragraphs', 'children.facts', 'qa.items'],
  )
})

test('una lista de textos sueltos se propaga igual que una de objetos', () => {
  const fuentePt = { children: { paragraphs: ['Um.', 'Dois.'] } }
  const traducido = { children: { paragraphs: ['Uno.'] } }

  const otro = propagarEstructura(fuentePt, traducido, ['children.paragraphs'])

  assert.deepEqual(otro.children.paragraphs, ['Uno.', 'Dois.'])
})

/**
 * El ADR-0032: la imagen viaja dentro del contenido de cada idioma pero **no es de nadie
 * salvo del portugues**. Lo que se prueba es que sembrar pise la foto y no el texto.
 */

const SEMBRADOS = ['photo', 'gallery.items[].type', 'gallery.items[].src', 'gallery.items[].url']
const LISTA_MEDIOS = ['gallery.items'] as const

const foto = (src: string, alt: string) => ({ type: 'image', src, alt })

test('cambiar la foto en portugues la pisa en el otro idioma, sin tocar la descripcion', () => {
  const pt = {
    photo: 'https://cdn/nueva.webp',
    gallery: { items: [foto('https://cdn/a2.webp', 'Adultos no tatami')] },
  }
  const traducido = {
    photo: 'https://cdn/vieja.webp',
    gallery: { items: [foto('https://cdn/a1.webp', 'Adultos en el tatami')] },
  }

  const otro = propagarEstructura(pt, traducido, LISTA_MEDIOS, SEMBRADOS)

  assert.equal(otro.photo, 'https://cdn/nueva.webp')
  assert.equal(otro.gallery.items[0]!.src, 'https://cdn/a2.webp')
  assert.equal(otro.gallery.items[0]!.alt, 'Adultos en el tatami')
})

test('pasar una fila de foto a video en portugues no deja el src viejo en el otro idioma', () => {
  const pt = {
    photo: 'https://cdn/p.webp',
    gallery: { items: [{ type: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', alt: 'Vídeo' }] },
  }
  const traducido = {
    photo: 'https://cdn/p.webp',
    gallery: { items: [foto('https://cdn/a1.webp', 'Una foto')] },
  }

  const otro = propagarEstructura(pt, traducido, LISTA_MEDIOS, SEMBRADOS) as Record<string, any>

  assert.equal(otro.gallery.items[0].type, 'youtube')
  assert.equal(otro.gallery.items[0].url, 'https://youtu.be/dQw4w9WgXcQ')
  assert.ok(!('src' in otro.gallery.items[0]), 'quedo el src de la foto vieja')
  assert.equal(otro.gallery.items[0].alt, 'Una foto')
})

test('sin campos sembrados, propagar no cambia de comportamiento', () => {
  const pt = { photo: 'https://cdn/nueva.webp', gallery: { items: [foto('https://cdn/a2.webp', 'A')] } }
  const traducido = { photo: 'https://cdn/vieja.webp', gallery: { items: [foto('https://cdn/a1.webp', 'B')] } }

  const otro = propagarEstructura(pt, traducido, LISTA_MEDIOS)

  assert.equal(otro.photo, 'https://cdn/vieja.webp')
  assert.equal(otro.gallery.items[0]!.src, 'https://cdn/a1.webp')
})
