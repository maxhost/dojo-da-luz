import { test } from 'node:test'
import assert from 'node:assert/strict'
import { idDeYoutube, miniaturaDeYoutube, reproductorDeYoutube } from './youtube.ts'

/**
 * El cliente pega lo que le da el boton "Compartir" de YouTube, que no es una sola forma.
 * Lo que se prueba es que las formas que reparte YouTube lleguen todas al mismo video, y
 * que lo que no es un video de YouTube no entre.
 */

const ID = 'dQw4w9WgXcQ'

test('las formas que reparte YouTube dan todas el mismo id', () => {
  const enlaces = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=Ab1Cd2Ef3Gh4`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/watch?v=${ID}&list=PL123&index=2`,
    `  https://www.youtube.com/watch?v=${ID}  `,
  ]

  for (const enlace of enlaces) {
    assert.equal(idDeYoutube(enlace), ID, `no reconocio ${enlace}`)
  }
})

test('lo que no es un video de YouTube no entra', () => {
  const rechazados = [
    '',
    'dQw4w9WgXcQ',
    'https://vimeo.com/76979871',
    'https://www.youtube.com/',
    'https://www.youtube.com/@dojodaluz',
    'https://www.youtube.com/watch?v=corto',
    'https://www.youtube.com/watch?list=PL123',
    // El dominio tiene que ser YouTube, no terminar en algo parecido.
    `https://youtube.com.ejemplo.net/watch?v=${ID}`,
    `javascript:alert(1)//youtube.com/watch?v=${ID}`,
  ]

  for (const enlace of rechazados) {
    assert.equal(idDeYoutube(enlace), null, `acepto ${enlace}`)
  }
})

test('la miniatura es hqdefault, que existe para todos los videos', () => {
  assert.equal(miniaturaDeYoutube(ID), `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`)
})

test('el reproductor es el dominio sin cookies', () => {
  assert.match(reproductorDeYoutube(ID), /^https:\/\/www\.youtube-nocookie\.com\/embed\//)
})
