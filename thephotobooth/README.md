# The Photobooth · documentación técnica

Consulta el [README principal](../README.md) para ver las funciones, el uso de la aplicación y las instrucciones completas de instalación.

**Producción:** [thephotobooth-raspaorojo.netlify.app](https://thephotobooth-raspaorojo.netlify.app/)

## Comandos

Ejecuta estos comandos dentro de esta carpeta, con Node.js 22 recomendado:

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

No se necesitan variables de entorno para la primera versión. `npm run build` ejecuta TypeScript y Vite; `npm test` ejecuta Vitest.

## Estructura

- `src/App.tsx`: navegación por pasos y desplazamiento al cambiar de pantalla.
- `src/store/usePhotoboothStore.ts`: estado de la sesión, fotos, cámara elegida, estilo y stickers.
- `src/components/steps/`: inicio, cantidad de fotos, estilo, filtro, captura, stickers y resultado.
- `src/hooks/useCamera.ts`: permisos, ciclo de vida del video, cambio de cámara y captura.
- `src/utils/cameraDevices.ts`: detección de cámara trasera a partir de los dispositivos y sus metadatos.
- `src/hooks/useStripPreview.ts`: generación de vistas previas y descarte de resultados antiguos.
- `src/utils/stripLayout.ts`: medidas y distribución de 1 a 4 fotos.
- `src/utils/canvasUtils.ts`: composición del PNG con fondo, fotos, filtros, crédito y stickers.
- `src/utils/photoEffects.ts` y `src/components/ui/ArtFilterPreview.tsx`: efectos compartidos entre el video en vivo y la exportación.
- `src/hooks/useStickerGestures.ts` y `src/utils/stickerGestures.ts`: arrastre y gestos de dos dedos.
- `src/components/ui/DownloadStrip.tsx`: descarga Blob, menú nativo, alternativa de guardado y avisos.
- `src/components/ui/StripCreditLink.tsx` y `src/utils/branding.ts`: enlaces de los créditos de la tira y destino de Instagram.
- `src/i18n/`: selección de idioma, persistencia local y traducciones al español.
- `src/styles/index.css`: diseño, tamaños adaptables y controles táctiles.
- `public/`: cámara, fondos, patrones, stickers, filtros y fuentes.

## Cámara

El video se coloca dentro de la pantalla de `public/camera/camera.png`, conservando un encuadre de 4:3. La captura usa el mismo recorte central, sin estirar la imagen. La cámara frontal se refleja tanto en la vista previa como en la captura; la trasera conserva la orientación normal.

Después de obtener permiso, se consultan los dispositivos disponibles. Se usan sus capacidades, etiquetas o los datos de la cámara activa para identificar una trasera. Tener varias webcams no basta. Si no se identifica una trasera, la opción no se muestra. Los cambios de dispositivos actualizan la disponibilidad.

Cambiar de cámara detiene la anterior antes de solicitar la nueva. Si la trasera ya no está disponible, se oculta y se vuelve a la frontal. El selector se bloquea durante la secuencia de captura. Las respuestas de permisos antiguas se descartan y sus tracks se detienen; la cámara también se libera al salir de la pantalla.

## Sesión y personalización

Las capturas originales se conservan en memoria para volver a aplicar filtros sin acumular efectos. Personalizar fotos existentes muestra la tira y no solicita una cámara nueva.

`Repeat` conserva cantidad, fondo, filtro, stickers y elección de cámara, y elimina las capturas anteriores para repetir la secuencia. `Main Menu` reinicia la sesión. Cambiar la cantidad elimina las fotos y los stickers; recargar también pierde la sesión. El idioma se mantiene por separado en almacenamiento local.

En el editor, un dedo mueve el sticker y dos dedos permiten cambiar tamaño, rotación y posición. Al levantar un dedo, el arrastre continúa sin saltar de posición. Los controles manuales permiten tamaño en porcentaje, giro en pasos de 15°, rotación precisa, volteo horizontal/vertical, restablecimiento, duplicado y borrado. Las flechas del teclado mueven el sticker; Shift aumenta el paso y Delete/Backspace lo elimina.

## Catálogos y archivos

Las definiciones son explícitas; copiar una imagen a `public/` no actualiza por sí solo el selector.

- Patrones y colores: `src/utils/constants.ts`. El catálogo actual usa los archivos numerados del 1 al 27 en `public/patrones/` y 20 colores sólidos.
- Filtros: el mismo archivo define Normal, 2016, Sepia, B&W, Vintage, Cool, Sepia Film, Rose Pop, Pink Ink y Blue Moon. Los efectos de píxeles se implementan en `src/utils/photoEffects.ts`.
- Stickers: `src/utils/stickers.ts`, con 70 PNG y paginación de 12 por página. El abecedario A–Z está seguido de `AND.png` y `exclamation.png`. La letra S usa el nombre `S.PNG`; respeta la capitalización exacta para el deploy en Linux.
- Idiomas: el texto base está en inglés y su traducción está en `src/i18n/es.ts`. Agrega ambas versiones cuando incorpores texto a la interfaz.

Los filtros se aplican a las fotos, no al fondo ni a los stickers. Los efectos 2016 y los filtros de píxeles se usan tanto en la cámara como en el PNG.

## Patrones de la galería

`src/utils/customPattern.ts` valida el archivo, limita su tamaño a 15 MB y lo prepara localmente como PNG. Conserva las proporciones y limita el lado mayor a 1536 píxeles. El exportador repite la imagen como patrón sin estirarla.

`CustomPatternPicker` conserva el último patrón válido si falla un reemplazo y descarta cargas que terminan después de salir de la categoría. La imagen se mantiene durante la sesión y se elimina al reiniciarla; no se sube al servidor.

## Exportación y guardado

`generateStrip` compone el fondo, las fotos y el crédito; después dibuja los stickers con sus posiciones normalizadas, tamaño, rotación y volteos. La vista final y la descarga usan el mismo PNG. `useStripPreview` descarta generaciones antiguas para evitar mostrar un fondo o filtro anterior.

El archivo se prepara antes de pulsar Descargar para conservar la activación del usuario necesaria en el menú nativo:

- En escritorio, un enlace Blob inicia la descarga PNG.
- En iPhone/iPad y Android, se usa `navigator.canShare({ files })` y `navigator.share()` cuando se admiten archivos.
- Android conserva además la descarga normal `Download file`. Las apps de destino dependen del dispositivo; la web no puede garantizar el guardado directo en Galería.
- Si el menú nativo no está disponible o falla, se muestra la imagen para guardarla manualmente o abrirla en otra pestaña. Cancelar el menú no se trata como error.
- El aviso de descarga confirma su inicio. La web no puede confirmar la escritura final al disco; el aviso del menú nativo indica que terminó la acción de guardar o compartir.

Los créditos de las vistas web tienen un enlace superpuesto al crédito impreso. El PNG descargado conserva el texto y no contiene enlaces interactivos.

Referencias: [activación del usuario en WebKit](https://webkit.org/blog/13862/the-user-activation-api/) y [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).

## QR deshabilitado

`ShareQr` y sus pruebas se conservan para una versión futura, pero el componente no se monta en el resultado. La primera versión no muestra el QR y su compilación excluye el código de carga a Cloudinary. No configures Cloudinary para activar esta versión: cambiar variables de entorno no vuelve a montar el componente.

Nunca guardes secretos en variables `VITE_`: los valores usados por el frontend pueden formar parte de la compilación pública. `.env.local` permanece fuera de Git.

## Netlify y validación

La configuración está en [`../netlify.toml`](../netlify.toml):

- Rama de producción configurada en Netlify: `main`.
- Carpeta base: `thephotobooth`.
- Node: `22`.
- Comando de compilación: `npm run build`.
- Carpeta publicada, relativa a la base: `dist`.

Cada push a `main` inicia un deploy. El sitio se actualiza cuando la compilación termina correctamente. `lint` y las pruebas se ejecutan localmente; el comando actual de Netlify ejecuta la compilación, no esos dos controles por separado.

Antes de publicar, ejecuta `npm run lint`, `npm test` y `npm run build`. Las pruebas cubren cámara y permisos tardíos, disponibilidad de la trasera, captura con y sin efecto espejo, composición del PNG, filtros, personalización, gestos de stickers, imágenes de galería, idiomas y guardado por dispositivo. Los menús nativos y las apps de destino requieren también comprobación en dispositivos reales.

`node_modules/`, `dist/`, `.env.local` y `work/` están excluidos de Git. Usa `work/` para fixtures y artefactos de revisión; no los incluyas en el deploy.
