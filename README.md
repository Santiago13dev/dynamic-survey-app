# 🗳️ Dynamic Survey App

[![Angular](https://img.shields.io/badge/Angular-16-red?logo=angular)](https://angular.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Kevin%20Santiago-blue)](https://github.com/kevinSantiago)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-green)]()
[![Build](https://img.shields.io/badge/Status-En%20Desarrollo-orange)]()

> Aplicación web para crear, responder y visualizar encuestas dinámicas con resultados gráficos. Desarrollado con Angular.


---

## 🗂️ Estructura del Proyecto

- **src/**
  - **app/**
    - `app-routing.module.ts`
    - `app.module.ts`
    - `app.component.ts`
    - `app.component.html`
    - `app.component.scss`
    - **auth/**
      - **login/**
        - `login.component.ts`
        - `login.component.html`
        - `login.component.scss`
      - `auth.guard.ts`
      - `auth.service.ts`
    - **services/**
      - `survey.service.ts`
    - **survey-create/**
      - `survey-create.component.ts`
      - `survey-create.component.html`
      - `survey-create.component.scss`
    - **survey-list/**
      - `survey-list.component.ts`
      - `survey-list.component.html`
      - `survey-list.component.scss`
    - **survey-results/**
      - `survey-results.component.ts`
      - `survey-results.component.html`
      - `survey-results.component.scss`
    - **survey-take/**
      - `survey-take.component.ts`
      - `survey-take.component.html`
      - `survey-take.component.scss`
  - **environments/**
    - `environment.ts`
    - `environment.prod.ts`
  - `index.html`
  - `main.ts`
  - `polyfills.ts`
  - `styles.scss`
---

## 🚀 Funcionalidades

- ✅ Registro y login de usuarios
- ✅ Crear encuestas dinámicas (preguntas abiertas o cerradas)
- ✅ Listar encuestas creadas por el usuario
- ✅ Responder encuestas de forma intuitiva
- ✅ Visualización de resultados en gráficos de barras/pie
- ✅ Exportar resultados en PDF y CSV
- ✅ Estilo mobile-first con Angular Material

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Uso principal                         |
|------------------|----------------------------------------|
| Angular           | Framework SPA frontend                |
| Angular Material  | UI componentes responsivos            |
| TypeScript        | Lógica estructurada                   |
| RxJS              | Gestión reactiva de datos             |
| Chart.js + ng2-charts | Visualización de datos gráficos  |
| FileSaver.js      | Exportación de archivos               |
| HTML2Canvas       | Capturas visuales para PDF            |

---

## 📦 Instalación local

- ✅ Bash
- ✅ git clone https://github.com/tuusuario/dynamic-survey-app.git
- ✅ cd dynamic-survey-app
- ✅ npm install
- ✅ ng serve

---

## 📄 Roadmap

| Versión | Características principales                          | Estado         |
|---------|------------------------------------------------------|----------------|
| v1.0    | Login, registro, CRUD encuestas                      | ✅ Completado   |
| v1.1    | Exportación a PDF/CSV                                | ✅ Completado   |
| v1.2    | Mejora visual con Angular Material y gráficos        | ✅ Completado   |
| v1.3    | Estadísticas por pregunta / usuario                  | 🛠️ En desarrollo |
| v2.0    | Backend con Node.js o Firebase                       | 🕒 Planeado     |

---

## 👨‍💻 Autor

**Kevin Santiago Rodríguez Gómez**  
👨‍💻 Técnico en Soporte y estudiante de Ingeniería de Sistemas  
🌐 GitHub: [github.com/tuusuario](https://github.com/tuusuario)  
📧 Contacto: kevin.santiago@example.com

---

## 📝 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
