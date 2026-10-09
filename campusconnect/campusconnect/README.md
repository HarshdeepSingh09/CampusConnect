# CampusConnect

A simple web app where students report and track common issues around their college campus.
Built for **Code2Chill Weekly Project 01**.

## Project idea

Students register, log in and post campus issues such as a broken fan, Wi-Fi problems or a lost ID card.
Everyone can see the issues, open one to read the details, and move its status from
**Open** to **In Progress** to **Resolved**.

## Features

- Register and log in
- Report an issue with a category, title and description
- Dashboard listing all issues, with status counts, category filter, search and "only my issues"
- Issue details page (title, description, category, reporter, submitted and last-updated time)
- Update status: Open, In Progress, Resolved
- Simple profile page

## Technologies used

| Part | Tools |
|------|-------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Database | SQLite |
| Version control | Git, GitHub |

## Project structure

```
campusconnect/
├── backend/
│   ├── main.py        # creates the app, serves the frontend
│   ├── database.py    # SQLite connection and tables
│   ├── auth.py        # register, login, logout, profile
│   └── issues.py      # create, list, view, update issues
├── frontend/
│   ├── index.html         # login / register
│   ├── dashboard.html
│   ├── create-issue.html
│   ├── issue.html
│   ├── profile.html
│   ├── css/style.css
│   └── js/                # common.js, auth.js, dashboard.js, create-issue.js, issue.js, profile.js
├── requirements.txt
└── README.md
```

## How to run the project

You need Python 3.9 or newer.

```bash
git clone <your-repo-url>
cd campusconnect

python -m venv venv
# Windows:  venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

cd backend
uvicorn main:app --reload
```

Open http://127.0.0.1:8000 in your browser. The database file (`campusconnect.db`) is created automatically
on first run. API docs are at http://127.0.0.1:8000/docs.

## Team members

| Name | Contribution |
|------|--------------|
| _Name 1_ | _e.g. database + auth_ |
| _Name 2_ | _e.g. issues API_ |
| _Name 3_ | _e.g. dashboard page_ |
| _Name 4_ | _e.g. issue pages + profile_ |

## Team workflow

`Branch → Commit → Push → Pull Request → Merge`

```bash
git checkout -b feature/dashboard-page
git add .
git commit -m "Add dashboard filters"
git push origin feature/dashboard-page
# then open a Pull Request on GitHub
```
