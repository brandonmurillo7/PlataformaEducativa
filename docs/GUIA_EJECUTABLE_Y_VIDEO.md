# Ejecutable y video promocional

## 1. Ejecutable Android

El proyecto Expo puede ejecutarse durante la exposición con:

```bash
npm install
npx expo start -c
```

Para generar un APK instalable con EAS Build:

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
```

Cuando el proceso termine, EAS mostrará un enlace para descargar el APK.

### Enlace de descarga del APK

Pega aquí el enlace que entregue EAS:

https://expo.dev/accounts/brandonmurillo/projects/temp_app/builds/116ecfa9-a389-4362-adc2-7f74c31f0446


Antes de compilar, verifica:

- Que `EXPO_PUBLIC_SUPABASE_URL` esté configurada.
- Que la clave pública de Supabase sea válida.
- Que el esquema SQL esté ejecutado.
- Que exista al menos un usuario confirmado en Supabase Authentication.

El APK generado por EAS debe incluirse como archivo adjunto de la entrega. No se incluye automáticamente en el repositorio porque se genera en la cuenta de Expo del equipo.

## 2. Video promocional corto

Duración sugerida: 60 a 90 segundos.

### Guion

**0-08 s: Presentación**

Mostrar el logo y decir: “Plataforma Educativa: una aplicación móvil para organizar la gestión académica con estructuras de datos.”

**08-20 s: Login**

Mostrar el inicio de sesión con Supabase y entrar con un usuario creado en Authentication.

**20-32 s: Estudiantes y asignaturas**

Registrar un estudiante, seleccionar su carrera, buscarlo por ID y mostrar una materia registrada.

**32-44 s: Calificaciones**

Agregar varias notas, cambiar entre InOrden, PreOrden y PostOrden, mostrar la ayuda de la “i” y eliminar una calificación.

**44-56 s: Entregas y tutorías**

Agregar dos entregas y procesar la más reciente. Después registrar dos solicitudes y atender la primera.

**56-70 s: Red**

Seleccionar estudiantes registrados, conectarlos, mostrar una relación y ejecutar un recorrido por niveles o en profundidad.

**70-80 s: Perfil y cierre**

Abrir el perfil desde el icono superior derecho y cerrar sesión.

**80-90 s: Cierre**

Mostrar una pantalla con las seis estructuras y decir: “La plataforma combina una solución educativa funcional con la aplicación práctica de listas, pilas, colas, árboles, tablas hash y grafos.”

### Recomendaciones de grabación

- Grabar en orientación vertical.
- Usar datos de prueba que no contengan información personal real.
- Activar el modo No molestar.
- Mostrar mensajes y botones con claridad.
- No mostrar claves, tokens ni archivos `.env`.
- Exportar en MP4, resolución mínima 1080 x 1920 si se graba en celular.
