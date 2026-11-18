// Los 7 pasos del corte. Una pregunta por pantalla.
// `corto` es el nombre que se ve en la barra de progreso.
export const PASOS = [
  { id: 'productos', corto: 'Productos', pregunta: '¿Qué productos se vendieron?', ayuda: 'Cuenta cuántos salieron de cada uno. Si no salió, déjalo en 0.' },
  { id: 'proveedores', corto: 'Proveedores', pregunta: '¿Quién pasó hoy?', ayuda: 'Marca a quien pasó y anota lo que dejó y lo que se le pagó. Si nadie pasó, toca Siguiente.' },
  { id: 'tandas', corto: 'Tandas', pregunta: '¿Cuántas tandas hicieron?', ayuda: 'Agrega una tanda por cada vez que hicieron masa. Anota los bultos de harina y de masa.' },
  { id: 'sobrante', corto: 'Merma', pregunta: '¿Se tiró tortilla?', ayuda: 'Pesa la tortilla que se tiró o no se vendió. Si no hubo, toca Siguiente.' },
  { id: 'gastos', corto: 'Gastos', pregunta: '¿Hubo otros gastos?', ayuda: 'Gas, luz, bolsas… Si no hubo, toca Siguiente.' },
  { id: 'caja', corto: 'Caja', pregunta: '¿Cuánto dinero hay en caja?', ayuda: 'Cuenta todo el dinero que tienes ahora.' },
  { id: 'resumen', corto: 'Resultado', pregunta: 'Revisa tu cuenta', ayuda: '' },
];

export const TOTAL_PASOS = PASOS.length;
