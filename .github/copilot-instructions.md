# Copilot instructions for KDU Medical Inspection Unit

- Primary purpose: full-stack medical management app with a React frontend (`my-app1/`) and an Express/Mongo backend (`backend/`). Aim to make edits that preserve the separation: UI code in `my-app1/src`, API logic in `backend/controllers`, and schema in `backend/models`.

- Start / dev commands
  - Frontend: `cd my-app1` then `npm install` then `npm start` (runs on :3000 via CRA).
  - Backend: `cd backend` then `npm install` then `npm run dev` (nodemon server.js, default port 8000). Backend reads env from `backend/.env` (MONGO_URI, PORT, JWT_SECRET).

- Architecture summary (quick)
  - Frontend: Create React App, React 19, SCSS with CSS modules. Components are organized under `src/components/{auth,common,modals,sections}`. State/side-effect context providers live in `src/contexts` (e.g., `NotificationContext.js`, `SettingsContext.js`). Data persistence in frontend README asserts localStorage usage — however the repository also contains a backend API; when integrating, frontend uses `axios` to call `http://localhost:8000/api/...`.
  - Backend: Express server in `backend/server.js` wires route modules (`routes/*.js`) under `/api/*`. Models use Mongoose schemas in `backend/models/*.js`. Controllers live in `backend/controllers/*Controller.js` and perform CRUD using Mongoose.

- Conventions & examples to follow
  - Route → Controller → Model pattern: e.g. `backend/routes/patientRoutes.js` -> `backend/controllers/patientController.js` -> `backend/models/patient.js`.
  - JSON APIs: controllers respond with `res.json(...)` and error handlers use `res.status(code).json({message: ...})`.
  - Frontend components use CSS modules: import styles from `*.module.scss` and apply `className={styles.someClass}`.
  - Contexts: use `createContext` + custom hooks (see `NotificationContext.js`) and prefer provider composition in `src/index.js` / `App.js`.
  - Modals: self-contained components under `src/components/modals`, receive `isOpen`, `onClose`, and domain props (example: `ReportModal.js` accepts `medicines`, `patients`, `medicalRecords`). Keep UI logic in components and push server calls to dedicated services if added.

- Data and shapes (examples)
  - Patient model: fields { NIC, patientName, patientID, gender, Age, Inatake, contactNumber } (see `backend/models/patient.js`).
  - Report data in UI: object with { title, type, data[], filters, generatedAt } (see `ReportModal/ReportModal.js`). Use these keys when generating or persisting reports.

- Integration points
  - Typical API base: `http://localhost:8000/api/` with subroutes `/patient`, `/medicines`, `/report`, `/user`, etc. (see `server.js`).
  - Auth: `backend/controllers/authController.js` and `backend/models/userModel.js` use JWT; ensure `JWT_SECRET` is set when running backend.
  - File uploads: backend uses `multer` (dependency present) — check `medicineController.js` or other controllers before changing upload behavior.

- Developer workflows
  - Full-stack dev: Start backend (`npm run dev` in `backend`) then frontend (`npm start` in `my-app1`). Frontend expects API at port 8000; if different, update axios base URLs.
  - Tests: Frontend tests use CRA test tooling. Backend has no tests in repo.
  - Debugging: backend logs to console; frontend uses React devtools. For MongoDB, default URI is `mongodb://localhost:27017/kdu-medical-unit` if `.env` missing.

- What to avoid / common pitfalls
  - Don’t change global CSS; prefer CSS modules. Keep SCSS variables in `src/styles/_variables.scss`.
  - When editing models, update controllers and any frontend code that depends on field names (many components access fields by index/heuristics — e.g., `ReportModal` maps columns to object keys heuristically).
  - The frontend report exporter relies on common key names (id/_id, name, expiryDate). Keep those or update exporter logic.

- Where to look for more details (key files)
  - Backend entry: `backend/server.js`
  - Backend routes: `backend/routes/*.js`
  - Controllers: `backend/controllers/*Controller.js` (look at `patientController.js` for a canonical example)
  - Models: `backend/models/*.js` (e.g., `patient.js`)
  - Frontend entry: `my-app1/src/index.js`, `my-app1/src/App.js`
  - Contexts: `my-app1/src/contexts/*`
  - Example UI modal: `my-app1/src/components/modals/ReportModal/ReportModal.js`

- Editing guidance for AI agents
  - Prefer small, focused changes; add unit tests for new backend logic when possible.
  - When adding or renaming API fields, update both backend models/controllers and any frontend consumers (search the repo for field name occurrences).
  - For UI changes, follow existing component patterns: functional components, hooks, CSS modules, and localized state.

Please review this draft and tell me any missing details you want included (build envs, CI, or special branches).