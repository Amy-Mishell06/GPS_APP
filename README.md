# GPS_APP — Ubicación, rutas y registro en .txt

App móvil hecha con Ionic + Angular + Capacitor que obtiene la posición GPS del dispositivo, genera enlaces de Google Maps (ubicación y ruta) y permite guardar esos enlaces en archivos .txt.

Proyecto académico desarrollado a partir de la app base MiUbicacionAPP_ionic (Ing. Juan Pablo Zaldumbide, ESFOT – EPN), a la que se le agregaron las funcionalidades descritas abajo.

# ¿Qué hace la app?
#	Funcionalidad	Cómo se ve en la app
1	Enlace a mi posición GPS	Enlace "Ver mi ubicación en Google Maps" en la tarjeta de coordenadas
2	Enlace con mi ruta (origen, destino y paradas)	Tarjeta "Mi ruta" → enlace "Ver ruta en Google Maps"
3	Guardar mi ubicación en .txt	Botón "Guardar ubicación (.txt)" → ubicacion.txt
4	Guardar mi ruta en .txt	Botón "Guardar ruta (.txt)" → ruta.txt

Además conserva lo de la app base: mostrar latitud/longitud y seguimiento de la ubicación en tiempo real.

🔗 Formato de los enlaces

Ubicación actual

https://www.google.com/maps/@{LAT},{LNG},17z

Ejemplo: https://www.google.com/maps/@-0.2025464,-78.4941719,17z

Ruta (el origen es la ubicación actual del celular; destino y paradas se escriben en la app)

https://www.google.com/maps/dir/?api=1&origin={LAT,LNG}&destination={LAT,LNG}&waypoints={LAT,LNG}%7C{LAT,LNG}

Las paradas se escriben separadas por | (por ejemplo -0.201452,-78.498124|-0.220164,-78.512328) y la app las convierte a %7C en la URL.

Para obtener las coordenadas de un lugar: en Google Maps haz clic derecho (o mantén presionado en el celular) sobre el sitio y copia los números que aparecen.

# ¿Dónde se guardan los .txt?

Cada vez que se presiona un botón de guardar se agrega una línea con fecha, hora y enlace, así el archivo funciona como historial:

22/10/2026, 8:45:10 - https://www.google.com/maps/@-0.2101,-78.4889,17z
Plataforma	Ubicación del archivo
Android	Carpeta Documentos del teléfono (ubicacion.txt, ruta.txt)
Navegador (ionic serve)	Se descarga en la carpeta Descargas
Tecnologías
Ionic 8 + Angular 20 (componentes standalone y signals)
Capacitor 7
@capacitor/geolocation → posición GPS
@capacitor/filesystem → escritura de archivos .txt
TypeScript
Archivos principales
text
src/app/
├── home/
│   ├── home.page.html      # Interfaz: coordenadas, enlaces, tarjeta "Mi ruta" y botones
│   ├── home.page.ts        # Lógica: arma las URL y llama al guardado
│   └── home.page.scss      # Estilos de los enlaces
└── services/
    ├── location.ts         # Permisos y lectura del GPS (con reintento si se agota el tiempo)
    └── file-saver.ts       # Guarda el .txt (Filesystem en Android / descarga en navegador)
Cómo ejecutarla
En la computadora
bash
git clone https://github.com/Amy-Mishell06/GPS_APP.git
cd GPS_APP
npm install
ionic serve

En PC la ubicación depende de Windows: activa Configuración → Privacidad y seguridad → Ubicación y permite la ubicación al navegador. Sin Wi-Fi puede aparecer "Timeout expired".

En un celular Android
bash
npm install @capacitor/android@7.4.3
ionic build
npx cap add android
npx cap sync android
npx cap open android

En Android Studio, seleccionar el celular conectado por USB (con Depuración USB activada) y presionar ▶️.

Permisos necesarios — en android/app/src/main/AndroidManifest.xml, antes de </manifest>:

xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />

Cada vez que se cambie código en src/: ionic build y npx cap sync android, luego ▶️ de nuevo.

Problemas que encontré y cómo los resolví
Problema	Solución
Timeout expired en el navegador de la PC	Se agregó un segundo intento con precisión normal (Wi-Fi) y más tiempo de espera; activar la ubicación en Windows.
ERESOLVE al instalar @capacitor/android@^7	Instalar la versión que coincide con el core: @capacitor/android@7.4.3.
Gradle no se descargaba (Read timed out)	Subir networkTimeout=120000 en gradle-wrapper.properties o descargar el .zip de Gradle manualmente.
Missing the following permissions in AndroidManifest.xml	Agregar los permisos de ubicación fuera de <application>.
# Capturas
Pantalla principal	
<img width="803" height="1600" alt="image" src="https://github.com/user-attachments/assets/b8a7a401-829a-458e-8abe-8082bcafdcf4" />

Ubicación obtenida	
<img width="450" alt="WhatsApp Image 2026-10-22 at 11 59 20 AM" src="https://github.com/user-attachments/assets/e9bf96b5-388a-4cc1-96cd-6ae3da44b40e" />

Ruta en Google Maps
<img width="450" alt="image" src="https://github.com/user-attachments/assets/9c7c6357-b999-416c-8071-67f3088b4951" />

Aviso de guardado	Archivos .txt
<img width="450" alt="WhatsApp Image 2026-10-22 at 11 59 20 AM (2)" src="https://github.com/user-attachments/assets/872a4c56-3505-4c14-8e6f-cbbdd5825de8" />
