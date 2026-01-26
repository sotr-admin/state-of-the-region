from fastapi import APIRouter, Query, HTTPException
from backend.db import get_conn


router = APIRouter()

@router.get("/api/indicator/B07012")
def b07012_series(
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
            COALESCE(f.total_moved_within_same_county_below_100_percent_of_the_poverty_level, 0)
          + COALESCE(f.total_moved_from_different_county_within_same_state_below_100_percent_of_the_poverty_level, 0)
          + COALESCE(f.total_moved_from_different_state_below_100_percent_of_the_poverty_level, 0)
          + COALESCE(f.total_moved_from_abroad_below_100_percent_of_the_poverty_level, 0)
        ) * 100.0
        / NULLIF(f.total_below_100_percent_of_the_poverty_level, 0) AS mobility_rate_below_poverty
    FROM dbo.fact_county_B07012 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.total_below_100_percent_of_the_poverty_level IS NOT NULL
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
        "indicator": "B07012",
        "metric": "mobility_rate_below_poverty",
        "unit": "%",
        "series": series,
    }


@router.get("/api/indicator/B17002")
def b17002_series(
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
        CASE
          WHEN f.total IS NULL OR f.total = 0 THEN NULL
          ELSE (
            (COALESCE(f.total_under_50, 0)
             + COALESCE(f.total_50_to_74, 0)
             + COALESCE(f.total_75_to_99, 0)
            ) * 100.0 / f.total
          )
        END AS below_100_pct_poverty
    FROM dbo.fact_county_B17002 f
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
        "indicator": "B17002",
        "metric": "below_100_pct_poverty",
        "unit": "%",
        "series": series,
    }

@router.get("/api/indicator/B17009")
def b17009_series(
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

    # Metric: share of below-poverty who worked full-time year-round (%)
    # numerator: total_income_in_the_past_12_months_below_the_poverty_level_worked_fulltime_yearround
    # denom:     total_income_in_the_past_12_months_below_the_poverty_level
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        CASE
          WHEN f.total_income_in_the_past_12_months_below_the_poverty_level IS NULL
               OR f.total_income_in_the_past_12_months_below_the_poverty_level = 0
               OR f.total_income_in_the_past_12_months_below_the_poverty_level_worked_fulltime_yearround IS NULL
          THEN NULL
          ELSE
            100.0 * f.total_income_in_the_past_12_months_below_the_poverty_level_worked_fulltime_yearround
            / f.total_income_in_the_past_12_months_below_the_poverty_level
        END AS below_poverty_worked_fulltime_yearround_pct
    FROM dbo.fact_county_B17009 f
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
        "indicator": "B17009",
        "metric": "below_poverty_worked_fulltime_yearround_pct",
        "unit": "%",
        "series": series,
    }
