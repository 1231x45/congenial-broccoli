BARCODE — GENERADOR Y LECTOR GRATUITO

ARCHIVOS
- index.html: estructura de la aplicación
- styles.css: diseño adaptable a celular y computadora
- app.js: generación, escaneo, historial y descargas

CÓMO USAR
1. Extrae los archivos en una carpeta.
2. Abre index.html en un navegador para probar el generador.
3. Para usar la cámara, sirve la carpeta desde HTTPS o localhost.
   La cámara normalmente NO funciona al abrir el archivo directamente (file://).

PUBLICAR GRATIS EN GITHUB PAGES
1. Crea un repositorio público en GitHub.
2. Sube index.html, styles.css y app.js a la raíz.
3. En Settings > Pages, elige Deploy from a branch y la rama main / root.
4. Abre la URL HTTPS que GitHub Pages te proporciona.

COSTO
El proyecto no requiere backend, cuenta de pago ni API de pago.
JsBarcode se carga desde jsDelivr y Google Fonts desde Google Fonts; por ello,
la generación visual necesita internet la primera vez que se carga la página.
El escáner usa BarcodeDetector integrado en el navegador y requiere HTTPS,
permiso de cámara y compatibilidad del navegador.

ALMACENAMIENTO Y PRIVACIDAD
El historial se guarda en localStorage del navegador de ese dispositivo.
No se sincroniza entre dispositivos y se puede borrar desde Historial.

FORMATOS
Generación: CODE128, EAN13, EAN8 y CODE39.
Escaneo: depende de los formatos que admita BarcodeDetector en el navegador.
EAN-13: introduce 12 dígitos (el dígito de control se calcula) o 13 dígitos válidos.
EAN-8: introduce 7 dígitos (el dígito de control se calcula) u 8 dígitos válidos.
