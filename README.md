# TFG - Plataforma SIEM amb Dashboard de Ciberseguretat

Aquest projecte correspon al Treball de Final de Grau (TFG) i consisteix en el desenvolupament d'una plataforma inspirada en un SIEM (Security Information and Event Management) amb dashboard web.

L'objectiu del sistema és recollir, processar, analitzar i visualitzar logs de seguretat provinents de diferents fonts per detectar incidents i comportaments anòmals.

## Objectius del projecte

- Recollir logs de diferents fonts de seguretat
- Normalitzar els logs en un model comú
- Emmagatzemar la informació en una base de dades centralitzada
- Detectar incidents o anomalies
- Mostrar la informació en un dashboard web interactiu

## Arquitectura del sistema

```
React (Frontend)
    ->
Spring Boot API (Backend)
    ->
PostgreSQL (Base de dades)
```

### Frontend

El frontend està desenvolupat amb React i Vite i segueix una estructura MVVM:

- `views`: pantalles d'interfície
- `viewmodels`: lògica d'estat i presentació
- `services`: comunicació amb l'API
- `models`: models de dades frontend
- `components`: components reutilitzables

### Backend

El backend està implementat amb Spring Boot i exposa APIs REST per gestionar:

- Ingesta de logs
- Normalització d'esdeveniments
- Gestió d'empreses i fonts
- Generació i gestió d'alertes

Estructura en capes:

- `controller`: endpoints REST
- `service`: lògica de negoci
- `repository`: accés a persistència
- `model`: entitats JPA
- `dto`: payloads d'API
- `exception`: gestió d'excepcions

### Base de dades

S'utilitza PostgreSQL per emmagatzemar empreses, fonts, logs i alertes.

La base de dades s'aixeca amb Docker Compose per garantir un entorn local reproductible.

## Tecnologies

### Frontend
- React
- Vite
- JavaScript

### Backend
- Java 17
- Spring Boot
- Spring Data JPA

### Base de dades
- PostgreSQL

### Infraestructura
- Docker
- Docker Compose

### Control de versions
- Git
- GitHub

## Estructura del repositori

```
tfg-siem/
+-- backend/
+-- frontend/
+-- infra/
+-- docs/
```

## Requisits previs

- Git
- Docker Desktop
- Java 17
- Node.js (LTS)
- npm

## Instal·lació i execució

### 1. Clonar el repositori

```bash
git clone https://github.com/quico16/tfg-siem.git
cd tfg-siem
```

### 2. Arrencar PostgreSQL

```bash
cd infra
docker compose up -d
```

Comprovar l'estat dels contenidors:

```bash
docker ps
```

### 3. Arrencar el backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`

### 4. Arrencar el frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Proxy frontend -> backend

Vite està configurat per redirigir les crides API:

- `/api` -> `http://localhost:8080`

Això evita problemes de CORS durant el desenvolupament local.

## Autor

Francesc Navarro Vázquez  
Treball de Final de Grau - Ciberseguretat

## Comanda opcional de seed

```powershell
powershell -ExecutionPolicy Bypass -File .\seed-data-3-companies-100-logs.ps1
```

