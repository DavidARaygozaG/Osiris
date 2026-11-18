// Fechas de la tortillería: SIEMPRE hora de Ciudad de México (UTC-6, sin horario de verano desde 2022).
// Antes el "día" se calculaba en UTC: una cuenta guardada después de las 6 pm caía en el día
// siguiente y rompía la regla de "una cuenta por día". Este archivo es la única fuente de verdad
// y sirve igual en el servidor (API) y en el navegador.
//
// Aprende: Intl.DateTimeFormat con `timeZone` da la fecha local de cualquier zona sin librerías.
export const ZONA = 'America/Mexico_City';

const formato = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** "YYYY-MM-DD" del día en Ciudad de México. Acepta Date, timestamp o string ISO. */
export const diaMX = (fecha = new Date()) => formato.format(new Date(fecha));

/** Primer instante (Date) de un día "YYYY-MM-DD" en Ciudad de México (00:00 = 06:00 UTC). */
export const inicioDiaMX = dia => new Date(`${dia}T00:00:00-06:00`);

/** Primer instante del mes actual (o del mes de `fecha`) en Ciudad de México. */
export const inicioMesMX = (fecha = new Date()) => inicioDiaMX(`${diaMX(fecha).slice(0, 7)}-01`);
