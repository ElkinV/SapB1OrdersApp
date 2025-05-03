# Ordenes de Venta

Este proyecto proporciona una aplicación que emula la funcionalidad de creación de órdenes de venta en SAP Business One, utilizando **Service Layer** y **ODBC**. El objetivo principal es evitar la necesidad de adquirir licencias adicionales de SAP, aprovechando herramientas integradas.

## Estructura del Proyecto

1. **Archivos de Configuración**
    - **.env**: Almacena variables de entorno, incluyendo las credenciales y URL de SAP Service Layer.
    - **eslint.config.js**: Configura reglas de ESLint para garantizar la calidad del código.
    - **tailwind.config.js**: Configuración de TailwindCSS para estilos de la interfaz.
    - **vite.config.ts**: Configura Vite para la construcción y desarrollo de la aplicación.

2. **Archivos de Inicialización**
    - **index.html**: Punto de entrada HTML de la aplicación.
    - **package.json**: Lista las dependencias de npm y scripts de inicio y construcción del proyecto.
    - **tsconfig.json** y **tsconfig.app.json**: Configuración de TypeScript para el proyecto, estableciendo opciones de compilación.

3. **Directorios y Archivos Principales**
    - **src/**: Contiene el código fuente de la aplicación.
        - **App.tsx**: Componente principal que organiza la interfaz de usuario en dos tabs: "Crear Orden" y "Ver Ordenes".
        - **components/**: Contiene los componentes de la interfaz.
            - **Header.tsx**: Muestra la cabecera de la aplicación.
            - **ItemSelectionModal.tsx**: Modal que permite seleccionar artículos de una lista.
            - **SalesOrderForm.tsx**: Formulario de creación de órdenes de venta, permitiendo agregar artículos y calcular el total.
            - **SalesOrderList.tsx**: Componente para visualizar las órdenes de venta creadas.
        - **types.ts**: Define interfaces de TypeScript para las estructuras de datos del proyecto (ej. `SalesOrder`, `SalesOrderItem`).

4. **Servidor API**
    - **server.js**: Implementa una API para conectar con SAP Service Layer y ODBC.
        - `/api/items`: Endpoint que recupera y lista artículos desde la base de datos.
        - `/api/orders`: Endpoint que crea una nueva orden de venta en SAP utilizando las credenciales y session del Service Layer.

## Instalación y Configuración

### Prerrequisitos

- **Node.js** y **npm** instalados en el sistema.
- **Acceso a SAP Service Layer**: Asegúrate de tener configuradas las credenciales en el archivo `.env`.

### Pasos de Instalación

1. Clona el repositorio y navega al directorio del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd OrdenesVenta2-main
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` con las variables necesarias:
   ```
   SERVICE_LAYER_URL=<URL_DEL_SERVICE_LAYER>
   SERVICE_LAYER_USERNAME=<USUARIO>
   SERVICE_LAYER_PASSWORD=<CONTRASEÑA>
   SAP_COMPANY_DB=<BASE_DE_DATOS_SAP>
   ```
4. Inicia el servidor:
   ```bash
   node server.js
   ```
5. Inicia la aplicación en modo de desarrollo:
   ```bash
   npm run dev
   ```

## Uso de la Aplicación

- Navega a `http://localhost:3000` para abrir la interfaz.
- Selecciona "Crear Orden" para agregar una nueva orden de venta.
    - Ingresa el nombre del cliente, selecciona artículos y especifica cantidades y precios.
- Selecciona "Ver Ordenes" para visualizar una lista de las órdenes de venta creadas en la sesión.

## Arquitectura de Componentes

### App.tsx
- Controla la visualización de los componentes `SalesOrderForm` y `SalesOrderList` según el tab seleccionado.
- Gestiona el estado de las órdenes de venta.

### SalesOrderForm.tsx
- Formulario de creación de órdenes, que incluye selección de artículos y cálculo automático del total.
- Envía la orden creada al backend mediante un POST request al endpoint `/api/orders`.

### SalesOrderList.tsx
- Muestra las órdenes de venta en una lista.
- Cada orden incluye el nombre del cliente, fecha, artículos y el total calculado.

### server.js
- Configura los endpoints:
    - **/api/items**: Devuelve una lista de artículos desde la base de datos de SAP.
    - **/api/orders**: Envía una orden al SAP Business One utilizando el Service Layer.

## Contribuciones

Para contribuir:
1. Haz un fork del repositorio.
2. Crea una rama nueva (`feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit.
4. Abre un Pull Request.


