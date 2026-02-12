import os
import time
import struct
import threading  # Added for concurrency safety
from pathlib import Path

import pyodbc
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential, InteractiveBrowserCredential, TokenCachePersistenceOptions

# --- Constants ---
SQL_COPT_SS_ACCESS_TOKEN = 1256

# --- Configuration & State ---
load_dotenv()

# Use a threading lock to prevent "Request Storms" from crashing authentication
_token_lock = threading.Lock()
_cache_opts = TokenCachePersistenceOptions(name="sotr-token-cache")
_token_cache = {"token": None, "expires_on": 0}

# Initialize the credential based on environment
if os.getenv("AZURE_ENV") == "cloud":
    # Increased connection_timeout to 10s to handle IMDS latency
    credential = DefaultAzureCredential(connection_timeout=10)
else:
    credential = InteractiveBrowserCredential(cache_persistence_options=_cache_opts)


def get_access_token() -> str:
    """
    Returns a valid access token for Azure SQL.
    Refreshes only when token is missing or close to expiry.
    Uses a lock to prevent multiple simultaneous refresh attempts.
    """
    global _token_cache
    
    # thread-safe block: only one request can enter this at a time
    with _token_lock:
        now = time.time()
        
        # Refresh if missing or expiring in next 5 minutes (300 seconds)
        # This is more robust than 2 minutes for high-traffic auto-loading
        if (not _token_cache["token"]) or (now > (_token_cache["expires_on"] - 300)):
            try:
                t = credential.get_token("https://database.windows.net/.default")
                _token_cache["token"] = t.token
                _token_cache["expires_on"] = t.expires_on
            except Exception as e:
                # Fallback: if Azure is slow but we have a token that hasn't 
                # technically expired yet, keep using it instead of crashing.
                if _token_cache["token"] and now < _token_cache["expires_on"]:
                    return _token_cache["token"]
                raise e
                
    return _token_cache["token"]


def get_conn():
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")
    driver = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")

    if not server or not database:
        raise RuntimeError("DB_SERVER and DB_NAME must be set in .env")

    # This call is now thread-safe
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
