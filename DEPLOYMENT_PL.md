# 🚀 Przewodnik Wdrożenia - Viral Content Hunter

## ✅ Status: GOTOWE DO DEPLOY

Projekt jest w pełni skonfigurowany i gotowy do wdrożenia na Heroku + Vercel.

---

## 📋 Wymagania Przed Startem

### 1. Zdobądź Klucze API (Darmowe!)

#### Google AI API Key
1. Wejdź na: https://makersuite.google.com/app/apikey
2. Zaloguj się kontem Google
3. Kliknij "Create API Key"
4. Skopiuj klucz (będzie potrzebny później)

#### Supabase Credentials
1. Wejdź na: https://supabase.com
2. Zaloguj się / Załóż konto (darmowe)
3. Kliknij "New Project"
4. Nazwij projekt (np. "viral-content-hunter")
5. Wybierz region (Europe West dla Polski)
6. Zapisz hasło do bazy (będzie potrzebne)
7. Po utworzeniu projektu, idź do Settings → API
8. Skopiuj:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_KEY)

### 2. Zainstaluj Narzędzia

#### Heroku CLI
```powershell
# Pobierz i zainstaluj z:
# https://devcenter.heroku.com/articles/heroku-cli

# Sprawdź instalację:
heroku --version
```

#### Vercel CLI
```powershell
npm install -g vercel

# Sprawdź instalację:
vercel --version
```

#### Git
```powershell
# Sprawdź czy masz Gita:
git --version

# Jeśli nie, pobierz z: https://git-scm.com/download/win
```

---

## 🗄️ Krok 1: Przygotuj Bazę Danych

### Uruchom Schema SQL w Supabase

1. Otwórz Supabase Dashboard: https://supabase.com/dashboard
2. Wybierz swój projekt
3. Idź do **SQL Editor** (w lewym menu)
4. Kliknij **"+ New query"**
5. Skopiuj całą zawartość pliku `supabase-schema.sql` z projektu
6. Wklej do edytora SQL
7. Kliknij **"Run"** (lub Ctrl+Enter)
8. Sprawdź czy wszystko OK (powinno być "Success. No rows returned")

### Sprawdź Utworzone Tabele

1. Idź do **Table Editor** w Supabase
2. Powinieneś zobaczyć tabelę: `post_metrics`
3. Sprawdź strukturę - kolumny: id, post_id, likes, retweets, replies, recorded_at, engagement_rate

---

## 🔧 Krok 2: Wdróż Backend na Heroku

### 2.1 Zaloguj się do Heroku

```powershell
# W terminalu (PowerShell):
heroku login

# Otworzy się przeglądarka - zaloguj się do Heroku
```

### 2.2 Utwórz Aplikację Heroku

```powershell
cd c:\Users\jakub\Downloads\Xly\backend

# Utwórz aplikację (wybierz unikalną nazwę):
heroku create viral-content-hunter-api --region eu

# Jeśli nazwa zajęta, spróbuj:
# heroku create viral-content-hunter-api-2024 --region eu
```

**ZAPISZ** URL aplikacji! Będzie wyglądać jak:
```
https://viral-content-hunter-api.herokuapp.com
```

### 2.3 Skonfiguruj Zmienne Środowiskowe

```powershell
# Ustaw NODE_ENV:
heroku config:set NODE_ENV=production

# Ustaw Google AI Key (wklej swój klucz):
heroku config:set GOOGLE_AI_KEY=twoj_google_ai_key_tutaj

# Ustaw Supabase URL (wklej swój URL):
heroku config:set SUPABASE_URL=https://twoj-projekt.supabase.co

# Ustaw Supabase Key (wklej swój klucz anon public):
heroku config:set SUPABASE_KEY=twoj_supabase_anon_key_tutaj

# Sprawdź czy wszystko OK:
heroku config
```

### 2.4 Zainicjuj Git i Deploy

```powershell
# Inicjalizuj git (jeśli jeszcze nie zrobione):
git init

# Dodaj wszystkie pliki:
git add .

# Commit:
git commit -m "Initial deploy to Heroku"

# Dodaj Heroku remote (zamień URL na swój):
heroku git:remote -a viral-content-hunter-api

# DEPLOY!
git push heroku main
```

### 2.5 Sprawdź Status

```powershell
# Zobacz logi:
heroku logs --tail

# Sprawdź czy działa:
heroku open

# Lub otwórz w przeglądarce:
# https://viral-content-hunter-api.herokuapp.com/health
```

