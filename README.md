# TFG – Plataforma SIEM amb Dashboard de Ciberseguretat

Aquest projecte correspon al **Treball de Final de Grau (TFG)** i consisteix en el desenvolupament d’una plataforma inspirada en un **SIEM (Security Information and Event Management)** amb dashboard web.

L’objectiu del sistema és permetre **recollir, processar, analitzar i visualitzar logs de seguretat** provinents de diferents fonts amb la finalitat de detectar possibles incidents o comportaments anòmals.

---

# Objectius del projecte

Els objectius principals del projecte són:

- Recollir logs de diferents fonts de seguretat
- Normalitzar els logs en un model comú
- Emmagatzemar-los en una base de dades centralitzada
- Detectar possibles incidents o anomalies
- Mostrar la informació en un dashboard web interactiu

---

# Arquitectura del sistema

El sistema segueix una arquitectura **Full Stack basada en separació de capes**.

```
React (Frontend)
        ↓
Spring Boot API (Backend)
        ↓
PostgreSQL (Base de dades)
```

## Frontend

El frontend està desenvolupat amb **React** utilitzant **Vite** com a entorn de desenvolupament.

La seva funció és proporcionar un **dashboard interactiu** que permeti:

- Visualitzar logs de seguretat
- Consultar alertes generades
- Mostrar estadístiques i gràfics
- Gestionar empreses i usuaris

El frontend segueix una arquitectura **MVVM (Model – View – ViewModel)** per separar:

- la interfície d’usuari
- la lògica de presentació
- les crides a l’API

---

## Backend

El backend està implementat amb **Spring Boot** i proporciona una **API REST** que gestiona:

- ingestió de logs
- normalització d’esdeveniments
- gestió d’empreses i usuaris
- generació d’alertes

El backend segueix una arquitectura **en capes (Layered Architecture)**:

- `controller` → endpoints REST  
- `service` → lògica de negoci  
- `repository` → accés a la base de dades  
- `model` → entitats JPA  
- `dto` → objectes d’intercanvi de dades  
- `config` → configuració del sistema  
- `exception` → gestió d’errors  

---

## Base de dades

La base de dades utilitzada és **PostgreSQL**, on s’emmagatzemen:

- empreses
- usuaris
- logs de seguretat
- alertes generades

La base de dades s’executa mitjançant **Docker Compose**, cosa que permet desplegar el sistema de forma consistent en qualsevol entorn.

---

# Tecnologies utilitzades

## Frontend
- React
- Vite
- JavaScript

## Backend
- Java 17
- Spring Boot
- Spring Data JPA

## Base de dades
- PostgreSQL

## Infraestructura
- Docker
- Docker Compose

## Control de versions
- Git
- GitHub

---

# Estructura del projecte

```
tfg-siem
│
├── backend
│   ├── src/main/java/com/tfg/siem
│   │   ├── controller
│   │   ├── service
│   │   ├── repository
│   │   ├── model
│   │   ├── dto
│   │   ├── config
│   │   └── exception
│   │
│   └── src/main/resources
│       └── application.properties
│
├── frontend
│   └── src
│       ├── views
│       ├── viewmodels
│       ├── services
│       ├── models
│       └── components
│
├── infra
│   └── docker-compose.yml
│
└── docs
```

---

# Requisits previs

Per executar el projecte és necessari tenir instal·lat:

- Git
- Docker Desktop
- Java 17
- Node.js (LTS)
- npm

---

# Instal·lació i execució del projecte

## 1. Clonar el repositori

```bash
git clone https://github.com/quico16/tfg-siem.git
cd tfg-siem
```

---

# 2. Configurar variables d’entorn

Afegir o no per amagar-ho?

---

# 3. Arrencar la base de dades

Executar PostgreSQL mitjançant Docker:

```bash
cd infra
docker compose up -d
```

Comprovar que el contenidor està en execució:

```bash
docker ps
```

---

# 4. Arrencar el backend

En una nova terminal:

```bash
cd backend
./mvnw spring-boot:run
```

El backend s'executarà a:

```
http://localhost:8080
```

---

# 5. Arrencar el frontend

En una altra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend s'executarà a:

```
http://localhost:5173
```

---

# Proxy frontend → backend

El frontend utilitza un **proxy configurat a Vite** per redirigir les crides API:

```
/api → http://localhost:8080
```

Això evita problemes de **CORS durant el desenvolupament**.

---

# Autor

Francesc Navarro Vázquez  
Treball de Final de Grau – Ciberseguretat


 powershell -ExecutionPolicy Bypass -File .\seed-data-varied-dates.ps1