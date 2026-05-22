# MiPortfolio V2

Portfolio personal de Vicente Aznar, construido como una experiencia web interactiva: secciones clasicas de perfil, proyectos y contacto, mas un modo Ubuntu jugable con apps, terminal, archivos, musica, juegos y detalles escondidos.

## Stack

- React 19 + Vite
- Tailwind CSS 4
- Motion para animaciones
- Lucide React para iconografia
- OGL y canvas para fondos interactivos
- PWA con `vite-plugin-pwa`

## Highlights

- Hero animado con acceso rapido a redes, CV y modo Ubuntu.
- Portfolio bilingue con datos centralizados en `src/data`.
- Proyectos con galerias, arquitectura, metricas y enlaces.
- Modo Ubuntu con ventanas, dock, workspaces, terminal, explorador, notas, musica, clima, paint y juegos.
- Juegos integrados: Snake, Buscaminas, Tetris y DOOM embebido.
- Efectos de sonido, cursor custom y fondos reactivos.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Estructura

```text
src/
  components/
    background/      Fondos, cursores y efectos visuales
    common/          Componentes reutilizables
    layout/          Navbar, footer, terminal y Ubuntu OS
    sections/        Hero, About, Skills, Projects, Experience, Contact
    ui/              Primitivas visuales
  contexts/          Idioma y sonido
  data/              Contenido editable del portfolio
  hooks/             Hooks compartidos
  i18n/              Traducciones
```

## Contenido editable

- Datos generales: `src/data/site.js`
- Perfil y bio: `src/data/about.js`
- Skills: `src/data/skills.js`
- Proyectos: `src/data/projects.js`
- Experiencia: `src/data/experience.js`

## Desarrollo

El proyecto corre con Vite. Para trabajar localmente:

```bash
npm install
npm run dev
```

Luego abrir la URL que muestre Vite, normalmente `http://localhost:5173`.

## Build

```bash
npm run build
```

El resultado queda en `dist/`, listo para servir como sitio estatico.

## Licencia

Proyecto personal. El codigo y los assets estan pensados para este portfolio.
