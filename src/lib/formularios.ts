import { z } from 'zod'
import { LOCALES, type Locale } from './i18n.ts'
// El atributo lo exige Node al correr los tests; Vite lo acepta igual.
import datos from '../../content/forms.json' with { type: 'json' }

/**
 * Los formularios son una entidad, no markup escrito en una vista (ADR-0046): viven en
 * `content/forms.json`, se relacionan con los botones por `formId` y el portugues manda la
 * estructura. Un archivo invalido rompe el build, como con los dojos: un formulario mal
 * cargado tiene que aparecer al publicar, no cuando alguien quiere apuntarse a una clase.
 *
 * Aca vive **que forma tiene** un formulario y como se lee. La edicion esta en
 * `formularios-edicion.ts` y la validacion de una respuesta en `formularios-envio.ts`:
 * las tres mitades no cambian por los mismos motivos.
 */

export const TIPOS = [
  'text',
  'textarea',
  'email',
  'tel',
  'number',
  'date',
  'singleChoice',
  'multipleChoice',
] as const

export type Tipo = (typeof TIPOS)[number]

/** Los dos tipos que llevan opciones, y con que se pueden pintar. */
export const PRESENTACIONES: Record<'singleChoice' | 'multipleChoice', readonly string[]> = {
  singleChoice: ['radio', 'select'],
  multipleChoice: ['checkbox', 'multiSelect'],
}

export function esSeleccion(tipo: Tipo): tipo is 'singleChoice' | 'multipleChoice' {
  return tipo === 'singleChoice' || tipo === 'multipleChoice'
}

/** Un id tecnico: lo genera el servidor, no se muestra y no se edita. */
const ID = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'identificador en minusculas, numeros y guiones')

const localizado = z.object(
  Object.fromEntries(LOCALES.map((l) => [l, z.string().min(1)])) as Record<
    Locale,
    z.ZodString
  >,
)

const localizadoOpcional = z.object(
  Object.fromEntries(LOCALES.map((l) => [l, z.string().min(1).nullable()])) as Record<
    Locale,
    z.ZodNullable<z.ZodString>
  >,
)

export const opcionSchema = z.object({ id: ID, label: localizado })

export const campoSchema = z
  .object({
    id: ID,
    type: z.enum(TIPOS),
    required: z.boolean(),
    label: localizado,
    help: localizadoOpcional,
    presentation: z.enum(['radio', 'select', 'checkbox', 'multiSelect']).nullable(),
    options: z.array(opcionSchema),
  })
  .superRefine((campo, ctx) => {
    // El catalogo es cerrado (ADR-0046): un tipo sin opciones no puede traerlas por la
    // puerta de atras, y uno de seleccion no puede quedarse sin con que pintarse.
    if (esSeleccion(campo.type)) {
      if (campo.options.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'hace falta al menos una opcion' })
      }
      if (!campo.presentation || !PRESENTACIONES[campo.type].includes(campo.presentation)) {
        ctx.addIssue({
          code: 'custom',
          path: ['presentation'],
          message: `presentacion invalida: ${PRESENTACIONES[campo.type].join(' o ')}`,
        })
      }
    } else {
      if (campo.options.length > 0) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'este tipo no lleva opciones' })
      }
      if (campo.presentation !== null) {
        ctx.addIssue({ code: 'custom', path: ['presentation'], message: 'este tipo no lleva presentacion' })
      }
    }

    if (new Set(campo.options.map((o) => o.id)).size !== campo.options.length) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'hay opciones repetidas' })
    }
  })

export const formularioSchema = z
  .object({
    id: ID,
    nombre: z.string().min(1),
    estado: z.enum(['activo', 'archivado']),
    submitLabel: localizado,
    successMessage: localizado,
    fields: z.array(campoSchema).min(1, 'un formulario sin campos no se puede enviar'),
  })
  .refine((f) => new Set(f.fields.map((c) => c.id)).size === f.fields.length, {
    path: ['fields'],
    message: 'hay campos repetidos',
  })

export const formulariosSchema = z
  .object({ forms: z.array(formularioSchema) })
  .refine((d) => new Set(d.forms.map((f) => f.id)).size === d.forms.length, {
    message: 'hay formularios repetidos',
  })

export type Opcion = z.infer<typeof opcionSchema>
export type Campo = z.infer<typeof campoSchema>
export type Formulario = z.infer<typeof formularioSchema>

const parsed = formulariosSchema.safeParse(datos)

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
    .join('\n')
  throw new Error(`content/forms.json no valida\n${detalle}`)
}

const FORMULARIOS = parsed.data.forms

/** Todos, incluidos los archivados: el listado del backoffice los muestra igual. */
export function getFormularios(): Formulario[] {
  return FORMULARIOS
}

/** Los que se pueden elegir hoy en un selector del backoffice. */
export function getFormulariosActivos(): Formulario[] {
  return FORMULARIOS.filter((f) => f.estado === 'activo')
}

/**
 * Un formulario por id. Devuelve tambien los archivados: una pagina que ya lo referencia
 * lo sigue mostrando (ADR-0046), archivar solo impide asignaciones nuevas.
 */
export function getFormulario(id: string): Formulario | null {
  return FORMULARIOS.find((f) => f.id === id) ?? null
}

/** El texto de un campo en un idioma. El portugues es el respaldo: nunca se pinta vacio. */
export function textoDe(valor: Record<Locale, string>, locale: Locale): string {
  return valor[locale] || valor.pt
}

export function ayudaDe(valor: Record<Locale, string | null>, locale: Locale): string | null {
  return valor[locale] ?? valor.pt
}
