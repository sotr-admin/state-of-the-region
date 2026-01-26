from fastapi import APIRouter, Query, HTTPException
from backend.db import get_conn

router = APIRouter()

@router.get("/api/indicator/B19083")
def b19083_series(
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
        f.gini_index AS gini_index
    FROM dbo.fact_county_B19083 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.gini_index IS NOT NULL
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
        "indicator": "B19083",
        "metric": "gini_index",
        "unit": "index",
        "series": series,
    }

@router.get("/api/indicator/B25070")
def b25070_series(
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
        (
            f.rent_30_to_34pct
          + f.rent_35_to_39pct
          + f.rent_40_to_49pct
          + f.rent_50_pct_or_more
        ) * 100.0 / NULLIF(f.total_renter_occupied_units, 0) AS rent_burdened_pct
    FROM dbo.fact_county_B25070 f
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
        "indicator": "B25070",
        "metric": "rent_burdened_pct",
        "unit": "percent",
        "series": series,
    }

@router.get("/api/indicator/B19113")
def b19113_series(
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
        f.median_family_income
    FROM dbo.fact_county_B19113 f
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
        "indicator": "B19113",
        "metric": "median_family_income",
        "unit": "USD (2024 inflation-adjusted)",
        "series": series,
    }
