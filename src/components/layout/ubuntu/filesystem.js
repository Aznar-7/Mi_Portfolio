import { motion } from 'motion/react';
import { Code, Cloud } from 'lucide-react';
import React from 'react';
import { site } from '@/data/site';
import { projects } from '@/data/projects';

export function buildFS(lang) {
  const l = (v) => (v && typeof v === 'object' ? (v[lang] ?? v.es ?? '') : v ?? '');

  const readmes = {
    'utn-hub': `# UTN Hub\n\n> Plataforma academica para estudiantes de UTN\n\n## Stack\n\n| Layer | Technology |\n|---|---|\n| Frontend | React, Vite, Tailwind CSS |\n| Backend | Django REST Framework, JWT |\n| Database | PostgreSQL |\n| Infra | Oracle Cloud, Nginx, SSL/TLS |\n\n## Que resuelve\n\nCentraliza calendario academico, parciales, documentos colaborativos, notas y notificaciones para estudiantes.\n\n## Arquitectura\n\n\`\`\`\nReact SPA -> Django REST API -> PostgreSQL\n                 |\n          Oracle Cloud + Nginx\n\`\`\`\n\n## Notas de implementacion\n\n- Autenticacion con JWT\n- Backend desplegado en VM Ubuntu propia\n- Frontend publicado en Vercel\n- Proyecto en desarrollo activo\n\n## Live\n\nhttps://utnhub.com.ar`,
    'agv-studio': `# AGV Studio\n\n> Sitio y propuesta de estudio para desarrollo web\n\n## Stack\n\nReact · Django · Tailwind CSS · PostgreSQL\n\n## Descripcion\n\nProyecto orientado a presentar servicios de desarrollo web y explorar una identidad visual propia.\nIncluye estructura de landing, secciones de servicios y base para evolucionar hacia un sitio comercial real.\n\n## Live\n\nhttps://portfolio-agv.vercel.app/`,
  };

  const projectFiles = projects.reduce((acc, p) => {
    const extra = [];
    if (p.tech.includes('React')) {
      extra.push({
        name: 'package.json', type: 'file',
        content: JSON.stringify({ name: p.id, version: '1.0.0', scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0', vite: '^5.0.0' } }, null, 2),
      });
    }
    if (p.tech.includes('Django')) {
      extra.push({
        name: 'requirements.txt', type: 'file',
        content: 'django>=5.0\ndjangorestframework>=3.15\ndjangorestframework-simplejwt>=5.3\npsycopg2-binary>=2.9\ncorsheaders>=4.3\npython-decouple>=3.8\ngunicorn>=21.0',
      });
    }
    if (p.id === 'utn-hub') {
      extra.push({ name: 'docker-compose.yml', type: 'file', content: 'version: "3.9"\nservices:\n  db:\n    image: postgres:16\n    env_file: .env\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n  backend:\n    build: ./backend\n    depends_on: [db]\n    env_file: .env\n    ports: ["8000:8000"]\n  frontend:\n    build: ./frontend\n    ports: ["5173:5173"]\nvolumes:\n  pgdata:' });
      extra.push({ name: '.env.example', type: 'file', content: 'SECRET_KEY=your-secret-key\nDEBUG=False\nDB_NAME=utnhub\nDB_USER=postgres\nDB_PASSWORD=\nDB_HOST=db\nDB_PORT=5432\nALLOWED_HOSTS=utnhub.com.ar,localhost\nCORS_ORIGINS=https://utnhub.com.ar' });
    }
    acc[`Home/Projects/${p.id}`] = [
      { name: 'README.md', type: 'file', content: readmes[p.id] || `# ${p.title}\n\n${l(p.description)}\n\n## Tech\n${p.tech.join(', ')}` },
      ...extra,
    ];
    return acc;
  }, {});

  return {
    'Home': [
      { name: 'Projects',  type: 'folder' },
      { name: 'Documents', type: 'folder' },
      { name: 'Desktop',   type: 'folder' },
      { name: 'Downloads', type: 'folder' },
      { name: '.bashrc',   type: 'file', content: '# ~/.bashrc — aznar-dev\nexport PS1="\\[\\033[35m\\]aznar\\[\\033[0m\\]@\\[\\033[36m\\]ubuntu-dev\\[\\033[0m\\]:~$ "\nexport PATH="$HOME/.local/bin:$PATH"\nexport EDITOR=code\n\n# Aliases\nalias gs="git status"\nalias glog="git log --oneline --graph"\nalias py="python3"\nalias dj="python manage.py"\nalias serve="npm run dev"\nalias k="kubectl"\n\n# NVM\nexport NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n\necho "Welcome to aznar-dev environment"' },
    ],
    'Home/Projects': projects.map(p => ({ name: p.id, type: 'folder', label: p.title })),
    'Home/Documents': [
      { name: 'resume.pdf', type: 'file', label: 'Resume (PDF)', isPdf: true },
      { name: 'about.txt', type: 'file', content: `${site.name}\n${site.role}\n\nCurso Sistemas de Informacion en UTN: diseno, implementacion, organizacion y control de sistemas de informacion para organizaciones.\nLo conecto con desarrollo full-stack: procesos, datos, APIs, interfaces y despliegues.\n\nStack principal: React, Django, PostgreSQL, Linux/cloud\nIdiomas: Espanol nativo, Ingles C1, Portugues basico\n\nEmail: ${site.email}\nGitHub: ${site.github}\nLinkedIn: ${site.linkedin}` },
      { name: 'cover_letter.md', type: 'file', content: `# Cover Letter\n\nEstimado equipo,\n\nSoy ${site.name}, desarrollador full-stack y estudiante de Sistemas de Informacion en UTN.\n\nMi formacion esta enfocada en sistemas de informacion para organizaciones: entender procesos, modelar datos, disenar soluciones y evaluar como se sostienen en operacion. En la practica trabajo con React, Django, PostgreSQL e infraestructura Linux/cloud.\n\nBusco un equipo donde pueda aportar criterio tecnico, aprender de revisiones reales y seguir creciendo en productos con usuarios concretos.\n\nSaludos,\n${site.name}` },
    ],
    'Home/Desktop': [
      { name: 'portfolio-v2', type: 'folder' },
      { name: 'install.sh', type: 'file', content: '#!/bin/bash\n# aznar-dev environment setup\nset -e\n\necho "Setting up aznar-dev environment..."\n\n# Node.js\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs\n\n# Python\nsudo apt install python3.11 python3-pip python3-venv -y\n\n# PostgreSQL\nsudo apt install postgresql postgresql-contrib -y\n\n# Docker\ncurl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh\n\n# VS Code\nwget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg\nsudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/\nsudo apt install code -y\n\necho "OK Setup complete! Run: code ."' },
    ],
    'Home/Downloads': [
      { name: 'vscode_amd64.deb', type: 'file', content: '# Binary installer — Visual Studio Code\n# Run: sudo dpkg -i vscode_amd64.deb' },
    ],
    'Home/Desktop/portfolio-v2': [
      { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'portfolio-v2', version: '2.0.0', scripts: { dev: 'vite', build: 'vite build' }, dependencies: { react: '^19.0.0', 'motion': '^11.0.0', 'lucide-react': '^0.400.0' } }, null, 2) },
      { name: 'README.md', type: 'file', content: '# Portfolio V2\n\nPortfolio personal construido con React, Vite y Tailwind CSS.\n\n## Features\n\n- Ubuntu OS Easter Egg (estás aquí )\n- Modo oscuro completo\n- i18n ES/EN\n- Animaciones con Motion\n- Terminal interactivo\n\n## Setup\n\n```bash\nnpm install && npm run dev\n```' },
    ],
    ...projectFiles,
  };
}
