# Documentació del desplegament (Frontend + Backend)

## Objectiu
Desplegar l'aplicació del TFG en entorn públic separant:

- **Frontend** a **Netlify**
- **Backend (Spring Boot)** a **Render**
- **Base de dades PostgreSQL** a **Render**

L'objectiu era tenir una arquitectura simple, reproduïble i funcional per demo/avaluació.

## Per què s'ha fet així
S'ha escollit aquesta estratègia perquè:

1. El frontend (Vite/React) encaixa molt bé amb Netlify.
2. El backend actual és Spring Boot tradicional (JVM), i és més natural desplegar-lo a Render que en plataformes orientades a serverless.
3. Render ofereix PostgreSQL gestionat i permet connectar fàcilment backend + DB al mateix entorn.

## Què s'ha fet

### 1) Preparació del frontend per producció
- S'ha ajustat el client HTTP del frontend per controlar millor la URL base d'API en entorn desplegat.
- S'ha augmentat el `timeout` del client API per reduir errors durant cold starts.
- S'ha definit `netlify.toml` amb:
  - configuració de build (`base`, `command`, `publish`)
  - redirecció SPA (`/* -> /index.html`)

### 2) Preparació del backend per Render
- S'ha afegit suport de configuració via variables d'entorn per a la connexió de base de dades.
- S'ha dockeritzat el backend amb `Dockerfile`.
- S'ha afegit `.dockerignore`.
- S'ha ajustat CORS perquè permeti domini de producció i previews de Netlify.

### 3) Seguretat i higiene del repo
- S'ha actualitzat `.gitignore` del backend per evitar pujar `.env` accidentalment.

### 4) Desplegament real
- S'ha creat i configurat PostgreSQL a Render.
- S'ha desplegat el backend a Render.
- S'ha desplegat el frontend a Netlify.
- S'han corregit problemes de connexió entre front i back (CORS/proxy/URL base).

### 5) Dades de prova
- S'ha executat càrrega de dades de seed contra el backend desplegat.
- S'ha validat que els endpoints públics retornen dades i que el dashboard del frontend les mostra.

## Problemes trobats i resolució

### Problema 1: `502` i inestabilitat inicial de backend
- **Causa:** configuració i arrencada inicial amb connexió DB no estable.
- **Solució:** revisar variables d'entorn, URL JDBC correcta i redeploy.

### Problema 2: frontend sense dades tot i backend viu
- **Causa:** errors de proxy/CORS i diferències entre URL de producció i preview.
- **Solució:** ajustar CORS al backend i revisar la URL correcta de Netlify en producció.

### Problema 3: errors intermitents en scripts de seed
- **Causa:** connexions tallades puntualment (entorn free/cold start).
- **Solució:** afegir reintents i timeout més alt als scripts de seed.

## Com reproduir el desplegament (resum)

1. Backend:
   - configurar variables d'entorn a Render (`SPRING_DATASOURCE_URL`, CORS)
   - desplegar servei Docker
2. Frontend:
   - configurar build a Netlify
   - publicar deploy de producció
3. Dades:
   - executar script de seed contra `https://<backend>/api`
4. Validació:
   - comprovar endpoints API
   - comprovar dashboard amb dades visibles

## Estat final
- Backend públic operatiu a Render.
- Frontend públic operatiu a Netlify.
- Dashboard carregant mètriques i nivells de logs amb dades.

## Nota final
Abans d'entorn productiu real, es recomana:

1. Rotar credencials de BD si han quedat exposades durant proves.
2. Definir entorns separats (`dev`, `staging`, `prod`).
3. Afegir monitoratge i alertes bàsiques.
