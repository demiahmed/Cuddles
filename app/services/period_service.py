from datetime import timedelta
from app.models import Period
from app.services.base_service import BaseService
from app.utils.helpers import parse_iso
from datetime import timezone

class PeriodService(BaseService):
    model = Period

    @classmethod
    def calculate_stats(cls):
        """Calculate period stats."""
        try:
            starts = Period.query.filter_by(entry_type="period_start").order_by(Period.datetime_iso).all()
            ends = Period.query.filter_by(entry_type="period_end").order_by(Period.datetime_iso).all()
            # Don't convert to UTC - keep local timezone
            starts_dt = [parse_iso(s.datetime_iso) for s in starts]
            ends_dt = [parse_iso(e.datetime_iso) for e in ends]

            period_starts = []
            if starts_dt:
                starts_dt.sort()
                current_group_start = starts_dt[0]
                last_date = starts_dt[0].date()
                for dt in starts_dt[1:]:
                    if (dt.date() - last_date).days > 1:
                        period_starts.append(current_group_start)
                        current_group_start = dt
                    last_date = dt.date()
                period_starts.append(current_group_start)

            cycle_lengths = []
            for i in range(1, len(period_starts)):
                days = (period_starts[i] - period_starts[i-1]).days
                cycle_lengths.append({
                    "start": period_starts[i].date().isoformat(),
                    "length_days": days
                })

            durations = []
            for s in period_starts:
                e = next((ee for ee in ends_dt if ee >= s), None)
                if e:
                    days = max(1, (e.date() - s.date()).days + 1)
                    durations.append({
                        "start": s.date().isoformat(),
                        "duration_days": days
                    })

            avg_cycle = round(sum(x["length_days"] for x in cycle_lengths) / len(cycle_lengths), 1) if cycle_lengths else None
            predicted_next = None
            ovulation_window = None
            if avg_cycle and period_starts:
                predicted_next = (period_starts[-1] + timedelta(days=round(avg_cycle))).date()
                ovulation_start = predicted_next - timedelta(days=16)
                ovulation_end = predicted_next - timedelta(days=12)
                ovulation_window = (ovulation_start, ovulation_end)

            # Add last period start for notification logic
            last_period_start = period_starts[-1].date() if period_starts else None
            avg_period_length = round(sum(x["duration_days"] for x in durations) / len(durations), 1) if durations else 5

            return {
                "cycle_lengths": cycle_lengths,
                "durations": durations,
                "avg_cycle": avg_cycle,
                "predicted_next": predicted_next,
                "ovulation_window": ovulation_window,
                "last_period_start": last_period_start,
                "avg_period_length": avg_period_length
            }
        except Exception as e:
            print(f"Error calculating period stats: {e}")
            return None