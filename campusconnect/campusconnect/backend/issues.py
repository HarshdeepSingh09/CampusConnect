from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from auth import get_current_user, now
from database import get_db

router = APIRouter(prefix="/api")

CATEGORIES = ["Classroom", "Campus", "Lost & Found", "General"]
STATUSES = ["Open", "In Progress", "Resolved"]

BASE_QUERY = "SELECT i.*, u.name AS reporter FROM issues i JOIN users u ON u.id = i.created_by"


class IssueIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10, max_length=1000)
    category: Literal["Classroom", "Campus", "Lost & Found", "General"]


class StatusIn(BaseModel):
    status: Literal["Open", "In Progress", "Resolved"]


def get_issue_or_404(db, issue_id):
    row = db.execute(BASE_QUERY + " WHERE i.id = ?", (issue_id,)).fetchone()
    if not row:
        raise HTTPException(404, "This issue does not exist.")
    return dict(row)


@router.get("/categories")
def categories():
    return CATEGORIES


@router.get("/stats")
def stats(user=Depends(get_current_user), db=Depends(get_db)):
    counts = {s: 0 for s in STATUSES}
    for r in db.execute("SELECT status, COUNT(*) AS n FROM issues GROUP BY status"):
        counts[r["status"]] = r["n"]
    return {"total": sum(counts.values()), **counts}


@router.get("/issues")
def list_issues(status: str = None, category: str = None, q: str = None, mine: bool = False,
                user=Depends(get_current_user), db=Depends(get_db)):
    where, args = [], []
    if status:
        where.append("i.status = ?"); args.append(status)
    if category:
        where.append("i.category = ?"); args.append(category)
    if q:
        where.append("(i.title LIKE ? OR i.description LIKE ?)"); args += [f"%{q}%"] * 2
    if mine:
        where.append("i.created_by = ?"); args.append(user["id"])
    sql = BASE_QUERY + (" WHERE " + " AND ".join(where) if where else "") + " ORDER BY i.created_at DESC"
    return [dict(r) for r in db.execute(sql, args)]


@router.post("/issues", status_code=201)
def create_issue(data: IssueIn, user=Depends(get_current_user), db=Depends(get_db)):
    ts = now()
    cur = db.execute(
        "INSERT INTO issues (title, description, category, created_by, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (data.title, data.description, data.category, user["id"], ts, ts),
    )
    db.commit()
    return get_issue_or_404(db, cur.lastrowid)


@router.get("/issues/{issue_id}")
def issue_detail(issue_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    return get_issue_or_404(db, issue_id)


@router.patch("/issues/{issue_id}/status")
def update_status(issue_id: int, data: StatusIn, user=Depends(get_current_user), db=Depends(get_db)):
    get_issue_or_404(db, issue_id)
    db.execute("UPDATE issues SET status = ?, updated_at = ? WHERE id = ?", (data.status, now(), issue_id))
    db.commit()
    return get_issue_or_404(db, issue_id)
