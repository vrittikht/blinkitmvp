"""
Smoke-test completed phases (0–3) against one running API.

Usage:
  cd backend
  .\\.venv\\Scripts\\python ..\\scripts\\test_phases.py
  # or: python scripts/test_phases.py  (with API_BASE set)

Requires API at API_BASE (default http://127.0.0.1:8000).
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000").rstrip("/")
passed = 0
failed = 0


def req(method: str, path: str, body: dict | None = None):
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=15) as resp:
        raw = resp.read().decode("utf-8")
        return resp.status, json.loads(raw) if raw else None


def check(name: str, cond: bool, detail: str = ""):
    global passed, failed
    safe = detail.encode("ascii", "replace").decode("ascii") if detail else ""
    if cond:
        passed += 1
        print(f"  PASS  {name}" + (f" — {safe}" if safe else ""))
    else:
        failed += 1
        print(f"  FAIL  {name}" + (f" — {safe}" if safe else ""))


def main() -> int:
    print(f"Testing Category Quest MVP at {BASE}\n")

    print("Phase 0 — foundation")
    try:
        status, health = req("GET", "/health")
        check("GET /health", status == 200 and health.get("status") == "ok", str(health))
        check("health reports service", health.get("service") == "category-quest-api")
    except urllib.error.URLError as exc:
        print(f"  FAIL  API unreachable: {exc}")
        print("\nStart the API first: cd backend && uvicorn app.main:app --port 8000")
        return 1

    print("\nPhase 1 — catalog")
    _, categories = req("GET", "/categories")
    check("GET /categories", isinstance(categories, list) and len(categories) >= 12, f"count={len(categories)}")
    snacks = next((c for c in categories if c["name"] == "Snacks"), None)
    pharmacy = next((c for c in categories if c["name"] == "Pharmacy"), None)
    check("Snacks category exists", snacks is not None)
    check("Pharmacy category exists", pharmacy is not None)

    _, products = req("GET", f"/products?category_id={snacks['id']}")
    check("GET /products?category_id=", isinstance(products, list) and len(products) >= 5, f"count={len(products)}")

    print("\nPhase 2 — quest engine")
    # Isolate demo user state by using a unique disposable approach:
    # create orders on demo user — for clean rule checks we assert relative behavior
    # using sequential calls and reading messages/types.
    _, p0 = req("GET", "/progress")
    start_earned = p0.get("spins_earned", 0)

    _, c1 = req("POST", "/checkout", {"category": "Kitchen Essentials"})
    # May or may not unlock depending on prior state; verify shape always
    check(
        "POST /checkout response shape",
        all(k in c1 for k in ("spinUnlocked", "message", "rewardEligible", "progress")),
    )

    _, c2 = req("POST", "/checkout", {"category": "Kitchen Essentials"})
    check(
        "repeat category does not unlock spin",
        c2.get("spinUnlocked") is False,
        c2.get("message", "")[:60],
    )

    # Pick a category likely not yet explored this month
    explored = set(c2["progress"].get("explored_categories") or [])
    candidate = next(
        (c["name"] for c in categories if c["name"] not in explored),
        None,
    )
    if candidate:
        _, c3 = req("POST", "/checkout", {"category": candidate})
        if c2["progress"]["spins_earned"] < c2["progress"]["max_spins"]:
            check(
                "new category unlocks spin (when under cap)",
                c3.get("spinUnlocked") is True and c3.get("unlockType") == "new_category",
                f"category={candidate}",
            )
        else:
            check(
                "at spin cap: new category recorded without spin",
                c3.get("spinUnlocked") is False and candidate in c3["progress"]["explored_categories"],
                f"category={candidate}",
            )
    else:
        check("new category available to test", False, "all catalog categories already explored")

    _, progress = req("GET", "/progress")
    check("GET /progress has milestones", "starter_spin" in progress and "explored_categories" in progress)
    check("spins_earned never decreases", progress["spins_earned"] >= start_earned)

    print("\nPhase 3 — spin & coupons")
    _, templates = req("GET", "/reward-templates")
    check("GET /reward-templates (wheel)", isinstance(templates, list) and len(templates) == 8, f"count={len(templates)}")

    remaining = progress.get("spins_remaining", 0)
    if remaining <= 0:
        # Earn a spin via a fresh unexplored category if possible
        explored = set(progress.get("explored_categories") or [])
        for c in categories:
            if c["name"] not in explored and progress.get("spins_earned", 0) < progress.get("max_spins", 3):
                _, unlock = req("POST", "/checkout", {"category": c["name"]})
                remaining = unlock["progress"]["spins_remaining"]
                break

    if remaining > 0:
        before = remaining
        _, spin = req("POST", "/spin", {})
        check(
            "POST /spin returns coupon",
            spin.get("coupon") and spin["coupon"].get("reward_name"),
            spin.get("message", "")[:50],
        )
        check(
            "spin decrements spins_remaining",
            spin["progress"]["spins_remaining"] == before - 1,
            f"{before} → {spin['progress']['spins_remaining']}",
        )
        _, coupons = req("GET", "/coupons")
        check("GET /coupons includes win", isinstance(coupons, list) and len(coupons) >= 1, f"count={len(coupons)}")
        if coupons:
            _, redeemed = req("POST", f"/coupons/{coupons[0]['id']}/redeem", {})
            check("POST redeem coupon", redeemed.get("status") == "redeemed")
    else:
        # Demo user may already be at monthly cap from prior acceptance runs
        _, coupons = req("GET", "/coupons")
        check(
            "spin capped — coupons endpoint still works",
            isinstance(coupons, list),
            f"spins_earned={progress.get('spins_earned')} coupons={len(coupons)}",
        )

    print(f"\nResult: {passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
