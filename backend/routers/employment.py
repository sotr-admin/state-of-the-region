from fastapi import APIRouter, Query, HTTPException
from backend.db import get_conn


router = APIRouter()

@router.get("/api/indicator/B08006")
def b08006_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))

    if len(county_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 county_fips.")
    if len(county_list) > 3:
        raise HTTPException(status_code=400, detail="Max 3 counties allowed.")
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year.")

    placeholders = ",".join(["?"] * len(county_list))

    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (f.total_public_transportation_excluding_taxicab * 100.0)
            / NULLIF(f.total, 0) AS public_transit_share_pct
    FROM dbo.fact_county_B08006 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total IS NOT NULL
      AND f.total > 0
      AND f.total_public_transportation_excluding_taxicab IS NOT NULL
    ORDER BY g.state_name, g.county_name, y.year;
    """

    params = tuple(county_list) + (start_year, end_year)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    series = []
    for r in rows:
        series.append(
            {
                "county_fips": r[0],
                "county_name": r[1],
                "state_name": r[2],
                "year": int(r[3]),
                "value": float(r[4]) if r[4] is not None else None,
            }
        )

    return {
        "indicator": "B08006",
        "metric": "public_transit_share_pct",
        "unit": "percent",
        "series": series,
    }


@router.get("/api/indicator/B23025")
def b23025_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))

    if len(county_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 county_fips.")
    if len(county_list) > 3:
        raise HTTPException(status_code=400, detail="Max 3 counties allowed.")
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year.")

    placeholders = ",".join(["?"] * len(county_list))

    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (f.unemployed * 100.0)
            / NULLIF(f.civilian_labor_force, 0) AS unemployment_rate_pct
    FROM dbo.fact_county_B23025 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.unemployed IS NOT NULL
      AND f.civilian_labor_force IS NOT NULL
      AND f.civilian_labor_force > 0
    ORDER BY g.state_name, g.county_name, y.year;
    """

    params = tuple(county_list) + (start_year, end_year)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    series = []
    for r in rows:
        series.append(
            {
                "county_fips": r[0],
                "county_name": r[1],
                "state_name": r[2],
                "year": int(r[3]),
                "value": float(r[4]) if r[4] is not None else None,
            }
        )

    return {
        "indicator": "B23025",
        "metric": "unemployment_rate_pct",
        "unit": "percent",
        "series": series,
    }

@router.get("/api/indicator/B23006")
def b23006_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))

    if len(county_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 county_fips.")
    if len(county_list) > 3:
        raise HTTPException(status_code=400, detail="Max 3 counties allowed.")
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year.")

    placeholders = ",".join(["?"] * len(county_list))

    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (f.bachelor_degree_or_higher / NULLIF(f.total_employed, 0)) * 100
            AS employed_with_bachelors_or_higher_pct
    FROM dbo.fact_county_B23006 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total_employed IS NOT NULL
      AND f.bachelor_degree_or_higher IS NOT NULL
    ORDER BY g.state_name, g.county_name, y.year;
    """

    params = tuple(county_list) + (start_year, end_year)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()

    series = [
        {
            "county_fips": r[0],
            "county_name": r[1],
            "state_name": r[2],
            "year": int(r[3]),
            "value": float(r[4]) if r[4] is not None else None,
        }
        for r in rows
    ]

    return {
        "indicator": "B23006",
        "metric": "employed_with_bachelors_or_higher_pct",
        "unit": "%",
        "series": series,
    }