### 2.6 Testuj API

```powershell
# Test health endpoint:
curl https://viral-content-hunter-api.herokuapp.com/health

# Powinno zwrócić:
# {"status":"ok","timestamp":"..."}

# Test search endpoint:
curl "https://viral-content-hunter-api.herokuapp.com/api/search?query=AI&count=5"
```

---

## 🎨 Krok 3: Wdróż Frontend na Vercel

### 3.1 Skonfiguruj .env.production

```powershell
cd c:\Users\jakub\Downloads\Xly\frontend

# Edytuj .env.production i wpisz URL swojego backendu:
```

W pliku `.env.production` powinno być:
```
VITE_API_URL=https://viral-content-hunter-api.herokuapp.com
```

### 3.2 Deploy na Vercel

```powershell
# Zaloguj się do Vercel:
vercel login

# Wybierz metodę logowania (GitHub / Email)

# Deploy w trybie produkcyjnym:
vercel --prod

# Odpowiedz na pytania:
# ? Set up and deploy "frontend"? [Y/n] y
# ? Which scope do you want to deploy to? <Twoja organizacja>
# ? Link to existing project? [y/N] n
# ? What's your project's name? viral-content-hunter
# ? In which directory is your code located? ./
```

Vercel automatycznie:
- Wykryje Vite
- Zbuduje projekt
- Wdroży na CDN
- Zwróci URL (np. `https://viral-content-hunter.vercel.app`)

### 3.3 Sprawdź Deployment

```powershell
# Otwórz w przeglądarce:
vercel open

# Lub ręcznie wejdź na URL z outputu
```

---

## 🤖 Krok 4: Skonfiguruj Automatyzację (GitHub Actions)

### 4.1 Utwórz Repository na GitHub

1. Wejdź na: https://github.com/new
2. Nazwij repo: `viral-content-hunter`
3. Ustaw jako Private (lub Public)
4. **NIE** zaznaczaj "Initialize with README"
5. Kliknij "Create repository"

### 4.2 Push Projektu do GitHub

```powershell
cd c:\Users\jakub\Downloads\Xly

# Dodaj remote (zamień na swój URL):
git remote add origin https://github.com/twoj-username/viral-content-hunter.git

# Push:
git branch -M main
git push -u origin main
```

### 4.3 Dodaj Secrets do GitHub

1. Idź do repo na GitHub
2. Kliknij **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **"New repository secret"**
4. Dodaj następujące secrety:

| Nazwa Secretu | Wartość |
|---------------|---------|
| `HEROKU_API_KEY` | Znajdź w: https://dashboard.heroku.com/account → API Key |
| `HEROKU_APP_NAME` | `viral-content-hunter-api` (lub twoja nazwa) |
| `GOOGLE_AI_KEY` | Twój Google AI API key |
| `SUPABASE_URL` | Twój Supabase Project URL |
| `SUPABASE_KEY` | Twój Supabase anon public key |

### 4.4 Sprawdź Workflows

Po push-u, GitHub Actions automatycznie:
- **Deploy Workflow**: Każdy push na `main` → auto-deploy na Heroku
- **Scheduled Scraper**: Co 6 godzin → scrapuje nowe posty

Zobacz status w: **Actions** tab na GitHub

---

## 📊 Krok 5: Monitorowanie

### Logi Heroku

```powershell
# Real-time logi:
heroku logs --tail

# Ostatnie 100 linii:
heroku logs -n 100

# Tylko błędy:
heroku logs --source app --dyno web
```

### Metryki Heroku

```powershell
# Wykorzystanie zasobów:
heroku ps

# Restart aplikacji (jeśli potrzeba):
heroku restart

# Zobacz dyno usage (dla planu Eco):
heroku ps:type
```

### Sprawdź Supabase Metrics

1. Supabase Dashboard → Database → Tables
2. Wybierz `post_metrics`
3. Zobacz zebrane dane
4. Użyj SQL Editor do zapytań:

```sql
-- Najpopularniejsze posty:
SELECT * FROM post_metrics 
ORDER BY engagement_rate DESC 
LIMIT 10;

-- Statystyki dzisiejsze:
SELECT COUNT(*), AVG(engagement_rate) 
FROM post_metrics 
WHERE recorded_at > NOW() - INTERVAL '24 hours';
```

---

## 🐛 Troubleshooting

### Problem: "Application error" na Heroku

