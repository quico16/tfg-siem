# TFG - SIEM Platform with Cybersecurity Dashboard

This project is a Final Degree Project (TFG) that implements a platform inspired by a SIEM (Security Information and Event Management) solution with a web dashboard.

The goal is to collect, process, analyze, and visualize security logs from different sources to detect incidents and anomalous behavior.

## Project Goals

- Collect logs from different security sources
- Normalize logs into a common model
- Store data in a centralized database
- Detect incidents or anomalies
- Present operational data in an interactive dashboard

## System Architecture

```
React (Frontend)
    ->
Spring Boot API (Backend)
    ->
PostgreSQL (Database)
```

### Frontend

The frontend is built with React and Vite and follows an MVVM structure:

- `views`: UI screens
- `viewmodels`: presentation and state logic
- `services`: API communication
- `models`: frontend data models
- `components`: reusable UI components

### Backend

The backend is built with Spring Boot and exposes REST APIs for:

- Log ingestion
- Event normalization
- Company and source management
- Alert creation and management

Layered backend structure:

- `controller`: REST endpoints
- `service`: business logic
- `repository`: persistence access
- `model`: JPA entities
- `dto`: API payloads
- `exception`: exception handling

### Database

PostgreSQL stores companies, sources, logs, and alerts.

The database is provisioned through Docker Compose for reproducible local environments.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript

### Backend
- Java 17
- Spring Boot
- Spring Data JPA

### Database
- PostgreSQL

### Infrastructure
- Docker
- Docker Compose

### Version Control
- Git
- GitHub

## Repository Structure

```
tfg-siem/
+-- backend/
+-- frontend/
+-- infra/
+-- docs/
```

## Prerequisites

- Git
- Docker Desktop
- Java 17
- Node.js (LTS)
- npm

## Setup and Run

### 1. Clone the repository

```bash
git clone https://github.com/quico16/tfg-siem.git
cd tfg-siem
```

### 2. Start PostgreSQL

```bash
cd infra
docker compose up -d
```

Check container status:

```bash
docker ps
```

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend URL: `http://localhost:8080`

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Frontend Proxy

Vite is configured to proxy API requests:

- `/api` -> `http://localhost:8080`

This avoids CORS issues during local development.

## Author

Francesc Navarro Vázquez  
Final Degree Project - Cybersecurity

## Optional Seed Command

```powershell
powershell -ExecutionPolicy Bypass -File .\seed-data-varied-dates.ps1
```
