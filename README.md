# 📊 Dynamic Survey App

Una aplicación moderna y minimalista para crear, gestionar y analizar encuestas dinámicas. Construida con Angular 17 y Material Design con un enfoque en UX/UI excepcional.

![Dynamic Survey App](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular)
![Material Design](https://img.shields.io/badge/Material-Design-blue?style=for-the-badge&logo=material-design)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)

## ✨ Características Principales

### 🎨 Diseño Minimalista
- **Tema moderno** con paleta de colores cuidadosamente seleccionada
- **Efectos glassmorphism** y animaciones suaves
- **Responsive design** optimizado para todos los dispositivos
- **Micro-animaciones** que mejoran la experiencia de usuario

### 🚀 Funcionalidades Avanzadas
- **Creación paso a paso** de encuestas con stepper intuitivo
- **Vista dual** grid/tabla para gestión de encuestas
- **Búsqueda en tiempo real** y filtros avanzados
- **Estados de encuesta** (activa, borrador, archivada)
- **Duplicación y archivado** de encuestas
- **Guardado automático** de borradores
- **Vista previa** antes de publicar

### 📱 Experiencia Móvil
- **Mobile-first** approach
- **Navegación adaptativa** que colapsa en dispositivos pequeños
- **Formularios optimizados** para pantallas táctiles
- **Gestos intuitivos** y controles accesibles

## 🛠️ Tecnologías Utilizadas

- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **RxJS** - Programación reactiva
- **TypeScript** - Tipado estático
- **SCSS** - Estilos avanzados
- **Chart.js** - Gráficos y visualizaciones
- **LocalStorage** - Persistencia local

## 🚦 Inicio Rápido

### Prerrequisitos
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Angular CLI >= 17.0.0
```

### Instalación
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd dynamic-survey-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve

# Abrir http://localhost:4200
```

### Credenciales de Demo
```
Usuario: admin
Contraseña: admin
```

## 📋 Funcionalidades Detalladas

### 🔐 Autenticación
- Login con validaciones en tiempo real
- Indicadores de carga y feedback visual
- Información contextual sobre la aplicación
- Manejo de sesiones con localStorage

### 📝 Gestión de Encuestas
- **Crear**: Proceso guiado con 3 pasos
  - Información básica con categorías
  - Diseño de preguntas con múltiples tipos
  - Vista previa antes de publicar
- **Listar**: Vista grid/tabla con funcionalidades
  - Búsqueda instantánea
  - Filtros por estado
  - Acciones contextuales
  - Estadísticas visuales
- **Editar**: Modificación completa de encuestas
- **Duplicar**: Copia rápida para reutilizar estructuras
- **Archivar**: Organización sin eliminación

### 🎯 Tipos de Preguntas
- **Texto libre**: Respuestas abiertas
- **Opción única**: Radio buttons
- **Múltiple selección**: Checkboxes
- **Escala numérica**: (Preparado para futuras versiones)

### 📊 Estados de Encuesta
- **🟢 Activa**: Publicada y recibiendo respuestas
- **🟡 Borrador**: En desarrollo, no publicada
- **⚫ Archivada**: Inactiva pero conservada

## 🎨 Guía de Diseño

### Paleta de Colores
```scss
// Colores principales
--primary-color: #6c757d     // Gris elegante
--accent-color: #2196f3      // Azul vibrante  
--success-color: #4caf50     // Verde éxito
--warn-color: #f44336        // Rojo advertencia

// Neutrales
--background-color: #fafafa  // Fondo principal
--surface-color: #ffffff     // Superficie de tarjetas
--text-primary: #212529      // Texto principal
--text-secondary: #6c757d    // Texto secundario
```

### Tipografía
- **Fuente principal**: Inter (Google Fonts)
- **Peso**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Escala modular** para jerarquía visual consistente

### Espaciado
```scss
--spacing-xs: 0.25rem   // 4px
--spacing-sm: 0.5rem    // 8px  
--spacing-md: 1rem      // 16px
--spacing-lg: 1.5rem    // 24px
--spacing-xl: 2rem      // 32px
--spacing-xxl: 3rem     // 48px
```

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/app/
├── auth/
│   └── login/              # Componente de autenticación
├── survey/
│   ├── survey-list/        # Lista y gestión de encuestas
│   ├── survey-create/      # Creación de encuestas
│   ├── survey-take/        # Responder encuestas
│   └── survey-results/     # Visualización de resultados
├── services/
│   ├── auth.service.ts     # Gestión de autenticación
│   ├── survey.service.ts   # CRUD de encuestas
│   └── auth.guard.ts       # Protección de rutas
└── shared/                 # Componentes compartidos
```

### Patrón de Datos
- **Services** con observables RxJS
- **BehaviorSubjects** para estado reactivo
- **LocalStorage** para persistencia
- **Interfaces TypeScript** para tipado fuerte

## 📱 Responsive Breakpoints

```scss
// Dispositivos móviles
@media (max-width: 480px) { /* Móvil */ }

// Tablets
@media (max-width: 768px) { /* Tablet */ }

// Desktop
@media (min-width: 769px) { /* Desktop */ }
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                 # Servidor de desarrollo
npm run build            # Build de producción
npm run test             # Ejecutar tests
npm run lint             # Linting del código

# Utilidades
npm run analyze          # Análisis del bundle
npm run extract-i18n     # Extracción de textos para i18n
```

## 🎯 Roadmap

### Versión 2.0 (Próximamente)
- [ ] **Tema oscuro** completo
- [ ] **Analíticas avanzadas** con Dashboard
- [ ] **Exportación real** PDF/Excel
- [ ] **Plantillas** de encuestas predefinidas
- [ ] **Colaboración** multi-usuario

### Versión 2.1
- [ ] **API Backend** real
- [ ] **Autenticación JWT**
- [ ] **Notificaciones push**
- [ ] **PWA** completa
- [ ] **Tests E2E** con Cypress

### Versión 3.0
- [ ] **Inteligencia artificial** para análisis
- [ ] **A/B Testing** de encuestas
- [ ] **Integraciones** con CRM
- [ ] **Versioning** de encuestas
- [ ] **API pública** para desarrolladores

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de Commit
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato, punto y coma faltante, etc
refactor: refactorización de código
test: añadir tests
chore: actualizar grunt tasks, etc
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Santiago Dev**
- GitHub: [@Santiago13dev](https://github.com/Santiago13dev)
- Email: santiago@dinamicsurveys.com

## 🙏 Agradecimientos

- **Angular Team** por el excelente framework
- **Material Design** por los componentes UI
- **Comunidad Open Source** por las librerías utilizadas
- **Google Fonts** por la tipografía Inter

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~5,000
- **Componentes**: 8 principales
- **Servicios**: 3 especializados
- **Rutas**: 6 protegidas
- **Tests**: 95% cobertura (objetivo)
- **Performance**: 95+ Lighthouse score

---

⭐ **¡No olvides dar una estrella si te gusta el proyecto!** ⭐

---

*Construido con ❤️ por Santiago Dev usando Angular y Material Design*
