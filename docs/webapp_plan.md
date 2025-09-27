# Web Application Development Plan

This document outlines the detailed plan for developing the web application,
building upon the established database schema, API, and testing setup.

## 1. Development Workflow

* **Component-Driven Development:** UI components will be built in isolation
to promote reusability and maintainability.
* **API-First Approach:** API routes will be developed and tested before
integrating them with the frontend UI.
* **Iterative Development:** Development will proceed in iterations, starting
with core functionalities and progressively adding more features.

## 2. Detailed Steps

### Step 1: Setup API Routes

* **Objective:** Create robust API endpoints for all core data models.
* **Tasks:**
  * Implement API routes for basic CRUD operations on `Entry`, `Impact`,
`Relation`, and `NRSContext` using the functions from `src/lib/db_api.ts`.
  * Integrate input validation for all incoming API requests
(e.g., using [Zod](https://zod.dev/)).
  * Implement comprehensive error handling for all API routes.
  * Define clear request and response schemas for each endpoint.

### Step 2: Frontend - Entry List Page

* **Objective:** Display a paginated list of all entries.
* **Tasks:**
  * Create a new Next.js page at `src/app/entries/page.tsx`.
  * Utilize a data fetching library (e.g., React Query) to fetch a paginated
list of entries from the `/api/entries` endpoint.
  * Design and implement a basic UI to display key entry details
(e.g., title, `bestGirl`, current `EntryProgress` status).
  * Add pagination controls to navigate through the list of entries.

### Step 3: Frontend - Entry Detail Page

* **Objective:** Display comprehensive details for a single entry.
* **Tasks:**
  * Create a dynamic Next.js page at `src/app/entries/[id]/page.tsx`.
  * Fetch detailed entry information, including all associated impacts and
relations, from the `/api/entries/[id]` endpoint.
  * Display all relevant data, including `additionalSources` and `dah_meta`
(consider using a collapsible JSON viewer component for these fields).
  * Implement UI to show associated `Impacts` and `Relations` in a structured
manner.

### Step 4: Frontend - Create/Edit Entry

* **Objective:** Provide forms for creating new entries and modifying existing ones.
* **Tasks:**
  * Develop a reusable form component for `Entry` creation and editing.
  * Integrate this component with the `/api/entries` (POST for creation) and
`/api/entries/[id]` (PUT for updates) API routes.
  * Implement client-side form validation to provide immediate feedback to
the user.

### Step 5: Frontend - Impact/Relation Management

* **Objective:** Allow users to manage impacts and relations associated with an entry.
* **Tasks:**
  * Add UI elements (e.g., buttons, forms) to the Entry Detail Page to create,
edit, and delete `Impacts` and `Relations`.
  * Integrate these UI elements with the respective `/api/impacts` and
`/api/relations` API routes.

### Step 6: Frontend - NRS Context Configuration

* **Objective:** Enable viewing and modification of the global NRS context.
* **Tasks:**
  * Create a dedicated Next.js page at `src/app/nrs-config/page.tsx`.
  * Implement UI to display and allow editing of the `factorScoreWeights` from
the `NRSContext`.
  * Integrate with the `/api/nrs-context` API route for fetching and updating
the context.

### Step 7: Score Calculation Integration

* **Objective:** Provide a way to trigger and display score calculations.
* **Tasks:**
  * Add a button or other trigger mechanism on the Entry Detail Page to
initiate the score calculation for that specific entry.
  * Implement a new API route (e.g., `/api/calculate-score/[id]`) that will,
in the future, call the actual scoring algorithm (which is not yet implemented
but will be integrated here).
  * Display the results of the score calculation on the Entry Detail Page.

### Step 8: Styling and Responsiveness

* **Objective:** Ensure a clean, modern, and responsive user interface.
* **Tasks:**
  * Apply Tailwind CSS classes consistently throughout the application for
styling.
  * Ensure all pages and components are responsive across various screen sizes.
