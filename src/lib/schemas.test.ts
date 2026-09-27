import { test } from 'node:test'
import assert from 'node:assert/strict'
import { galleryItemSchema } from './schemas.ts'

/**
 * La descripcion de un medio de galeria es opcional (spec 0064): un video sin descripcion
 * se tiene que poder publicar. Lo que sigue siendo obligatorio es el medio en si.
 */

test('un video de YouTube sin descripcion se publica', () => {
  const video = { type: 'youtube', url: 'https://youtu.be/605V86CSZac?is=8YLHLkS8643nb9Nx', alt: '' }
  assert.equal(galleryItemSchema.safeParse(video).success, true)
})

test('una foto sin descripcion se publica', () => {
  const foto = { type: 'image', src: 'https://pub-x.r2.dev/foto.webp', alt: '' }
  assert.equal(galleryItemSchema.safeParse(foto).success, true)
})

test('el medio sigue siendo obligatorio: sin enlace o con uno que no es de YouTube, no', () => {
  assert.equal(galleryItemSchema.safeParse({ type: 'youtube', url: '', alt: '' }).success, false)
  assert.equal(galleryItemSchema.safeParse({ type: 'youtube', url: 'https://vimeo.com/1', alt: '' }).success, false)
  assert.equal(galleryItemSchema.safeParse({ type: 'image', src: '', alt: 'x' }).success, false)
})
