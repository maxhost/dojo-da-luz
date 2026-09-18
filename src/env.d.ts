/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Lo deja `src/middleware.ts` en toda ruta `/admin`. `null` = sin sesion. */
    admin: { id: string; email: string } | null
  }
}
