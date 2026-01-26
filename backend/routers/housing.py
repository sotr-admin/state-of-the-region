from fastapi import APIRouter, Query, HTTPException
from backend.db import get_conn


router = APIRouter()


@router.get("/api/indicator/B25002")
def b25002_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))  # de-dupe, preserve order

    if len(county_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 county_fips.")
    if len(county_list) > 3:
        raise HTTPException(status_code=400, detail="Max 3 counties allowed.")
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year.")

    placeholders = ",".join(["?"] * len(county_list))

    # Metric decision:
    # Occupancy rate = occupied_units / total_housing_units * 100
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (f.occupied_units * 100.0) / NULLIF(f.total_housing_units, 0) AS occupancy_pct
    FROM dbo.fact_county_B25002 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
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
        "indicator": "B25002",
        "metric": "occupancy_pct",
        "unit": "percent",
        "series": series,
    }

@router.get("/api/indicator/B11016")
def b11016_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))  # de-dupe, preserve order

    if len(county_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 county_fips.")
    if len(county_list) > 3:
        raise HTTPException(status_code=400, detail="Max 3 counties allowed.")
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year.")

    placeholders = ",".join(["?"] * len(county_list))

    # Metric: Family households as a share of all households (%)
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (f.total_family_households * 100.0 / NULLIF(f.total, 0)) AS family_households_pct
    FROM dbo.fact_county_B11016 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total IS NOT NULL
      AND f.total_family_households IS NOT NULL
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
        "indicator": "B11016",
        "metric": "family_households_pct",
        "unit": "percent",
        "series": series,
    }

@router.get("/api/indicator/B25077")
def b25077_series(
    counties: str = Query(..., description="Comma-separated county_fips, max 3"),
    start_year: int = Query(..., ge=1900, le=2100),
    end_year: int = Query(..., ge=1900, le=2100),
):
    county_list = [c.strip() for c in counties.split(",") if c.strip()]
    county_list = list(dict.fromkeys(county_list))  # de-dupe, preserve order

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
        f.median_value_in_dollars AS median_value_in_dollars
    FROM dbo.fact_county_B25077 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.median_value_in_dollars IS NOT NULL
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
        "indicator": "B25077",
        "metric": "median_value_in_dollars",
        "unit": "usd",
        "series": series,
    }
