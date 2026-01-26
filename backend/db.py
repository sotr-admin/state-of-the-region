import os
import time
import struct

import pyodbc
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential, InteractiveBrowserCredential, TokenCachePersistenceOptions

SQL_COPT_SS_ACCESS_TOKEN = 1256

load_dotenv()

# --- Azure AD token caching (prevents repeated login popups) ---
_cache_opts = TokenCachePersistenceOptions(name="sotr-token-cache")

if os.getenv("AZURE_ENV") == "cloud":
    credential = DefaultAzureCredential()
else:
    credential = InteractiveBrowserCredential(cache_persistence_options=_cache_opts)


_token_cache = {"token": None, "expires_on": 0}


def get_access_token() -> str:
    """
    Returns a valid access token for Azure SQL.
    Refreshes only when token is missing or close to expiry.
    """
    # Refresh if missing or expiring in next 2 minutes
    if (not _token_cache["token"]) or (time.time() > (_token_cache["expires_on"] - 120)):
        t = credential.get_token("https://database.windows.net/.default")
        _token_cache["token"] = t.token
        _token_cache["expires_on"] = t.expires_on
    return _token_cache["token"]


def get_conn():
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")
    driver = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")

    if not server or not database:
        raise RuntimeError("DB_SERVER and DB_NAME must be set in .env")

    token = get_access_token()

    token_bytes = token.encode("utf-16-le")
    token_struct = struct.pack(f"<I{len(token_bytes)}s", len(token_bytes), token_bytes)

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER=tcp:{server},1433;"
        f"DATABASE={database};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )

    return pyodbc.connect(conn_str, attrs_before={SQL_COPT_SS_ACCESS_TOKEN: token_struct})
