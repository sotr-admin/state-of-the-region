from fastapi import APIRouter, Query, HTTPException
from db import get_conn


router = APIRouter()


@router.get("/api/indicator/B07201")
def b07201_series(
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

    # Metric: overall mobility rate (%)
    # numerator: Different_house_in_United_States_1_year_ago + Abroad_1_year_ago
    # denom:     Total
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        (
            COALESCE(f.Different_house_in_United_States_1_year_ago, 0)
          + COALESCE(f.Abroad_1_year_ago, 0)
        ) * 100.0
        / NULLIF(f.Total, 0) AS overall_mobility_rate
    FROM dbo.fact_county_B07201 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.Total IS NOT NULL
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
        "indicator": "B07201",
        "metric": "overall_mobility_rate",
        "unit": "%",
        "series": series,
    }

@router.get("/api/indicator/B07402")
def b07402_series(
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

    # Metric: median age of interstate movers (years)
    # column: Median_age_Total_living_in_area_1_year_ago_Moved_to_different_state
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        f.Median_age_Total_living_in_area_1_year_ago_Moved_to_different_state
          AS median_age_interstate_movers
    FROM dbo.fact_county_B07402 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.Median_age_Total_living_in_area_1_year_ago_Moved_to_different_state IS NOT NULL
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
        "indicator": "B07402",
        "metric": "median_age_interstate_movers",
        "unit": "years",
        "series": series,
    }


@router.get("/api/indicator/B07007")
def b07007_series(
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

    # Metric: Share of residents born outside the U.S. (%)
    # numerator: Foreign_born
    # denom:     Total
    sql = f"""
    SELECT
        f.county_fips,
        g.county_name,
        g.state_name,
        y.year,
        COALESCE(f.Foreign_born, 0) * 100.0
        / NULLIF(f.Total, 0) AS born_outside_us_share
    FROM dbo.fact_county_B07007 f
    JOIN dbo.dim_geo g
      ON f.county_fips = g.county_fips
    JOIN dbo.dim_year y
      ON f.year_id = y.year_id
    WHERE f.county_fips IN ({placeholders})
      AND y.year BETWEEN ? AND ?
      AND f.Total IS NOT NULL
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
        "indicator": "B07007",
        "metric": "born_outside_us_share",
        "unit": "%",
        "series": series,
    }
