# Selezioni Online

Public web frontend for the online public-competition (*selezioni*) platform of CNR – Consiglio Nazionale delle Ricerche. It lets candidates browse open calls, sign in, submit and manage applications, and lets administrators and call managers configure and handle calls, applications, communications and exports.

The application is a single-page app that talks to the [cool-jconon](https://github.com/consiglionazionaledellericerche/cool-jconon) backend through its REST/OpenAPI endpoints and authenticates through OpenID Connect (Keycloak SSO).

## Tech stack

- Angular 21 (standalone components, `inject()`, built-in control flow), TypeScript 5.9
- Angular application builder (`@angular/build:application`)
- [Bootstrap Italia](https://italia.github.io/bootstrap-italia/) and `design-angular-kit` for the UI
- `angular-auth-oidc-client` for OpenID Connect authentication
- `@ngx-translate` for i18n (Italian and English)
- `ngx-quill` for rich-text editing
- Docker / docker-compose for deployment

## Requirements

- Node.js 20.19+ or 22.12+ (required by Angular 21) and npm
- A running cool-jconon backend (default: `http://localhost:8080`, or `http://localhost:5555` through the dev proxy)
- An OpenID Connect provider (Keycloak) reachable by the browser

## Getting started

```bash
git clone git@github.com:consiglionazionaledellericerche/selezioni-online.git
cd selezioni-online
npm install
npm start
```

`npm start` runs `ng serve` on `http://localhost:4200` with live reload.

### Backend proxy

`proxy.conf.js` forwards `/openapi`, `/rest`, `/security` and `/sso` to `http://localhost:5555` (it is already set as `proxyConfig` of `ng serve`).
The account activation link of the registration email (`/rest/security/confirm-account`) is served by Angular instead,
which confirms the account through `/openapi/v1/user/confirm-account`.

```bash
npx ng serve --proxy-config proxy.conf.js
```

Adjust the `target` values to point to your backend.

## Configuration

Runtime settings are read from `window["env"]`, defined in [`src/assets/env.js`](src/assets/env.js), so they can be changed without rebuilding:

| Key | Description | Default (development) |
|-----|-------------|-----------------------|
| `apiUrl` | Base URL of the cool-jconon backend | `http://localhost:8080` |
| `production` | Production mode flag | `false` |
| `oidc.enable` | Enable OpenID Connect login (`"true"`/`"false"`) | `"true"` |
| `oidc.authority` | OIDC issuer / realm URL | `https://sso.test.si.cnr.it/auth/realms/cnr` |
| `oidc.redirectUrl` | Redirect URI after login | `http://localhost:4200/auth/signin` |
| `oidc.clientId` | OIDC client id | `angular-public` |

When running in Docker, `API_URL` and `OIDC_ENABLE` are provided as environment variables (see `docker-compose.yml.tpl`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server on port 4200 |
| `npm run build` | Production build into `dist/` |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run e2e` | End-to-end tests |

## Deployment

`docker-compose.yml.tpl` is the deployment template used by the CI/CD pipeline: it injects the image name and service metadata, and sets `API_URL` and `OIDC_ENABLE` for the target environment.

## Project structure

```
src/app/
├── +admin/           Administration (users, groups, RBAC, cache, views, JS console)
├── +configurazione/  Configuration area (FAQ, helpdesk, contacts)
├── auth/             Sign-in, user profile and guards
├── common/           Shared controllers, services, helpers
├── core/             Calls, applications, documents, home, search
├── dynamic/          Dynamic form components
├── layout/           Header, footer, notifications
└── shared/           Reusable UI components and pipes
```

## Contributing

Issues and pull requests are welcome. Please open an issue to discuss significant changes first.

## License

Released under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## Installazioni che estendono selezioni-online

Altre installazioni (es. [selezioni-lincei](https://github.com/consiglionazionaledellericerche/selezioni-lincei))
riusano questo progetto sostituendo pochi file, senza fork. I punti di estensione sono in `src/brand/`:

- `brand.ts` – configurazione (`Brand`, definita in `brand.model.ts`): recapiti della pagina Contatti e form del
  bulkinfo del tipo di bando i cui campi in più vanno resi nella gestione del bando (`callExtraForms`);
- `_brand.scss` – variabili Sass di Bootstrap Italia (es. `$primary-h`, `$primary-s`, `$primary-b`), importate prima
  della libreria;
- `_brand-overrides.scss` – regole CSS aggiuntive, importate dopo gli stili comuni.

Logo, favicon e icone si sostituiscono con file degli stessi nomi; testi e manifest si integrano unendo le chiavi
JSON. Nell'installazione CNR questi file non attivano nulla.

