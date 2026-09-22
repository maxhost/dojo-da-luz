import { getAjustes } from './ajustes'
import { getDojos, type Dojo } from './dojos'
import type { Dia } from './i18n'

/**
 * Datos de la organizacion para el JSON-LD.
 *
 * Los barrios y las sedes salen de content/dojos.json (ADR-0017), no de aca.
 *
 * El telefono, el email y las redes salen de `content/site.json` (ADR-0042) y **solo
 * entran al marcado si estan cargados**: para SEO local un NAP incorrecto es peor que uno
 * ausente. Las moradas completas siguen en la ficha de cada dojo.
 */
export const ORG = {
  name: 'Dojo da Luz',
  alternateName: 'Aikido-Durán',
  sport: 'Aikido',
  city: 'Lisboa',
  country: 'PT',
  instructor: {
    name: 'Pablo Durán',
    jobTitle: '5.º Dan Aikikai, Hombu Dojo Tóquio',
  },
} as const

const DIA_SCHEMA: Record<Dia, string> = {
  lun: 'Monday',
  mar: 'Tuesday',
  mie: 'Wednesday',
  jue: 'Thursday',
  vie: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
}

/**
 * Una sede por dojo activo (ADR-0017). **Solo con los campos que existen**: un NAP
 * inventado es peor que uno ausente, y el cliente todavia no confirmo calles ni telefono.
 */
function locationJsonLd(dojo: Dojo) {
  const { calle, codigoPostal, localidad, pais } = dojo.direccion

  return {
    '@type': 'SportsActivityLocation',
    name: `${dojo.dojo} · ${dojo.nombre}`,
    ...(dojo.instalacion ? { alternateName: dojo.instalacion } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(calle ? { streetAddress: calle } : {}),
      ...(codigoPostal ? { postalCode: codigoPostal } : {}),
      addressLocality: localidad,
      addressCountry: pais,
    },
    ...(dojo.geo ? { geo: { '@type': 'GeoCoordinates', latitude: dojo.geo.lat, longitude: dojo.geo.lng } } : {}),
    ...(dojo.telefono ? { telephone: dojo.telefono } : {}),
    openingHoursSpecification: dojo.horarios.map((horario) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: horario.dias.map((dia) => DIA_SCHEMA[dia]),
      opens: horario.desde,
      closes: horario.hasta,
    })),
  }
}

export function sportsClubJsonLd(siteUrl: string) {
  const { contacto, redes } = getAjustes()
  const perfiles = [redes.facebook, redes.instagram].filter((url): url is string => url !== null)

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: ORG.name,
    alternateName: ORG.alternateName,
    url: siteUrl,
    sport: ORG.sport,
    ...(contacto.telefono ? { telephone: contacto.telefonoEnlace ?? contacto.telefono } : {}),
    ...(contacto.email ? { email: contacto.email } : {}),
    ...(perfiles.length > 0 ? { sameAs: perfiles } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: ORG.city,
      addressCountry: ORG.country,
    },
    // Los barrios salen de los dojos activos: una sola fuente, sin lista paralela.
    areaServed: getDojos().map((dojo) => ({ '@type': 'Place', name: dojo.nombre })),
    location: getDojos().map(locationJsonLd),
    employee: {
      '@type': 'Person',
      name: ORG.instructor.name,
      jobTitle: ORG.instructor.jobTitle,
    },
  }
}

/**
 * FAQPage sobre las preguntas que la pagina ya muestra (ADR-0018). No inventa contenido:
 * marca el que esta visible. Si no hay preguntas, no hay marcado.
 */
export function faqJsonLd(items: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
    })),
  }
}