```powershell
# Sprawdź logi:
heroku logs --tail

# Sprawdź czy build się powiódł:
heroku releases

# Jeśli ostatni release failed, rollback:
heroku releases:rollback

# Sprawdź config vars:
heroku config

# Zrestartuj:
heroku restart
```

### Problem: API nie odpowiada

```powershell
# Sprawdź czy dyno działa:
heroku ps

# Jeśli crashed, zobacz logi:
heroku logs -n 500

# Sprawdź health endpoint:
curl https://twoja-aplikacja.herokuapp.com/health

# Restart:
heroku restart
```

### Problem: Frontend nie łączy się z Backend

1. Sprawdź `.env.production` - czy URL backendu jest poprawny?
2. Sprawdź CORS w `backend/src/server.ts` - czy dozwolony jest origin Vercel?
3. Rebuild frontend:
   ```powershell
   cd frontend
   npm run build
   vercel --prod
   ```

### Problem: GitHub Actions nie działa

1. Sprawdź czy wszystkie Secrets są ustawione
2. Zobacz logi w Actions tab
3. Upewnij się że HEROKU_API_KEY jest aktualny
4. Sprawdź workflow file w `.github/workflows/`

### Problem: Rate Limiting Google AI

```
Error: 429 Too Many Requests
```

**Rozwiązanie**: Bezpłatny plan Google AI to 60 req/min. Poczekaj 1 minutę lub:
1. Dodaj retry logic (już jest w `aiService.ts`)
2. Ogranicz liczbę captionów (zmniejsz z 4 do 2)

### Problem: Nitter nie działa

```
Error: Failed to fetch from Nitter
```

**Rozwiązanie**: Instancje Nitter mogą być niedostępne. Sprawdź:
1. https://status.d420.de/ - lista działających instancji
2. Zaktualizuj `NITTER_INSTANCES` w `scraperService.ts`
3. Dodaj więcej instancji do listy

---

## 📈 Optymalizacja i Skalowanie

### Upgrade Heroku Dyno (opcjonalnie)

```powershell
# Jeśli potrzebujesz więcej mocy:
heroku ps:type professional-1x

# Lub hobby (7$/miesiąc):
heroku ps:type hobby
```

### Dodaj Redis dla Cache (opcjonalnie)

```powershell
heroku addons:create heroku-redis:mini

# Zaktualizuj kod aby używał Redis
```

### Monitoring z Heroku Metrics

```powershell
# Zainstaluj Heroku Metrics dashboard:
heroku addons:create librato:development
```

---

## 🎯 Następne Kroki

### Ulepsz scraping:
- [ ] Dodaj więcej źródeł (Instagram, TikTok)
- [ ] Implementuj proxy rotation
- [ ] Dodaj zaawansowane filtry

### Rozbuduj AI:
- [ ] Dodaj analiza trendów
- [ ] Optymalizuj prompty
- [ ] Dodaj więcej modeli AI

### Analytics:
- [ ] Integracja z Google Analytics
- [ ] Custom dashboardy w Supabase
- [ ] Email notifications dla top postów

### Automatyzacja:
- [ ] Auto-posting do social media
- [ ] Scheduling calendar
- [ ] A/B testing captionów

---

## 📞 Wsparcie

- **Heroku Docs**: https://devcenter.heroku.com/
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Google AI Docs**: https://ai.google.dev/docs

---

## ✅ Checklist Deploy

- [ ] Zdobyto Google AI API key
- [ ] Zdobyto Supabase credentials
- [ ] Uruchomiono schema SQL w Supabase
- [ ] Zalogowano się do Heroku CLI
- [ ] Utworzono Heroku app
- [ ] Ustawiono config vars na Heroku
- [ ] Push backend na Heroku
- [ ] Sprawdzono health endpoint
- [ ] Skonfigurowano .env.production frontendu
- [ ] Deploy frontend na Vercel
- [ ] Utworzono GitHub repository
- [ ] Push projektu na GitHub
- [ ] Dodano GitHub Secrets
- [ ] Sprawdzono GitHub Actions workflows
- [ ] Przetestowano całą aplikację end-to-end

---

## 🎉 GOTOWE!

Twoja aplikacja Viral Content Hunter jest teraz live!

- **Backend**: https://twoja-aplikacja.herokuapp.com
- **Frontend**: https://twoja-aplikacja.vercel.app
- **Database**: Supabase Dashboard
- **Automation**: GitHub Actions (co 6h)

Ciesz się znajdowaniem viralowego contentu! 🚀
