# Lingo Readme Stats

Un generador de tarjetas SVG dinámicas para mostrar estadísticas públicas de Duolingo en tu README de GitHub.

## Descripción

Este proyecto permite crear imágenes SVG personalizables que muestran estadísticas públicas de perfiles de Duolingo, como experiencia (XP), racha actual, idiomas aprendidos, etc. Es ideal para incluir en perfiles de GitHub o repositorios para compartir tu progreso en el aprendizaje de idiomas.

El proyecto está desarrollado en TypeScript y utiliza la API pública no oficial de Duolingo para obtener metadatos públicos de usuarios. No requiere autenticación y es completamente gratuito.

## Características

- **Generación dinámica de SVG**: Crea tarjetas visuales atractivas.
- **Temas personalizables**: Elige entre temas prediseñados.
- **Campos ocultables**: Oculta información que no quieras mostrar.
- **Cache configurable**: Controla el tiempo de caché para optimizar rendimiento.
- **Despliegue fácil**: Compatible con Vercel y Docker.

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/livrasand/lingo-readme-stats.git
   cd lingo-readme-stats
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Compila el código TypeScript:
   ```bash
   npm run build
   ```

## Uso

### Despliegue Local

Ejecuta el servidor localmente:
```bash
npm start
```

O usa Vercel CLI para desarrollo:
```bash
npx vercel dev
```

### Endpoint de la API

El endpoint principal es `/api/lingo` con los siguientes parámetros:

- `username` (requerido): Nombre de usuario de Duolingo.
- `theme` (opcional): Tema de la tarjeta (`default`, `light`, `duo`). Por defecto: `default`.
- `hide` (opcional): Campos a ocultar, separados por coma (ej: `xp,streak,language`).
- `cache_seconds` (opcional): Segundos para el header Cache-Control. Por defecto: 1800.

### Variables de Entorno

- `CACHE_SECONDS`: Valor por defecto de caché en segundos si no se pasa por query.

## Ejemplos

### Ejemplo Básico

```markdown
![Mis Stats de Duolingo](https://tu-dominio.vercel.app/api/lingo?username=tu_usuario)
```

### Con Tema y Campos Ocultos

```markdown
![Stats Personalizados](https://tu-dominio.vercel.app/api/lingo?username=tu_usuario&theme=duo&hide=streak&cache_seconds=86400)
```

### Imagen Generada

![Ejemplo de Tarjeta](https://tu-dominio.vercel.app/api/lingo?username=juanito&theme=duo)

## Despliegue

### En Vercel

1. Crea un repositorio en GitHub con estos archivos.
2. Conecta el repositorio en [Vercel](https://vercel.com/new).
3. Vercel detectará automáticamente el `vercel.json` y compilará las funciones TypeScript.
4. En la configuración del proyecto, añade `CACHE_SECONDS` si deseas un valor por defecto diferente.
5. Prueba el endpoint: `https://<tu-proyecto>.vercel.app/api/lingo?username=tu_usuario_duo`

### Con Docker

Construye la imagen:
```bash
docker build -t lingo-readme-stats .
```

Ejecuta el contenedor:
```bash
docker run -p 3000:3000 lingo-readme-stats
```

Accede a la API en: `http://localhost:3000/api/lingo?username=tu_usuario`

## Pruebas

Para pruebas locales precisas, instala Vercel CLI y ejecuta:
```bash
npx vercel dev
```

Esto emulará los endpoints serverless localmente.

También puedes compilar y ejecutar manualmente:
```bash
npm run build
node dist/api/lingo.js
```

## Copyright

Este proyecto no está afiliado, respaldado ni aprobado por Duolingo, Inc. Duolingo es una marca registrada de Duolingo, Inc. Todos los derechos reservados a sus respectivos propietarios. El uso de este proyecto es bajo tu propia responsabilidad y debe cumplir con las políticas de uso de Duolingo.

---

Desarrollado por [Livrädo Sandoval](https://github.com/livrasand).
