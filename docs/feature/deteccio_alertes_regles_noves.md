# Documentacio (catala): substitucio de deteccio d'alertes per motor de regles

## Que s'ha fet
- S'ha eliminat la logica antiga que generava alerta simplement quan el log era `CRITICAL`.
- S'ha implementat un motor nou de deteccio a backend basat en regles reals, amb deduplicacio i finestra temporal.
- S'han afegit metadades a `Alert` per traçabilitat:
  - `ruleKey`
  - `fingerprint`
  - `correlationKey`
- S'han ampliat repositoris per poder consultar logs recents per IP i per finestra temporal global.
- S'ha actualitzat el DTO de resposta d'alerta per retornar la informacio de regla/correlacio.

## Per que s'ha fet
- El model anterior era massa simple i generava alertes poc útils per SOC.
- Es necessitava passar d'un criteri "nivell = CRITICAL" a deteccio per comportament.
- També calia reduir soroll amb deduplicacio per no saturar l'analista.
- Amb `ruleKey/fingerprint/correlationKey` ara es pot entendre millor l'origen de cada alerta.

## Com s'ha fet (resum tecnic)
1. **Integracio de deteccio al flux d'ingesta**
   - A `LogService.createLog(...)`, despres de guardar log, es crida `alertService.evaluateDetectionRules(savedLog)`.

2. **Motor de regles nou a `AlertService`**
   - Regles implementades:
     - `BRUTE_FORCE_LOGIN`
     - `PASSWORD_SPRAYING`
     - `CRITICAL_BURST_IP`
     - `PHISHING_MAIL_CAMPAIGN`
     - `RANSOMWARE_PATTERN_EDR`
     - `LATERAL_MOVEMENT_PATTERN`
     - `SEVERITY_ESCALATION_IP`
     - `CROSS_COMPANY_SHARED_INDICATOR`
   - Cada regla decideix:
     - severitat de l'alerta
     - missatge
     - fingerprint i clau de correlacio
     - cooldown per deduplicar

3. **Deduplicacio**
   - Abans de crear una alerta es comprova:
     - mateixa empresa
     - mateixa regla
     - mateix fingerprint
     - creada dins una finestra recent (cooldown)
   - Si ja existeix, no es duplica.

4. **Canvis de model i repositori**
   - `Alert` ara guarda clau de regla, fingerprint i correlacio.
   - `AlertRepository` incorpora consulta per deduplicacio temporal.
   - `LogRepository` incorpora consultes per IP+finestra i finestra global.

## Resultat
- La deteccio d'alertes ara es basa en context i patrons, no en una sola condicio.
- El sistema es mes proper a un SIEM operatiu real i amb menys soroll.
