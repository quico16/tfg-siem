# TFG – Sistema SIEM amb Dashboard de Ciberseguretat

Aquest projecte correspon al **Treball de Final de Grau (TFG)** i consisteix en el desenvolupament d’un **dashboard de ciberseguretat inspirat en un sistema SIEM (Security Information and Event Management)**.

L’objectiu del sistema és permetre **recollir, processar, analitzar i visualitzar logs de seguretat** provinents de diferents fonts amb la finalitat de detectar possibles incidents o comportaments anòmals.

---

# Objectius del projecte

Els objectius principals són:

* Recollir logs de diferents fonts de seguretat
* Normalitzar els logs en un model comú
* Emmagatzemar-los en una base de dades centralitzada
* Detectar possibles incidents o anomalies
* Mostrar la informació en un dashboard web interactiu

---

# Arquitectura del sistema

El projecte segueix una arquitectura **Full Stack basada en microcapes**.

```text
Frontend (React)
        ↓
Backend API (Spring Boot)
        ↓
Base de dades (PostgreSQL)
```

### Frontend

El frontend està desenvolupat amb **React** i permet visualitzar:

* estadístiques de logs
* incidents detectats
* alertes actives
* informació de seguretat de les empreses

### Backend

El backend està implementat amb **Spring Boot** i s'encarrega de:

* ingestió de logs
* normalització d'esdeveniments
* gestió d'usuaris i empreses
* detecció d'incidents
* exposició d'una API REST

### Base de dades

La base de dades utilitzada és **PostgreSQL**, on es guarden:

* empreses
* usuaris
* logs normalitzats
* alertes generades

### Infraestructura

La base de dades es desplega mitjançant **Docker Compose**, permetent executar el sistema fàcilment en qualsevol entorn.

---

# Tecnologies utilitzades

## Frontend

* React
* Vite
* JavaScript

## Backend

* Java 17
* Spring Boot
* Spring Data JPA

## Base de dades

* PostgreSQL

## Infraestructura

* Docker
* Docker Compose

## Control de versions

* Git
* GitHub

---

# Estructura del projecte

```text
tfg-siem
│
├── backend
│   ├── controller      # Endpoints REST
│   ├── service         # Lògica de negoci
│   ├── repository      # Accés a la base de dades
│   ├── model           # Entitats del sistema
│   └── resources       # Configuració
│
├── frontend
│   ├── src             # Components React
│   └── public
│
├── infra
│   └── docker-compose.yml   # Infraestructura de la BD
│
└── docs                 # Documentació del projecte
```

---

# Instal·lació del projecte

## 1. Clonar el repositori

```bash
git clone https://github.com/quico16/tfg-siem.git
cd tfg-siem
```

---

# 2. Arrencar la base de dades

Executar PostgreSQL mitjançant Docker:

```bash
cd infra
docker compose up -d
```

Això iniciarà la base de dades PostgreSQL en segon pla.

---

# 3. Arrencar el backend

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

# 4. Arrencar el frontend

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


# Autor

Francesc Navarro Vázquez
Treball de Final de Grau – Ciberseguretat
