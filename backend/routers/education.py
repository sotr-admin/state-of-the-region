from fastapi import APIRouter, Query, HTTPException
from db import get_conn


router = APIRouter()

@router.get("/api/indicator/B15003")
def b15003_series(
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
        (
            f.total_bachelors_degree
          + f.total_masters_degree
          + f.total_professional_school_degree
          + f.total_doctorate_degree
        ) * 100.0 / NULLIF(f.total, 0) AS bachelors_or_higher_pct
    FROM dbo.fact_county_B15003 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total IS NOT NULL
      AND (
            f.total_bachelors_degree
          + f.total_masters_degree
          + f.total_professional_school_degree
          + f.total_doctorate_degree
      ) IS NOT NULL
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
        "indicator": "B15003",
        "metric": "bachelors_or_higher_pct",
        "unit": "percent",
        "series": series,
    }

@router.get("/api/indicator/B15012")
def b15012_series(
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
        (f.total_science_and_engineering_computers_mathematics_and_statistics * 100.0)
            / NULLIF(f.total, 0) AS stem_bachelors_pct
    FROM dbo.fact_county_B15012 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total IS NOT NULL
      AND f.total > 0
      AND f.total_science_and_engineering_computers_mathematics_and_statistics IS NOT NULL
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
        "indicator": "B15012",
        "metric": "stem_bachelors_pct",
        "unit": "percent",
        "series": series,
    }
