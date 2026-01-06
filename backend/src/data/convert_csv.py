import csv
import sys
import time
from typing import Dict, List

import requests

API_URL = "https://users.roblox.com/v1/usernames/users"


def chunked(lst: List[str], n: int) -> List[List[str]]:
    return [lst[i : i + n] for i in range(0, len(lst), n)]


def roblox_usernames_to_ids(usernames: List[str], batch_size: int = 100) -> Dict[str, int]:
    out: Dict[str, int] = {}
    s = requests.Session()

    for batch in chunked(usernames, batch_size):
        payload = {"usernames": batch, "excludeBannedUsers": False}

        for attempt in range(6):
            r = s.post(API_URL, json=payload, headers={"Accept": "application/json"})
            if r.status_code == 200:
                for item in r.json().get("data", []):
                    req_name = item.get("requestedUsername") or item.get("name")
                    uid = item.get("id")
                    if req_name and isinstance(uid, int):
                        out[req_name] = uid
                break

            if r.status_code in (429, 529):
                reset = r.headers.get("x-ratelimit-reset")
                sleep_s = float(reset) if reset and reset.replace(".", "", 1).isdigit() else (2 ** attempt)
                time.sleep(min(60.0, sleep_s))
                continue

            raise RuntimeError(f"Roblox API error {r.status_code}: {r.text[:300]}")
        else:
            raise RuntimeError("Failed too many times (rate limited / transient errors).")

    return out


def main(in_path: str, out_path: str) -> None:
    with open(in_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    usernames = [(row.get("userId") or "").strip() for row in rows if (row.get("userId") or "").strip()]
    name_to_id = roblox_usernames_to_ids(sorted(set(usernames)))

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        writer.writerow(["userId", "payoutInRobux"])

        for row in rows:
            username = (row.get("userId") or "").strip()
            robux = (row.get("totalRobux") or "").strip()
            uid = name_to_id.get(username)

            writer.writerow([uid if uid is not None else "", robux])


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_csv.py input.csv output.csv")
        raise SystemExit(2)
    main(sys.argv[1], sys.argv[2])
