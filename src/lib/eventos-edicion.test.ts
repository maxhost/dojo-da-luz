import { test } from 'node:test'
import assert from 'node:assert/strict'
import { eventosDesdeForm } from './eventos-edicion.ts'
import { eventsSchema } from './schemas.ts'

/**
 * `photoFoco` (spec 0052, ADR-0048): lo arma `CampoFoco` con un clic, nunca se escribe a
 * mano, pero el schema igual valida la forma — es la unica garantia contra un POST forjado.
 */

const UNO = {
  title: 'Aula aberta',
  date: '12 de dezembro',
  location: 'Dojo da Luz · Lisboa',
  description: 'Descrição de prueba con mas de diez caracteres.',
  photo: 'https://ejemplo.test/evento.webp',
  photoAlt: 'Foto del evento',
}

function form(items: Record<string, string>[]): FormData {
  const fd = new FormData()
  items.forEach((item, i) => {
    for (const [clave, valor] of Object.entries(item)) fd.append(`items[${i}].${clave}`, valor)
  })
  return fd
}

test('photoFoco vacio es valido: el recorte queda centrado, como siempre', () => {
  const datos = eventosDesdeForm(form([{ ...UNO, photoFoco: '' }])) as any
  assert.equal(datos.items[0].photoFoco, '')
})

test('eventsSchema acepta photoFoco vacio', () => {
  const datos = eventosDesdeForm(form([{ ...UNO, photoFoco: '' }])) as any
  const validado = eventsSchema.safeParse({
    seo: { title: 't', description: 'd' },
    chrome: { caption: 'c', menuLabel: 'm', skipLink: 's' },
    eyebrow: 'e', title: 't', lead: 'l',
    heroPhoto: 'https://ejemplo.test/hero.webp',
    items: datos.items,
    emptyText: 'vacio',
  })
  assert.equal(validado.success, true)
})

test('eventsSchema acepta un foco con forma "X% Y%"', () => {
  const datos = eventosDesdeForm(form([{ ...UNO, photoFoco: '64% 18%' }])) as any
  const validado = eventsSchema.safeParse({
    seo: { title: 't', description: 'd' },
    chrome: { caption: 'c', menuLabel: 'm', skipLink: 's' },
    eyebrow: 'e', title: 't', lead: 'l',
    heroPhoto: 'https://ejemplo.test/hero.webp',
    items: datos.items,
    emptyText: 'vacio',
  })
  assert.equal(validado.success, true)
})

test('eventsSchema rechaza un foco forjado sin la forma "X% Y%"', () => {
  const datos = eventosDesdeForm(form([{ ...UNO, photoFoco: 'arriba a la izquierda' }])) as any
  const validado = eventsSchema.safeParse({
    seo: { title: 't', description: 'd' },
    chrome: { caption: 'c', menuLabel: 'm', skipLink: 's' },
    eyebrow: 'e', title: 't', lead: 'l',
    heroPhoto: 'https://ejemplo.test/hero.webp',
    items: datos.items,
    emptyText: 'vacio',
  })
  assert.equal(validado.success, false)
  if (!validado.success) {
    assert.equal(validado.error.issues[0]!.path.join('.'), 'items.0.photoFoco')
  }
})

test('eventsSchema rechaza un porcentaje fuera de 0-100', () => {
  const datos = eventosDesdeForm(form([{ ...UNO, photoFoco: '150% 50%' }])) as any
  const validado = eventsSchema.safeParse({
    seo: { title: 't', description: 'd' },
    chrome: { caption: 'c', menuLabel: 'm', skipLink: 's' },
    eyebrow: 'e', title: 't', lead: 'l',
    heroPhoto: 'https://ejemplo.test/hero.webp',
    items: datos.items,
    emptyText: 'vacio',
  })
  assert.equal(validado.success, false)
})
