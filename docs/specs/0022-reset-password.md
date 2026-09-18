---
spec: 0022
fecha: 2026-09-18
estado: borrador
resumen: Recuperacion de contraseña del admin por email con Resend, token de un solo uso y expulsion de las sesiones abiertas.
disjunta: no
archivos: db/migrations/0003_admin_reset.sql, src/lib/email.ts, src/pages/admin/recuperar.astro, src/pages/admin/restablecer.astro
---

# 0022 — Recuperacion de contraseña

## Problema

Con la spec 0019 el admin entra con email y contraseña, pero si la pierde no tiene salida:
hay que repararlo desde la consola con `npm run admin:seed`. El cliente no puede hacer eso.

Se separo de la 0019 por decision del cliente: arrancar sin Resend para no bloquear el
backoffice detras de una API key y un DKIM que todavia no existen.

## Alcance

**Entra:** la tabla `admin_reset`, el envio por Resend, y las pantallas `/admin/recuperar`
y `/admin/restablecer`, con el comportamiento ya decidido en el ADR-0015: respuesta
identica exista o no el email, token de 32 bytes guardado hasheado, 30 minutos, un solo
uso, y borrado de **todas** las sesiones al cambiar la contraseña.

**No entra:** 2FA, cambio de email, notificacion de "entraron a tu cuenta".

## Abierto — bloquea

- `RESEND_API_KEY`.
- Remitente. Sin dominio propio, Resend solo entrega a la casilla verificada de la cuenta:
  alcanza para verificar el flujo, no para produccion. El remitente definitivo espera al
  DKIM del dominio (tarea 10 de `docs/TASKS.md`).
