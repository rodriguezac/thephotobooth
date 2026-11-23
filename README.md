# The Photobooth

Fotocabina web con estética retro: toma fotos, crea una tira personalizada y descárgala como PNG. Está hecha con React, TypeScript y Vite, y se puede usar en inglés o español desde celulares, tablets y computadoras.

**[Abrir The Photobooth](https://thephotobooth-raspaorojo.netlify.app/)** · [Instagram: @raspaorojo](https://www.instagram.com/raspaorojo/)

## Funciones

- Captura automática de **1 a 4 fotos**, con cuenta regresiva. Las tiras de 1 a 3 fotos son verticales; 4 fotos usan una cuadrícula de 2 × 2.
- **27 patrones en WebP sin pérdida y 20 colores sólidos**, con paginación mediante flechas o deslizamiento horizontal en pantallas táctiles, además de la opción de usar una imagen de la galería como patrón.
- **10 filtros**: Normal, 2016, Sepia, B&W, Vintage, Cool, Sepia Film, Rose Pop, Pink Ink y Blue Moon. Se pueden cambiar después de tomar las fotos.
- **70 stickers en WebP sin pérdida**, incluidos el abecedario completo de A a Z, seguido de `&` y `!`.
- El catálogo de stickers también permite cambiar de página deslizando a izquierda o derecha en pantallas táctiles.
- Editor de stickers con arrastre, tamaño en porcentaje, rotación, volteo, duplicado y borrado. En pantallas táctiles también admite dos dedos para ajustar tamaño y rotación.
- Selección de cámara frontal o trasera. La opción trasera solo aparece cuando el navegador identifica una disponible.
- Vista ampliada de la tira, descarga PNG y opciones de guardado o compartición según el dispositivo.
- Todos los créditos `@raspaorojo` de la web enlazan a Instagram, incluidos los que aparecen dentro de las vistas de la tira.

**El QR está oculto y deshabilitado en esta primera versión.** No hace falta configurar Cloudinary ni variables de entorno para usar las funciones actuales.

## Cómo usarla

1. Elige **English** o **Español** en el inicio y pulsa **Start / Empezar**.
2. Selecciona la cantidad de fotos y el diseño de la tira.
3. Elige un filtro y permite el acceso a la cámara. Si hay una cámara trasera identificada, puedes seleccionarla.
4. Pulsa **Start / Empezar** para iniciar la secuencia de fotos.
5. En el resultado, usa **Customize / Personalizar** para cambiar el fondo, el filtro o agregar stickers; **Repeat / Repetir** para volver a tomar las fotos con los mismos ajustes; o **Main Menu / Menú principal** para empezar una sesión nueva.
6. Pulsa **Download / Descargar** para guardar o compartir la tira.

En el editor de stickers, toca o arrastra uno desde el catálogo. Selecciónalo para ver los iconos de duplicar y borrar, o usa las herramientas de tamaño, rotación y volteo. Pulsa **Done / Listo** para dejar de editarlo y desplazarte por la página con normalidad.

### Usar un patrón de la galería

En el selector de estilo, elige **Your image / Tu imagen → Upload image / Subir imagen**. Admite imágenes de hasta **15 MB**; se recomienda JPG, PNG o WebP.

La imagen se prepara en el dispositivo, conserva sus proporciones y se repite como patrón. Puedes reemplazarla o alternar con otros diseños durante la sesión. Se conserva al usar **Repeat / Repetir** y aparece en el PNG descargado.

### Guardar según el dispositivo

- **Computadora:** descarga un archivo `the-photobooth.png`. El aviso confirma el inicio de la descarga; el navegador no informa a la web de su escritura final al disco.
- **iPhone y iPad:** abre el menú nativo cuando admite compartir archivos. Si no está disponible o falla, muestra la tira para mantenerla presionada y guardarla, con un enlace para abrir la imagen.
- **Android:** abre el menú nativo para elegir una app de fotos, si el dispositivo ofrece ese destino. También incluye **Download file / Descargar archivo** para la descarga normal a Archivos/Descargas. La web no puede forzar el guardado directo en Galería.

Los destinos del menú dependen del navegador, el sistema y las apps instaladas. Cancelar el menú no se considera un error. El PNG es una imagen: conserva el crédito impreso, pero sus enlaces solo son interactivos en las vistas de la web.

## Privacidad y sesión

Las fotos, los patrones de la galería y la composición se procesan en el navegador. La web no los sube automáticamente a un servidor. Al usar el menú nativo para compartir, el archivo se entrega a la app que el usuario elija.

Las fotos y la composición se mantienen en memoria durante la sesión; recargar la página o volver al menú principal las descarta. La preferencia de idioma se guarda localmente. Personalizar una tira ya capturada no vuelve a activar la cámara.

La cámara requiere **localhost o HTTPS**, permiso del navegador y permiso del dispositivo. Si está ocupada, cierra otras apps que la estén utilizando y vuelve a intentarlo. Si el navegador no expone información suficiente para identificar la cámara trasera, esa opción permanece oculta.

## Desarrollo local

Se recomienda **Node.js 22** y npm, en línea con la configuración de Netlify. La aplicación está en `thephotobooth/`.

```sh
git clone https://github.com/rodriguezac/thephotobooth.git
cd thephotobooth/thephotobooth
npm ci
npm run dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173/`.

```sh
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` valida TypeScript y genera `dist/`. `npm run preview` sirve esa compilación para revisarla localmente.

## Publicación en Netlify

El proyecto está conectado a este repositorio con **`main` como rama de producción**. Cada push a `main` inicia una compilación y publica el resultado si termina correctamente. Guardar cambios locales sin hacer commit y push no actualiza el sitio.

La configuración está en [netlify.toml](netlify.toml): carpeta base `thephotobooth`, comando `npm run build`, salida `dist` y Node 22. La ruta completa de la salida dentro del repositorio es `thephotobooth/dist`.

Para publicar cambios desde un checkout existente, revisa los archivos y las comprobaciones antes de hacer commit y push. No subas `.env.local`, `node_modules`, `dist` ni los archivos de prueba de `work/`.

## Código y mantenimiento

- [Documentación técnica](thephotobooth/README.md): estructura, cámara, exportación, catálogos y pruebas.
- [Catálogos de patrones, colores y filtros](thephotobooth/src/utils/constants.ts).
- [Catálogo de stickers](thephotobooth/src/utils/stickers.ts).
- [Textos en español](thephotobooth/src/i18n/es.ts).

Agregar archivos a las carpetas de imágenes no los incorpora por sí solo a los catálogos: también hay que actualizar sus definiciones y respetar las mayúsculas y minúsculas de los nombres de archivo.
