/**
 * Datos de la organizacion para el JSON-LD.
 *
 * PENDIENTE DEL CLIENTE: moradas completas, telefono, email y URLs de redes.
 * El sitio actual no publica ninguna direccion postal — solo los barrios. No se
 * inventan: para SEO local un NAP incorrecto es peor que uno ausente.
 */
export const ORG = {
  name: 'Dojo da Luz',
  alternateName: 'Aikido-Durán',
  sport: 'Aikido',
  city: 'Lisboa',
  country: 'PT',
  /** Barrios con dojo. Confirmados en el sitio actual. */
  areas: ['Benfica', 'Lumiar', 'Encarnação'],
  instructor: {
    name: 'Pablo Durán',
    jobTitle: '5.º Dan Aikikai, Hombu Dojo Tóquio',
  },
} as const

export function sportsClubJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: ORG.name,
    alternateName: ORG.alternateName,
    url: siteUrl,
    sport: ORG.sport,
    address: {
      '@type': 'PostalAddress',
      addressLocality: ORG.city,
      addressCountry: ORG.country,
    },
    areaServed: ORG.areas.map((name) => ({ '@type': 'Place', name })),
    employee: {
      '@type': 'Person',
      name: ORG.instructor.name,
      jobTitle: ORG.instructor.jobTitle,
    },
  }
}
