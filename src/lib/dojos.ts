import { z } from 'zod'
import {
  AUDIENCIAS,
  CONJUNCION,
  DIAS,
  DIA_LABEL,
  SEMANA_LABEL,
  VARIANTES,
  VARIANTE_LABEL,
  AUDIENCIA_LABEL,
  type Dia,
  type Locale,
} from './i18n'
import datos from '../../content/dojos.json'

/**
 * Los dojos son una entidad, no texto repetido en cuatro idiomas (ADR-0017).
 * Un JSON invalido rompe el build: un horario mal cargado tiene que aparecer al publicar,
 * no en produccion.
 */

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

const horarioSchema = z
  .object({
    audiencia: z.enum(AUDIENCIAS),
    variante: z.enum(VARIANTES).nullable(),
    dias: z.array(z.enum(DIAS)).min(1),
    desde: z.string().regex(HORA, 'hora en formato HH:MM'),
    hasta: z.string().regex(HORA, 'hora en formato HH:MM'),
  })
  .refine((h) => h.hasta > h.desde, { message: '`hasta` tiene que ser posterior a `desde`' })
  .refine((h) => new Set(h.dias).size === h.dias.length, { message: 'dias repetidos' })

/** Exportado para el BO: valida un dojo suelto y da errores por campo (spec 0021). */
export const dojoSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug en minusculas, numeros y guiones'),
  estado: z.enum(['activo', 'archivado']),
  orden: z.number().int().positive(),
  nombre: z.string().min(1),
  dojo: z.string().min(1),
  instalacion: z.string().min(1).nullable(),
  direccion: z.object({
    calle: z.string().min(1).nullable(),
    codigoPostal: z.string().min(1).nullable(),
    localidad: z.string().min(1),
    pais: z.string().length(2),
  }),
  geo: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  telefono: z.string().min(1).nullable(),
  horarios: z.array(horarioSchema).min(1),
})

export const dojosSchema = z
  .object({ dojos: z.array(dojoSchema).min(1) })
  .refine((d) => new Set(d.dojos.map((x) => x.slug)).size === d.dojos.length, {
    message: 'hay slugs repetidos',
  })
  .refine((d) => d.dojos.some((x) => x.estado === 'activo'), {
    message: 'tiene que haber al menos un dojo activo',
  })

export type Dojo = z.infer<typeof dojoSchema>
export type Horario = Dojo['horarios'][number]

const parsed = dojosSchema.safeParse(datos)

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
    .join('\n')
  throw new Error(`content/dojos.json no valida\n${detalle}`)
}

const DOJOS = parsed.data.dojos

/** Solo los activos: archivar saca al dojo de la web sin perder su ficha. */
export function getDojos(): Dojo[] {
  return DOJOS.filter((d) => d.estado === 'activo').sort((a, b) => a.orden - b.orden)
}

export function getDojo(slug: string): Dojo | null {
  return DOJOS.find((d) => d.slug === slug) ?? null
}

const LABORABLES: Dia[] = ['lun', 'mar', 'mie', 'jue', 'vie']

export function formatDias(dias: Dia[], locale: Locale): string {
  const enOrden = DIAS.filter((d) => dias.includes(d))

  if (enOrden.length === LABORABLES.length && LABORABLES.every((d) => dias.includes(d))) {
    return SEMANA_LABEL[locale]
  }

  const labels = enOrden.map((d) => DIA_LABEL[locale][d])
  if (labels.length === 1) return labels[0]!

  return labels.slice(0, -1).join(', ') + CONJUNCION[locale] + labels.at(-1)
}

/** "Adultos · almoço" o "Crianças". La variante es opcional. */
export function formatAudiencia(horario: Horario, locale: Locale): string {
  const audiencia = AUDIENCIA_LABEL[locale][horario.audiencia]
  return horario.variante ? `${audiencia} · ${VARIANTE_LABEL[locale][horario.variante]}` : audiencia
}

/** Las horas no se traducen: 20:30 es 20:30 en los cuatro idiomas. */
export function formatHorario(horario: Horario, locale: Locale): string {
  return `${formatDias(horario.dias, locale)} · ${horario.desde}–${horario.hasta}`
}
