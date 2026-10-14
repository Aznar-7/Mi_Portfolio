// End-to-end delivery flow. Each step cites a real project as evidence.
export const processSteps = [
  {
    id: 'understand',
    title: { es: 'Entender', en: 'Understand' },
    detail: {
      es: 'Relevo el problema con quien lo vive: procesos, reglas de negocio, restricciones y qué significa que funcione.',
      en: 'I map the problem with the people who live it: processes, business rules, constraints and what "working" means.',
    },
    example: {
      es: 'Orden 66: cupos diarios, roles y estados de pedido modelados desde las reglas reales del negocio.',
      en: 'Orden 66: daily quotas, roles and order states modeled from the real business rules.',
    },
  },
  {
    id: 'design',
    title: { es: 'Diseñar', en: 'Design' },
    detail: {
      es: 'Modelo de datos, arquitectura y contrato de la API; flujos e interfaz pensados antes de escribir código.',
      en: 'Data model, architecture and API contract; flows and interface worked out before writing code.',
    },
    example: {
      es: 'UTN Hub: cuatro capas separadas, endpoints por dominio y autenticación JWT.',
      en: 'UTN Hub: four separate layers, endpoints per domain and JWT authentication.',
    },
  },
  {
    id: 'build',
    title: { es: 'Construir', en: 'Build' },
    detail: {
      es: 'Frontend, backend y, cuando el problema lo pide, hardware. Código legible y fácil de mantener.',
      en: 'Frontend, backend and, when the problem calls for it, hardware. Readable, maintainable code.',
    },
    example: {
      es: 'Eco Records: carcasa impresa en 3D, Raspberry Pi con NFC y una app web propia.',
      en: 'Eco Records: 3D-printed case, a Raspberry Pi with NFC and its own web app.',
    },
  },
  {
    id: 'ship',
    title: { es: 'Desplegar', en: 'Ship' },
    detail: {
      es: 'Servidores Linux, reverse proxy, certificados y dominio. Lo dejo andando en producción, no en mi máquina.',
      en: 'Linux servers, reverse proxy, certificates and domain. It runs in production, not on my machine.',
    },
    example: {
      es: 'UTN Hub: VM en Oracle Cloud con Nginx y SSL, configurada desde cero.',
      en: 'UTN Hub: Oracle Cloud VM with Nginx and SSL, set up from scratch.',
    },
  },
  {
    id: 'iterate',
    title: { es: 'Iterar', en: 'Iterate' },
    detail: {
      es: 'Escucho a quien lo usa y mejoro lo que ya está en producción, sin romper lo que funciona.',
      en: 'I listen to the people using it and improve what is already live, without breaking what works.',
    },
    example: {
      es: 'Porta Hnos: herramientas legacy migradas a un stack moderno en ciclos de entrega quincenales.',
      en: 'Porta Hnos: legacy tools migrated to a modern stack in two-week delivery cycles.',
    },
  },
]
