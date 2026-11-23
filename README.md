# Task Management Dashboard

A task board built with Angular 21 and PrimeNG. You can create, edit, delete, filter and search tasks, drag them between status columns, see live statistics and charts, and use the app in English or Arabic (right to left).

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture decisions](#architecture-decisions)
- [State management](#state-management)
- [API layer](#api-layer)
- [Forms](#forms)
- [Performance](#performance)
- [Accessibility and i18n](#accessibility-and-i18n)
- [Testing strategy](#testing-strategy)
- [Code quality](#code-quality)

## Features

**Dashboard**

- Four stat cards: total, completed, in progress and overdue tasks. Each card has a change line under it, such as "3 created this week" or "1 completed today".
- A board with To Do, In Progress and Done columns. In each column, overdue tasks come first, then tasks by priority, then by due date.
- Drag and drop between columns to change a task's status. The change shows right away and is rolled back if the server rejects it.
- A toolbar with status tabs, priority and assignee filters, and a search over titles and descriptions. The search waits 300 ms after you stop typing.
- Long titles, descriptions and assignee names are cut with an ellipsis and show in full in a tooltip.

**Tasks**

- Create and edit tasks in a dialog. Fields: title, description, status, priority, due date, assignee and tags.
- Each card has a "⋮" menu with Edit and Delete. Delete asks for confirmation first, and Cancel has the focus. The card shows a spinner until the server confirms.
- While saving, the submit button is disabled and shows a loader, and you can't submit twice.

**Analytics**

- Tasks by status (doughnut)
- Overdue vs on track (bars)
- Tasks by priority (horizontal bars)
- Overdue tasks per person, and each person's tasks by status (stacked bars). These scroll sideways when there are many people.

**Team**

- A card per team member with their avatar, name and email, and how many of their tasks are to do, in progress, done and overdue. The counts come from the live task list.

**Settings**

- Your name, saved in `localStorage`. The header avatar shows your initials.
- Language (English or Arabic), saved and restored when you come back.

**Throughout the app**

- A responsive layout. On small screens the sidebar becomes a drawer.
- Skeletons while loading, an error state with a Retry button, and empty states.
- Error toasts for failed requests, with a message for each kind of failure.

## Tech stack

| Area          | Choice                                                | Why                                                                                                      |
| ------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Framework     | Angular 21 (standalone, signals, zoneless)            | Required. Signals and `httpResource` cover the app's state without a store library.                      |
| UI library    | PrimeNG 21 (Aura preset)                              | Ready-made dialog, select, autocomplete, menu, toast, drawer and skeleton, themed with the Figma tokens. |
| Charts        | Chart.js through PrimeNG `p-chart`                    | Small, well known and already wrapped by PrimeNG. It's loaded only on the analytics page.                |
| Drag and drop | Angular CDK                                           | Accessible, works with RTL, and needs no extra dependency.                                               |
| i18n          | Transloco                                             | Switches language at runtime without a rebuild. Angular's built-in i18n needs one build per language.    |
| Mock API      | json-server                                           | A real REST API with a delay, so loading and error states behave as they would in production.            |
| Tests         | Vitest (Angular's default runner) with jsdom          | Fast, and runs through `ng test`.                                                                        |
| Code quality  | ESLint (angular-eslint), Prettier, Husky, lint-staged | Lint and format on commit, and run the tests on push.                                                    |

## Getting started

Requirements: Node.js 20.19 or newer, and npm.

```bash
git clone <repo-url>
cd task-management-dashboard
npm install
```

Run the mock API and the app in two terminals:

```bash
npm run mock:api   # http://localhost:3030
npm start          # http://localhost:4200
```

The data uses dates relative to today. To refresh the dates, run:

```bash
npm run mock:data
```

## Environment configuration

The API address is in [src/environments/environment.ts](src/environments/environment.ts):

```ts
export const environment = {
  apiUrl: 'http://localhost:3030',
};
```

Change `apiUrl` to point the app at another backend. json-server runs on port 3030 with a 1 second delay (see `mock:api` in `package.json`), so the loading states can be seen.

## Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm start`         | Runs the dev server on port 4200                        |
| `npm run build`     | Builds for production into `dist/`                      |
| `npm run watch`     | Rebuilds in development mode on every change            |
| `npm test`          | Runs the unit tests with Vitest                         |
| `npm run lint`      | Lints the TypeScript and the templates                  |
| `npm run mock:api`  | Starts json-server on port 3030 with `mock-api/db.json` |
| `npm run mock:data` | Regenerates the mock data with dates relative to today  |

Git hooks: `pre-commit` runs ESLint and Prettier on the staged files, and `pre-push` runs the tests.

## Project structure

```
src/app
├── core/                 # App-wide code with no UI
│   ├── config/           # App name and logo
│   ├── i18n/             # Transloco setup, language service (RTL, saved language)
│   ├── interceptors/     # Cache, error toast, retry
│   ├── models/           # All interfaces and types
│   ├── services/         # Shared services: tasks, users, filters, dialog, profile, request cache
│   ├── theme/            # PrimeNG preset mapped to the design tokens
│   └── utils/            # Pure functions: dates, task sorting/filtering, statistics
├── layout/               # Shell: header, sidebar, drawer, task dialog, toast
├── pages/                # One lazy-loaded folder per route
│   ├── dashboard/        # Stat cards, toolbar, board, columns, cards, task form
│   ├── analytics/        # Chart card, stacked bar card, legend
│   ├── settings/
│   ├── team/             # Member cards with task counts per person
│   └── coming-soon/      # Placeholder for routes that aren't built yet
└── shared/               # Reusable UI helpers: truncate directive, form validators
src/styles/               # Design tokens (colors, spacing, type) from Figma
public/i18n/              # en.json, ar.json
mock-api/                 # db.json and the data generator
```

Some rules the structure follows:

- Shared services are in `core/services`. A service used by only one page goes in that page's folder.
- All models stay in `core/models`, even when only one page uses them, so types are always in one place.
- Logic that doesn't need Angular (sorting, filtering, statistics, dates) is in plain functions in `core/utils`. These functions are easy to test and to reuse between the dashboard and analytics.

## Architecture decisions

**Standalone components and lazy routes.** There are no NgModules. Every page is loaded with `loadComponent`, so its code, and libraries like Chart.js, only download when you open it.

**Smart and presentational components.** A few components own data and actions, and the rest only take inputs and emit outputs:

- `DashboardComponent` reads the tasks and filters and derives the columns and stats.
- `TaskBoardComponent` saves moves and runs edit and delete, with the confirm dialog. It's the smart part of the board, so events don't have to pass up through several layers.
- `TaskDialogComponent` creates and saves tasks.
- Presentational: `TaskColumnComponent`, `TaskCardComponent`, `TaskFormComponent`, `StatCardComponent`, `TaskToolbarComponent`, and the chart cards.

**One dialog for the whole app.** The "New Task" button is in the sidebar and the edit action is on the cards, so the dialog lives in the layout. `TaskDialogService` holds whether it's open and which task it shows. The dialog is in an `@defer` block, so its code loads the first time it opens.

**Derived data instead of stored data.** The statistics in the mock API are fixed numbers, and the `isOverdue` field isn't reliable. So the stat cards, the overdue state and the charts are all calculated from the task list, and they stay correct after every create, move or delete.

**Dependency injection.** Services use `providedIn: 'root'` and are injected with `inject()`. Services needed by one component tree only, such as `ConfirmationService` on the board, are provided at that component.

## State management

There's no store library. Signals cover everything:

- **Server state.** `TaskService.tasks` and `UserService.users` are `httpResource`s. They give you `value()`, `isLoading()`, `error()` and `reload()`, and are updated locally after each change, so there's no extra request.
- **UI state shared across components.** `TaskFiltersService` (search, status, priority, assignee), `TaskDialogService` (open, task being edited) and `ProfileService` (name and initials) hold signals.
- **Derived state.** `computed()` builds the filtered tasks, the columns, the stats and the chart data. Grouping into columns is separate from the status tab, so switching tabs doesn't re-sort every column.
- **Search debounce.** The search signal goes through RxJS (`toObservable` → `debounce` → `toSignal`). Typing waits 300 ms; clearing the search applies at once.

Updates use two strategies:

- **Optimistic, for drag and drop.** The card moves at once and goes back if the request fails. Waiting for the server would make the card jump back for a second.
- **Wait for the server, for create, edit and delete.** These show a loader, and the list only changes when the server confirms. The new task needs the id from the server, and a failed save keeps the dialog open so you can try again.

## API layer

The mock backend is json-server, with `tasks` and `users` endpoints. Requests pass through three functional interceptors, in this order:

1. **Cache** ([cache-interceptor.ts](src/app/core/interceptors/cache-interceptor.ts)): repeated GETs are served from memory for 5 minutes. Any POST, PUT or DELETE clears the cache, so the next read is fresh.
2. **Error** ([error-interceptor.ts](src/app/core/interceptors/error-interceptor.ts)): shows a translated toast for each kind of failure (offline, 404, 5xx, and so on), then rethrows the error so the caller can stop a loader or roll back. A request can opt out with the `SILENT_ERRORS` context token.
3. **Retry** ([retry-interceptor.ts](src/app/core/interceptors/retry-interceptor.ts)): requests that opt in with `withRetry()` are retried twice, after 500 ms then 1 s, on network errors, 408, 429 and 5xx. POST is never retried, so a slow request can't create the same task twice.

Pages show a skeleton on the first load, and an error message with a Retry button if loading fails.

## Forms

The task form is a typed reactive form (`NonNullableFormBuilder`), and so is the settings form.

- **Custom validators** ([form.validators.ts](src/app/shared/validators/form.validators.ts)):
  - `requiredText` rejects text that is only spaces, which `Validators.required` lets through.
  - `maxItemLength` limits the length of each tag, not the number of tags.
- **Dynamic controls.** The same form creates and edits. It fills in from the task being edited and resets when the dialog opens again. Tags are a dynamic list, added with Enter or a comma.
- **Errors.** Each field shows its own message under it once it has been touched or the form has been submitted. Invalid inputs get `aria-invalid`.
- **Form state.** The submit button is disabled while saving and shows a loader, and the form ignores a second submit.

## Performance

- `ChangeDetectionStrategy.OnPush` on every component, with signals for all state.
- Every `@for` loop has a `track` expression (`task.id`, `column.status`, and so on).
- Lazy routes: each page, Chart.js included, is its own chunk.
- `@defer` for the task dialog and the mobile drawer. They load only when first opened.
- `httpResource`, the cache interceptor and local list updates avoid repeat requests.
- No manual subscriptions that outlive a component. HTTP observables complete after one response, and the search debounce uses `toSignal`, which unsubscribes with the service.

## Accessibility and i18n

- Semantic landmarks (`header`, `nav`, `main`) and headings in order. Each chart card has its own heading id.
- All controls work with the keyboard, and focus is visible. Drag and drop has a keyboard alternative: the Status field in the edit dialog.
- Each chart has an `aria-label` with its numbers in text, and an HTML legend with counts, so the data doesn't depend on color.
- The confirm dialog focuses Cancel, so pressing Enter by accident doesn't delete.
- ESLint runs the angular-eslint template accessibility rules.
- **Arabic.** Choosing Arabic sets `dir="rtl"` and `lang` on `<html>`. The layout uses logical CSS properties, the charts flip their axes, and the drawer and toasts open from the other side.

## Testing strategy

Tests use Vitest through `ng test`, and sit next to the code as `*.spec.ts` files.

- **Pure functions** (`core/utils`) are tested directly with small task fixtures and a fixed "today", so the date logic is predictable.
- **Services** are tested with `provideHttpClientTesting` and `HttpTestingController`: the requests sent, the list updates, and the rollback when an optimistic update fails.
- **Interceptors** are tested with a real `HttpClient` and fake timers, for retry counts, delays and the methods that must not be retried.
- **Components** are tested through their DOM, the way a user sees them: what renders, what happens on click or submit, and what's emitted. Services are replaced with stubs where the test is about the component.
- Tests check behavior, not labels or static markup, so changing text or styles doesn't break them.
- Browser APIs that jsdom lacks are stubbed: `localStorage` with an in-memory version in [src/testing/memory-storage.ts](src/testing/memory-storage.ts), and the canvas context in the chart tests.

```bash
npm test
```

## Code quality

- ESLint with angular-eslint's recommended and template accessibility rules, plus typescript-eslint's recommended and stylistic rules.
- Prettier with a 100-character line width and single quotes.
- Husky with lint-staged: ESLint and Prettier run on the staged files before each commit, and the tests run before each push.
- Strict TypeScript, and no `any`.
- Conventional commit messages, with each commit covering one working step and its tests.
- JSDoc on the parts that aren't obvious: the interceptors, the optimistic update, the task sorting and statistics, the date helpers and the validators.
