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

Las fotos se procesan en el navegador y no se envían automáticamente a un servidor. Compartir por QR sí sube la tira final, como se explica abajo. Se conservan originales en memoria para poder personalizar fondo y filtro después de capturar. `CUSTOMIZE` permite volver al estilo y guardar directamente o seguir al filtro; `REPEAT` reinicia la sesión. Al cambiar la cantidad se eliminan las capturas anteriores. Recargar la página también reinicia la sesión.

La previsualización final y la descarga usan el mismo PNG generado con Canvas 2D, evitando diferencias de encuadre, filtro o distribución. Los tests cubren el ciclo de vida de cámara, permisos tardíos, reintentos, captura sin dimensiones y exportación de 1-4 fotos.

## Compartir con QR desde cualquier lugar

El botón `GET QR` sube únicamente la tira final a Cloudinary al pulsarlo y genera un QR localmente con su URL HTTPS pública. No contiene localhost ni la imagen codificada dentro del QR. El QR usa el rosa de la marca `#ff0da2` sobre blanco. El destinatario puede abrir la foto desde otra red y mantenerla presionada para guardarla. Cambiar la tira reinicia el QR para evitar compartir la versión anterior.

Para activar la función:

1. En tu cuenta de Cloudinary, copia el **Cloud name**.
2. En **Settings → Upload → Upload presets**, crea un preset con **Signing mode: Unsigned**. Restringe los formatos a `png`, el tamaño a 5 MB y usa una carpeta dedicada como `photobooth`. Conserva los identificadores únicos y no habilites sobrescritura.
3. Copia `.env.example` a `.env.local` y completa `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`. Son identificadores públicos de esta modalidad; no se requiere API secret.
4. Reinicia Vite. En producción configura las mismas variables antes de compilar.

Mientras falte la configuración, `GET QR` se muestra deshabilitado con una explicación; la descarga local sigue funcionando. Las fotos solo se suben al pulsar ese botón. Son accesibles para cualquiera que reciba el enlace y permanecen en la cuenta hasta que se eliminen desde Cloudinary. El QR dejará de funcionar al eliminar la imagen. El navegador avisa si la subida falla y permite reintentar.

Documentación: https://cloudinary.com/documentation/upload_images#unauthenticated_requests y https://cloudinary.com/documentation/upload_presets
