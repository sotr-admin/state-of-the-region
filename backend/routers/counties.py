from typing import List, Dict

from fastapi import APIRouter, Query
from db import get_conn

router = APIRouter()

@router.get("/api/counties")
def get_counties(
    search: str = Query(
        default="",
        max_length=100,
        description="Search by county, state, or FIPS prefix",
    ),
    limit: int = Query(
        default=200,
        ge=10,
        le=1000,
        description="Max results returned",
    ),
) -> List[Dict]:
    """
    Search-driven endpoint (does NOT return the entire dim_geo table).
    - If search length < 2: return [] so UI doesn't load everything.
    - Otherwise: return up to `limit` matches.
    """
    q = (search or "").strip()

    # Important: don't return the full table when input is empty.
    if len(q) < 2:
        return []

    sql = f"""
    SELECT TOP ({limit})
        county_fips,
        county_name,
        state_name
    FROM dbo.dim_geo
    WHERE
        county_name LIKE '%' + ? + '%'
        OR state_name LIKE '%' + ? + '%'
        OR county_fips LIKE ? + '%'
    ORDER BY
        CASE
            WHEN county_fips LIKE ? + '%' THEN 0
            WHEN county_name LIKE ? + '%' THEN 1
            WHEN state_name LIKE ? + '%' THEN 2
            ELSE 3
        END,
        state_name, county_name;
    """

    params = (q, q, q, q, q, q)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    return [{"county_fips": r[0], "county_name": r[1], "state_name": r[2]} for r in rows]
