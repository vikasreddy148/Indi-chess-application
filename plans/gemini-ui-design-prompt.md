# Gemini AI Prompt: IndiChess UI Design

Copy the prompt below and paste it into Gemini (or another AI) to get a cohesive UI design proposal for the IndiChess project.

---

## Prompt for Gemini

You are a senior UI/UX designer. Design a complete, modern UI system for **IndiChess**, an online chess web application. Use the following context.

### Project overview
- **Product name:** IndiChess  
- **What it is:** Web app for playing chess online (matchmaking, real-time games over WebSocket), with optional local two-player mode.  
- **Tech stack:** React 19, Vite, Tailwind CSS 4. No design system or component library is mandated; recommend one only if it clearly improves the design.  
- **Users:** Casual and regular players who want to sign up, find games, and play with minimal friction.

### Pages and features to design for

1. **Landing page (unauthenticated)**  
   - Hero with product name and short tagline.  
   - Tabs or toggle: **Login** vs **Register**.  
   - Login: username-or-email + password, submit, error message area.  
   - Register: username, email, password, optional country, submit, error message area.  
   - Optional: “Sign in with Google” (OAuth).  
   - When logged in: welcome message + primary CTA (e.g. “Play now”) and “Log out”.

2. **Home page (authenticated)**  
   - Header: app name, user info (username, rating), log out.  
   - **Play online** section:  
     - Game type dropdown (e.g. Rapid, Blitz, Classical).  
     - “Find match” primary button.  
     - When searching: “Finding opponent…” with cancel.  
   - **Profile** section: country, profile picture URL; expandable “Edit profile” with save/cancel.  
   - **Your games** list: last N games with game id, status (Ongoing / Finished / Draw etc.), “Live” badge for active games; each row clickable to open that game.  
   - Footer/secondary link: “Play locally (2 players)” for local game.

3. **Game page (live online match)**  
   - Chess board (8×8, orientation by player color).  
   - Board must show: piece positions, last move highlight, selected square, legal move indicators (dots or highlights).  
   - Sidebar or panel:  
     - Opponent info (name, rating).  
     - Game status (e.g. “Your turn” / “Opponent’s turn” / “Game over”).  
     - Optional: move list (san or uci).  
     - Actions: Resign, Offer draw.  
     - When draw is offered: Accept / Decline.  
   - Connection state: show connected / reconnecting / disconnected.  
   - Loading and error states (e.g. “Failed to load game”, “Connection lost”).

4. **Local game page**  
   - Same board and move-highlight behavior as online game.  
   - No opponent panel; simple “White’s turn” / “Black’s turn” and optional reset game.

### Design requirements

- **Visual style:**  
  - Choose a clear direction: e.g. dark, premium (deep blues/grays, gold or amber accents), or light and minimal.  
  - Ensure the chess board is readable: clear light/dark squares, good contrast for pieces and highlights.  
  - Define a small palette (primary, secondary, background, surface, text, borders, success/error/warning) and use it consistently.

- **Typography:**  
  - Pick a primary font for headings and UI (and optional secondary for body or numbers).  
  - Specify font sizes and weights for: page title, section titles, body, labels, buttons, small labels (e.g. “Live”, “Ongoing”).

- **Components and patterns:**  
  - Buttons: primary, secondary, danger (e.g. Resign), ghost/text.  
  - Form inputs: text, email, password, select; with label, placeholder, error state.  
  - Cards/panels for “Play online”, “Profile”, “Your games”, and game sidebar.  
  - List rows for match history and any lists.  
  - Badges/pills for “Live”, “Ongoing”, “Your turn”, etc.  
  - Loading: spinner or skeleton for “Finding opponent…” and “Loading game”.

- **Layout and responsiveness:**  
  - Desktop: content max-width, board and sidebar side-by-side on game page where it fits.  
  - Mobile: single column; board scales (e.g. max width with preserved aspect ratio); stacked forms and lists; touch-friendly tap targets.

- **Accessibility:**  
  - Sufficient color contrast (WCAG AA).  
  - Focus states for all interactive elements.  
  - Semantic structure (headings, landmarks) and clear button/link labels.

- **Deliverables to provide:**  
  1. **Design direction:** 2–3 sentences on overall vibe (e.g. “Dark, premium chess app with gold accents and clear hierarchy”).  
  2. **Color palette:** List of colors with names and hex (or Tailwind-style names) and where each is used.  
  3. **Typography:** Font names and size/weight for each level.  
  4. **Page wireframes or descriptions:** For Landing, Home, Game, and Local game: layout (header, main, sidebar if any), order of sections, and key components.  
  5. **Component specs:** For buttons, inputs, cards, list rows, and badges: appearance (colors, borders, radius, padding) and states (default, hover, focus, disabled, error).  
  6. **Chess board:** Square colors, piece contrast, highlight colors for last move / selected square / legal moves, and any optional board frame or shadow.  
  7. **Tailwind-oriented notes:** Where possible, suggest Tailwind classes (e.g. `bg-slate-900`, `text-amber-400`) so a React + Tailwind implementation can follow the design directly.

Do not write React code unless asked; focus on visual and interaction design, layout, and design tokens (colors, type, spacing) that a developer can implement in this stack.

---

## How to use this prompt

1. Copy everything under **“Prompt for Gemini”** (from “You are a senior UI/UX designer…” through “…implement in this stack.”).  
2. Paste into Gemini (or Claude, etc.).  
3. Use the model’s output as a design spec: apply the palette, typography, and component specs in your React + Tailwind code (e.g. in `global.css`, `tailwind.config.js`, and your page/component files).  
4. If you want actual React/Tailwind snippets for a specific page or component, ask a follow-up: e.g. “Generate the JSX and Tailwind classes for the Home page header and Play online section based on this design.”
