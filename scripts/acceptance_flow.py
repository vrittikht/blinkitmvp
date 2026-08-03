"""
Acceptance flow for Phase 5 (architecture core user journey).

1. Snacks checkout → Starter Spin
2. Spin → coupon
3. Pharmacy → second spin
4. Progress: starter + cat1
5. Kitchen Essentials → third spin / quest near-complete

Usage:
  $env:API_BASE='http://127.0.0.1:8000'
  python scripts/acceptance_flow.py
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000").rstrip("/")


def req(method: str, path: str, body: dict | None = None):
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=20) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else None


def ok(label: str, cond: bool, detail: str = ""):
    mark = "PASS" if cond else "FAIL"
    safe = detail.encode("ascii", "replace").decode("ascii")
    print(f"  [{mark}] {label}" + (f" — {safe}" if safe else ""))
    return cond


def main() -> int:
    print(f"Acceptance flow @ {BASE}\n")
    failed = 0

    health = req("GET", "/health")
    if not ok("health phase 5", health.get("phase") == 5, str(health)):
        failed += 1

    # Reset-ish: use categories and drive the happy path on demo user
    # (stateful demo user — script asserts relative transitions)

    c1 = req("POST", "/checkout", {"category": "Snacks"})
    # May already have starter; if so spins may not unlock again
    progress = c1["progress"]

    if not progress.get("starter_spin"):
        if not ok("starter unlock on first snacks", c1.get("unlockType") == "starter"):
            failed += 1
    else:
        ok("starter already earned (continuing)", True)

    # Ensure at least one spin remaining for spin step
    if progress["spins_remaining"] <= 0:
        explored = set(progress.get("explored_categories") or [])
        for cat in ("Pharmacy", "Kitchen Essentials", "Dairy", "Bakery", "Stationery"):
            if cat in explored:
                continue
            if progress["spins_earned"] >= progress["max_spins"]:
                break
            nxt = req("POST", "/checkout", {"category": cat})
            progress = nxt["progress"]
            if progress["spins_remaining"] > 0:
                break

    if progress["spins_remaining"] > 0:
        before = progress["spins_remaining"]
        spin = req("POST", "/spin", {})
        if not ok("spin yields coupon", bool(spin.get("coupon")), spin.get("message", "")):
            failed += 1
        if not ok("spin decrements remaining", spin["progress"]["spins_remaining"] == before - 1):
            failed += 1
        coupons = req("GET", "/coupons")
        if not ok("coupon listed", isinstance(coupons, list) and len(coupons) >= 1):
            failed += 1
    else:
        if not ok("have spin for acceptance", False, "no spins remaining"):
            failed += 1

    # Pharmacy path for cat milestone
    p = req("GET", "/progress")
    explored = set(p.get("explored_categories") or [])
    if "Pharmacy" not in explored and p["spins_earned"] < p["max_spins"]:
        ph = req("POST", "/checkout", {"category": "Pharmacy"})
        p = ph["progress"]
        if not ok("pharmacy unlocks or explores", "Pharmacy" in p["explored_categories"]):
            failed += 1

    if "Kitchen Essentials" not in set(p.get("explored_categories") or []) and p["spins_earned"] < p["max_spins"]:
        k = req("POST", "/checkout", {"category": "Kitchen Essentials"})
        p = k["progress"]

    p = req("GET", "/progress")
    if not ok("dashboard starter", p.get("starter_spin") is True):
        failed += 1
    if not ok("dashboard new_category_1 (2+ explored)", p.get("new_category_1") is True or len(p.get("explored_categories") or []) >= 2):
        failed += 1

    print(f"\nExplored: {', '.join(p.get('explored_categories') or [])}")
    print(f"Spins earned/remaining: {p['spins_earned']}/{p['spins_remaining']}")
    print(f"\n{'All checks passed' if failed == 0 else f'{failed} check(s) failed'}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
