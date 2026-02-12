import re
from typing import List, Dict

from fastapi import APIRouter, Query, HTTPException

from db import get_conn

router = APIRouter()

# Add to this set as you add new indicator endpoints/tables.
ALLOWED_INDICATORS = {
    "B25070",
    "B19083",
    "B19113",
    "B25002",
    "B11016",
    "B25077",
    "B15003",
    "B15012",
    "B08006",
    "B23025",
    "B23006",
    "B17002",
    "B17009",
    "B07012",
    "B07201",
    "B07402",
    "B07007",
    "B07009",
}


@router.get("/api/available-counties")
def available_counties(
    indicator: str = Query(..., description="Indicator code, e.g., B19083"),
    search: str = Query(default="", max_length=100, description="Search by county/state/FIPS prefix"),
    limit: int = Query(default=200, ge=10, le=1000, description="Max results returned"),
) -> List[Dict]:
    """
    Returns only counties that have at least one row in dbo.fact_county_{indicator}.
    This prevents users from selecting counties with no data for that indicator.
    """
    ind = (indicator or "").strip().upper()

    # Basic format check
    if not re.fullmatch(r"[A-Z0-9]+", ind):
        raise HTTPException(status_code=400, detail="Invalid indicator format.")

    # Allowlist check (important for dynamic table names)
    if ind not in ALLOWED_INDICATORS:
        raise HTTPException(status_code=400, detail=f"Indicator not enabled: {ind}")

    q = (search or "").strip()
    if len(q) == 0:
        return []

    table_name = f"dbo.fact_county_{ind}"

    # Dynamic table name is safe here because of allowlist + regex above
    sql = f"""
    SELECT TOP ({limit})
        g.county_fips,
        g.county_name,
        g.state_name
    FROM {table_name} f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    WHERE
        g.county_name LIKE '%' + ? + '%'
        OR g.state_name LIKE '%' + ? + '%'
        OR g.county_fips LIKE ? + '%'
    GROUP BY
        g.county_fips, g.county_name, g.state_name
    ORDER BY
        CASE
            WHEN g.county_fips LIKE ? + '%' THEN 0
            WHEN g.county_name LIKE ? + '%' THEN 1
            WHEN g.state_name LIKE ? + '%' THEN 2
            ELSE 3
        END,
        g.state_name, g.county_name;
    """

    params = (q, q, q, q, q, q)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    return [{"county_fips": r[0], "county_name": r[1], "state_name": r[2]} for r in rows]
