# Manual de usuario

## Plataforma Educativa

### 1. Requisitos

- Node.js 22.13 o superior.
- npm.
- Expo Go en Android/iOS o un emulador configurado.
- Proyecto de Supabase configurado con el esquema incluido en `supabase/schema.sql`.

### 2. Instalación

Desde la carpeta raíz del proyecto:

```bash
npm install
npx expo start -c
```

Escanea el código QR con Expo Go o ejecuta la aplicación en un emulador.

### 3. Inicio de sesión

1. Escribe el correo de un usuario creado en Supabase Authentication.
2. Escribe su contraseña.
3. Presiona **Entrar al campus**.
4. Usa el icono de usuario de la esquina superior derecha para consultar el perfil o cerrar sesión.

Si el correo no está confirmado, confírmalo desde el enlace enviado por Supabase.

### 4. Menú principal

#### Estudiantes

Permite registrar estudiantes con ID, nombre, correo y carrera. La carrera se selecciona desde una lista. También permite buscar por ID y eliminar registros.

#### Asignaturas

Permite registrar materias, buscar por código, consultar la lista y eliminar una materia. Al eliminar una materia se solicita confirmación porque también se eliminan sus calificaciones relacionadas.

#### Notas

Permite guardar calificaciones, buscar una nota y elegir el orden de visualización. La "i" junto a cada opción explica InOrden, PreOrden y PostOrden. Cada calificación puede eliminarse.

#### Tareas

Permite agregar entregas y procesar la entrega más reciente. La aplicación conserva el orden de una pila: la última entrega agregada se atiende primero.

#### Tutorías

Permite registrar una solicitud con estudiante, materia y tema. Las solicitudes se atienden por orden de llegada.

#### Red

Permite seleccionar estudiantes registrados, agregarlos a una red, conectar estudiantes, eliminar relaciones y explorar la red por niveles o en profundidad.

### 5. Errores frecuentes

- **No se puede conectar con Supabase:** revisa la URL del proyecto, la clave pública y la conexión a internet.
- **Credenciales incorrectas:** verifica el correo y la contraseña en Authentication > Users.
- **No aparecen estudiantes en Red:** primero registra estudiantes en la pestaña Estudiantes.
- **No se pueden cargar tutorías:** confirma que la tabla `tutorias` tenga la columna `materia`.

### 6. Cierre de sesión

Abre el perfil desde el icono superior derecho y presiona **Cerrar sesión**. La aplicación cerrará la sesión de Supabase y regresará al login.
