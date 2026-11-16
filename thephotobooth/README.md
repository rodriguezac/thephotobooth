# The Photobooth

Photobooth local con React, TypeScript y Vite. El flujo permite elegir 1-4 fotos, un patrón o color sólido, un filtro en vivo y capturar una secuencia con cuenta regresiva. El resultado se genera como PNG con todas las fotos, el fondo y el filtro elegidos. Cuatro fotos usan una cuadrícula de 2 × 2; las demás se apilan verticalmente.

## Desarrollo

```sh
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente http://localhost:5173/).

```sh
npm run build
npm run lint
npm test
```

## Cámara

La cámara requiere localhost o HTTPS. Permite el acceso en el navegador y, en macOS, en Ajustes del Sistema → Privacidad y seguridad → Cámara. Si está ocupada, cierra otras apps que la usen y pulsa `retry camera`.

La vista previa usa el video por encima de la pantalla opaca de la imagen de cámara. Las solicitudes de permisos que se resuelven después de salir se descartan y sus tracks se detienen. La cámara se libera al salir de la pantalla; solo se puede capturar cuando hay video disponible.

## Fotos y exportación

Las fotos se procesan en el navegador y no se envían automáticamente a un servidor. El QR está oculto y deshabilitado en la primera versión; no se suben fotos a Cloudinary. Se conservan originales en memoria para poder personalizar fondo y filtro después de capturar. `CUSTOMIZE` permite volver al estilo y guardar directamente o seguir al filtro; `REPEAT` vuelve a tomar las fotos con la misma cantidad, fondo, filtro y stickers. `MAIN MENU` reinicia la sesión desde la pantalla START. Al cambiar la cantidad se eliminan las capturas anteriores. Recargar la página también reinicia la sesión.

La previsualización final y la descarga usan el mismo PNG generado con Canvas 2D, evitando diferencias de encuadre, filtro o distribución. Los tests cubren el ciclo de vida de cámara, permisos tardíos, reintentos, captura sin dimensiones y exportación de 1-4 fotos.

## Guardado en iPhone y iPad

La descarga de escritorio usa un Blob con nombre PNG. En dispositivos Apple táctiles se prepara el archivo antes del toque y se invoca el menú nativo de guardado cuando `navigator.canShare({ files })` lo admite. Si esa opción falla o no existe, se muestra la tira para mantenerla presionada y guardarla, junto a un enlace para abrir la imagen. Cancelar el menú no se trata como error.

Referencia de activación del usuario en WebKit: https://webkit.org/blog/13862/the-user-activation-api/

El fondo del inicio cubre el viewport dinámico, con un fondo fijo para evitar espacios blancos al cambiar de orientación o al cambiar la altura de las barras del navegador. El enlace `@raspaorojo` abre Instagram en otra pestaña.

## Patrón desde la galería

En el paso de estilo, selecciona `Your image` / `Tu imagen` y elige una imagen de la galería (hasta 15 MB). Se prepara localmente, conserva sus proporciones y se repite como patrón en la tira. Puedes cambiarla, alternar con los patrones y colores del catálogo y volver a seleccionarla sin perderla durante la sesión. Se mantiene con `Repeat` y se incluye en el PNG descargado; `Main Menu` o recargar la página la descarta. No se envía al servidor.

## QR (fuera de la primera versión)

El componente `ShareQr` y sus pruebas se conservan para una versión futura, pero no se montan en la pantalla de resultado. El build de producción no incluye el código de carga a Cloudinary. No configures variables de Cloudinary para esta versión.

## Deploy en Netlify

El repositorio contiene `netlify.toml` en la raíz: usa `thephotobooth` como carpeta base, Node 22, `npm run build` y publica `dist`. No subas `.env.local`, `work` ni `node_modules`.

Producción: https://thephotobooth-raspaorojo.netlify.app/

Al conectar el proyecto de Netlify a `rodriguezac/thephotobooth` con `main` como rama de producción, cada push a `main` inicia un build y publica el resultado si termina correctamente. Los cambios locales necesitan commit y push para publicarse.

## Stickers in Customize

After choosing a style and filter, `Next` opens the sticker editor with the PNG files from `public/stickers/`. Drag a sticker from the gallery onto the strip, or tap to add it. Use one finger to move the selected sticker and two fingers to pinch, rotate and move it together. When one finger is lifted, dragging continues without a position jump. Tap `Done` to deselect the sticker and scroll the strip normally.

Manual tools include size and rotation sliders, 15-degree rotation buttons, horizontal and vertical flips, orientation reset, and removal. Arrow keys move a focused sticker (Shift moves faster); Delete removes it. Position, size, rotation and flips are preserved in the downloaded PNG and when navigating back through Customize. `Repeat` retakes the photos with the same count, background, filter and sticker composition. `Main Menu` returns to the welcome screen and resets the session; selecting a new photo count also starts a new composition. The paginated catalog is defined in `src/utils/stickers.ts`.
