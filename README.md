# TFG - Plataforma SIEM amb Dashboard de Ciberseguretat

Aquest projecte correspon al Treball de Final de Grau (TFG) i consisteix en el desenvolupament d'una plataforma inspirada en un SIEM (Security Information and Event Management) amb dashboard web.

L'objectiu del sistema �s recollir, processar, analitzar i visualitzar logs de seguretat provinents de diferents fonts per detectar incidents i comportaments an�mals.

## Objectius del projecte

- Recollir logs de diferents fonts de seguretat
- Normalitzar els logs en un model com�
- Emmagatzemar la informaci� en una base de dades centralitzada
- Detectar incidents o anomalies
- Mostrar la informaci� en un dashboard web interactiu

## Arquitectura del sistema

```
React (Frontend)
    ->
Spring Boot API (Backend)
    ->
PostgreSQL (Base de dades)
```

### Frontend

El frontend est� desenvolupat amb React i Vite i segueix una estructura MVVM:

- `views`: pantalles d'interf�cie
- `viewmodels`: l�gica d'estat i presentaci�
- `services`: comunicaci� amb l'API
- `models`: models de dades frontend
- `components`: components reutilitzables

### Backend

El backend est� implementat amb Spring Boot i exposa APIs REST per gestionar:

- Ingesta de logs
- Normalitzaci� d'esdeveniments
- Gesti� d'empreses i fonts
- Generaci� i gesti� d'alertes

Estructura en capes:

- `controller`: endpoints REST
- `service`: l�gica de negoci
- `repository`: acc�s a persist�ncia
- `model`: entitats JPA
- `dto`: payloads d'API
- `exception`: gesti� d'excepcions

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

## Instal�laci� i execuci�

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

Vite est� configurat per redirigir les crides API:

- `/api` -> `http://localhost:8080`

Aix� evita problemes de CORS durant el desenvolupament local.

## Autor

Francesc Navarro V�zquez  
Treball de Final de Grau - Ciberseguretat

## Comanda opcional de seed

```powershell
powershell -ExecutionPolicy Bypass -File .\seed-data-varied-dates.ps1
```

 powershell -ExecutionPolicy Bypass -File .\seed-data-varied-dates.ps1

---

# Lint en commits i PR

Per activar el lint automatic a cada commit en local:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-git-hooks.ps1
```

El hook executa:

```bash
npm --prefix frontend run lint
cd backend && ./mvnw -q -DskipTests checkstyle:check
```

A GitHub, el workflow `.github/workflows/lint.yml` valida automaticament frontend i backend a cada push i PR.
