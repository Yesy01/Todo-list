# Todo List (Projects + Todos) 

A lightweight Todo app built as part of **The Odin Project** curriculum.

It supports **multiple projects**, full **CRUD** on todos, **due date + optional due time**, **priority styling**, **due indicators** (due soon / due today / overdue), **localStorage persistence**, and a **palette-based light/dark theme** using **Sora + IBM Plex Mono**.

---

## Live Demo
- GitHub Pages: *(add your link after deployment)*

---

## Features

### Projects
- Default project (**Inbox**) on first load
- Create/select projects
- Rename projects
- Delete projects (cannot delete the last project)

### Todos
- Create todo with:
  - `title` (required)
  - `description`
  - `dueDate` (`YYYY-MM-DD`)
  - `dueTime` (optional `HH:mm`)
  - `priority` (low / medium / high)
  - `notes`
  - `completed` (checkbox)
- View todos per project
- Edit todo in a modal (expand to full details)
- Delete todos
- Move todo between projects (from edit modal)

### Due Status Indicators
Todos get a badge + styling based on due state:
- **OVERDUE** (past due)
- **DUE SOON** (within 60 minutes OR within next 3 days)
- **DUE TODAY** (later today)
- Auto refresh every minute (if enabled)

### Persistence
- All projects/todos are saved to **localStorage**
- App safely loads state on startup (won’t crash if storage is empty/corrupt)

### Theme
- Light/Dark mode toggle
- Dark mode uses the same palette, but with stronger surface/text contrast

---

## Tech Stack
- Vanilla JavaScript (ES Modules)
- Webpack (dev server + build)
- **date-fns** (date parsing/formatting and due logic)
- localStorage (Web Storage API)
- CSS (brand palette + typography)

---

## Brand System
### Typography
- **Sora**: body + headings (main UI)
- **IBM Plex Mono**: labels, buttons, metadata, and UI accents

### Palette
- `#F4DDCD`  `#BDAB75`  `#9B7653`  `#80461B`
- `#59250B`  `#32241E`  `#2B1F1A`

---

## Getting Started

###  Clone, Install nd run
```bash
git clone https://github.com/Yesy01/Todo-list.git
cd Todo-list

npm install

npm run start

npm run build
```
## How Persistence Works

- State is saved as JSON to localStorage on every state change.

- On load, the app:

- pulls JSON from localStorage (if present)

- parses it safely

- rehydrates into todo/project objects via factories (since JSON can’t store methods)

## Acknowledgements

The Odin Project (Todo List assignment)

date-fns contributors

## License

MIT