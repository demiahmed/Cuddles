import argparse
import requests
from faker import Faker
from datetime import datetime, timedelta
import random
import json
from tqdm import tqdm
import re

# Initialize Faker
fake = Faker()

# API base URL
API_BASE_URL = "http://127.0.0.1:8500"

def parse_entries(txt_file):
    """Parse Flo-exported text file into Period and Sex entries."""
    entries = []
    with open(txt_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Example formats:
            # Period: "123 - 2025-01-01 08:00:00.0 - Period Start - flow: light - symptoms: cramps, fatigue"
            # Sex: "1671 - 2025-01-13 14:00:00.0 - Sex - protected - satisfaction: 4 - time_of_day: 14:00"
            parts = [p.strip() for p in line.split(" - ")]
            if len(parts) < 3 or parts[2].lower() not in ["period start", "period end", "sex"]:
                print(f"Skipping invalid line: {line}")
                continue

            try:
                dt_str = parts[1].split(".")[0]  # Drop .0
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                iso_date = dt.strftime("%Y-%m-%dT%H:%M")  # Format without seconds
            except ValueError as e:
                print(f"Invalid datetime in line: {line}, Error: {str(e)}")
                continue

            entry_type = {"period start": "period_start", "period end": "period_end", "sex": "sex"}.get(parts[2].lower())
            entry = {"entry_type": entry_type, "datetime": iso_date}

            # Parse fields based on entry type
            if entry_type in ["period_start", "period_end"]:
                for part in parts[3:]:
                    if part.startswith("flow:"):
                        entry["flow"] = part.split(":", 1)[1].strip() or None
                    elif part.startswith("pain:"):
                        value = part.split(":", 1)[1].strip()
                        entry["pain"] = int(value) if value != "None" and value.isdigit() else None
                    elif part.startswith("mood:"):
                        entry["mood"] = part.split(":", 1)[1].strip() or None
                    elif part.startswith("symptoms:"):
                        symptoms = [s.strip() for s in part.split(":", 1)[1].split(",") if s.strip()]
                        entry["symptoms"] = symptoms or []
                    elif part.startswith("notes:"):
                        entry["notes"] = part.split(":", 1)[1].strip() or None
            elif entry_type == "sex":
                for part in parts[3:]:
                    if part.lower() in ["protected", "no"]:
                        entry["protected"] = part.lower()
                    elif part.lower() == "none":
                        entry["protected"] = None
                    elif part.startswith("satisfaction:"):
                        value = part.split(":", 1)[1].strip()
                        entry["satisfaction"] = int(value) if value != "None" and value.isdigit() else None
                    elif part.startswith("lube:"):
                        entry["lube"] = part.split(":", 1)[1].strip() or None
                    elif part.startswith("time_of_day:"):
                        entry["time_of_day"] = part.split(":", 1)[1].strip() or None
                    elif part.startswith("notes:"):
                        entry["notes"] = part.split(":", 1)[1].strip() or None
                # Set time_of_day to HH:MM if not provided
                if not entry.get("time_of_day"):
                    entry["time_of_day"] = dt.strftime("%H:%M")

            entries.append(entry)
    return entries

def generate_fake_data(num_period_cycles=20, num_sex_entries=50):
    """Generate fake Period and Sex entries for October 2023 to October 2025."""
    entries = []
    start_date = datetime(2023, 10, 1)
    end_date = datetime(2025, 10, 1)

    # Periods: Specified number of cycles
    current_date = start_date
    for _ in range(num_period_cycles):
        if current_date >= end_date:
            break
        cycle_length = random.randint(28, 35)
        period_duration = random.randint(3, 7)
        period_start = current_date
        period_end = period_start + timedelta(days=period_duration)
        if period_end > end_date:
            break
        symptoms = random.sample(
            ["cramps", "fatigue", "headache", "mood swings", "bloating"],
            k=random.randint(0, 3)
        )

        # Period start entry
        entries.append({
            "entry_type": "period_start",
            "datetime": period_start.strftime("%Y-%m-%dT%H:%M"),
            "flow": random.choice(["light", "medium", "heavy"]),
            "pain": random.randint(1, 5) if random.random() > 0.3 else None,
            "mood": random.choice(["happy", "irritable", "calm", "anxious"]) if random.random() > 0.3 else None,
            "symptoms": symptoms if symptoms else [],
            "notes": fake.sentence(nb_words=6) if random.random() > 0.5 else None
        })

        # Period end entry
        entries.append({
            "entry_type": "period_end",
            "datetime": period_end.strftime("%Y-%m-%dT%H:%M"),
            "flow": random.choice(["light", "medium", "heavy"]),
            "pain": random.randint(1, 5) if random.random() > 0.3 else None,
            "mood": random.choice(["happy", "irritable", "calm", "anxious"]) if random.random() > 0.3 else None,
            "symptoms": symptoms if symptoms else [],
            "notes": fake.sentence(nb_words=6) if random.random() > 0.5 else None
        })

        current_date += timedelta(days=cycle_length)

    # Sex: Specified number of entries
    for _ in range(num_sex_entries):
        date = fake.date_time_between(start_date=start_date, end_date=end_date)
        iso_date = date.strftime("%Y-%m-%dT%H:%M")
        entries.append({
            "entry_type": "sex",
            "datetime": iso_date,
            "protected": random.choice(["protected", "no"]),
            "satisfaction": random.randint(1, 5) if random.random() > 0.3 else None,
            "lube": random.choice(["yes", "no"]) if random.random() > 0.5 else None,
            "time_of_day": date.strftime("%H:%M"),
            "notes": fake.sentence(nb_words=6) if random.random() > 0.5 else None
        })

    return entries

def ingest(entries, dry_run=False):
    """Send entries to API or print if dry run."""
    for entry in tqdm(entries, desc="Uploading entries"):
        if dry_run:
            print(json.dumps(entry, indent=2))
        else:
            try:
                response = requests.post(f"{API_BASE_URL}/api/entries", json=entry)
                if response.status_code != 201:
                    print(f"Failed to create entry: {response.status_code} - {response.text} - Payload: {json.dumps(entry)}")
                else:
                    print(f"Created entry: {entry['entry_type']} - {entry['datetime']}")
            except requests.RequestException as e:
                print(f"Request failed: {str(e)} - Payload: {json.dumps(entry)}")

def main():
    parser = argparse.ArgumentParser(description="Ingest Period and Sex data into Cuddles API")
    parser.add_argument("--file", help="Path to Flo-exported text file")
    parser.add_argument("--fake", action="store_true", help="Generate fake data")
    parser.add_argument("--num-period-cycles", type=int, default=20, help="Number of period cycles to generate (default: 20)")
    parser.add_argument("--num-sex-entries", type=int, default=50, help="Number of sex entries to generate (default: 50)")
    parser.add_argument("--dry-run", action="store_true", help="Print instead of POSTing")
    args = parser.parse_args()

    if not args.file and not args.fake:
        parser.error("Either --file or --fake must be specified")
    if args.file and args.fake:
        parser.error("Cannot use both --file and --fake")

    if args.file:
        entries = parse_entries(args.file)
    else:
        entries = generate_fake_data(args.num_period_cycles, args.num_sex_entries)

    ingest(entries, dry_run=args.dry_run)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("Error: API server not running at http://127.0.0.1:8500. Start the dev server first.")