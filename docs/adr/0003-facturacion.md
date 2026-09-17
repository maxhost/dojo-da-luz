---
adr: 0003
fecha: 2026-09-17
estado: aceptada
resumen: Emision propia de facturas (serie y numero configurables), PDF a R2 y envio por Resend. Sin proveedor certificado — riesgo legal asumido por el cliente.
---

# 0003 — Facturacion

## Contexto

~4 facturas/mes para una asociacion sin fines de lucro en Lisboa.

Se evaluo integrar un proveedor certificado por la AT portuguesa (InvoiceXpress, Moloni,
Vendus). En Portugal, una *fatura* fiscal exige ATCUD, QR code, numeracion secuencial por
serie comunicada a la AT y SAF-T; el software certificado es obligatorio por encima de
50.000€/año de facturacion, con multas de 150–3.750€ por documento no conforme.

## Decision

**Emision propia, sin proveedor certificado.** Decision explicita del cliente tras
plantearsele el punto anterior: el volumen es minimo, la asociacion esta muy por debajo del
umbral y el documento que emite es simple.

Flujo: el admin elige un alumno → click en "Generar factura" → se genera el PDF con los
datos fiscales del alumno → se envia por email → se guarda en R2.

Configuracion en el backoffice: **serie y numero inicial**. A partir de ahi el numero es
secuencial y automatico.

## Riesgo aceptado

Si la asociacion supera el umbral, o si algun alumno necesita que la cuota le cuente en el
IRS (lo que exige comunicarla a e-fatura con su NIF), este modulo **no** es suficiente y hay
que pasar a un proveedor certificado.

Mitigacion estructural: la generacion queda detras de una sola interfaz
(`emitirFactura(alumno, periodo) -> {numero, pdfUrl}`). Cambiar a un proveedor certificado
es reimplementar esa funcion, no reescribir el backoffice. **No filtrar detalles de la
generacion de PDF fuera de ese modulo.**

## Archivo

El PDF en R2 es el documento conservado — eso cubre la retencion fiscal sin nada extra.
La clave del objeto lleva la serie y el numero (`2026/FA-2026-0012.pdf`), asi que el
estado de facturacion se lee listando el bucket. No hay job de backup ni metadata
paralela: seria andamiaje para un caso que no ocurre.

## No entra

- Pagos, cobros, conciliacion, recordatorios de cuota vencida.
- Reservas de clases.
- Datos de menores. El backoffice guarda **solo** nombre del alumno y datos de facturacion.
