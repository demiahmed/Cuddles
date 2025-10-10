from app.models import Sex
from app.services.base_service import BaseService
from datetime import datetime, timedelta
from collections import Counter

class SexService(BaseService):
    model = Sex

    @classmethod
    def calculate_stats(cls):
        """Calculate sex-related statistics."""
        try:
            entries = Sex.query.order_by(Sex.datetime_iso.asc()).all()
            if not entries:
                return cls._empty_stats()

            total = len(entries)
            dates = [datetime.fromisoformat(e.datetime_iso.replace('Z', '+00:00')).date() for e in entries]
            times = [datetime.fromisoformat(e.datetime_iso.replace('Z', '+00:00')).strftime('%H:%M') for e in entries]

            # Compute current month count
            now = datetime.now()
            current_month_count = sum(1 for d in dates if d.year == now.year and d.month == now.month)

            latest_date = max(dates)
            days_since_last = (datetime.now().date() - latest_date).days if dates else 'N/A'

            unique_dates = sorted(set(dates))
            longest_with = cls._calculate_longest_streak(unique_dates)
            longest_without = cls._calculate_longest_gap(unique_dates)

            gaps = [(unique_dates[i] - unique_dates[i-1]).days for i in range(1, len(unique_dates))]
            avg_gap_days = sum(gaps) / len(gaps) if gaps else 0

            days_span = (max(dates) - min(dates)).days + 1 if dates else 1
            entries_per_week = total / (days_span / 7) if days_span >= 7 else total
            entries_per_month = total / (days_span / 30.42) if days_span >= 30.42 else total

            satisfactions = [e.satisfaction for e in entries if e.satisfaction is not None]
            avg_satisfaction = sum(satisfactions) / len(satisfactions) if satisfactions else None

            time_counts = Counter(times)
            most_common_time = max(time_counts.items(), key=lambda x: x[1], default=('N/A', 0))[0]

            entry_list = [e.to_dict() for e in entries]

            return {
                'total': total,
                'avg_gap_days': round(avg_gap_days, 2),
                'days_since_last': days_since_last,
                'entries_per_week': round(entries_per_week, 2),
                'entries_per_month': round(entries_per_month, 2),
                'longest_with': longest_with,
                'longest_without': longest_without,
                'avg_satisfaction': round(avg_satisfaction, 2) if avg_satisfaction is not None else 'N/A',
                'most_common_time': most_common_time,
                'current_month_count': current_month_count,
                'list': entry_list
            }
        except Exception as e:
            print(f"Error calculating sex stats: {e}")
            return cls._empty_stats()

    @staticmethod
    def _empty_stats():
        """Return empty statistics structure."""
        return {
            'total': 0,
            'avg_gap_days': 0,
            'days_since_last': 'N/A',
            'entries_per_week': 0,
            'entries_per_month': 0,
            'longest_with': 0,
            'longest_without': 0,
            'avg_satisfaction': 'N/A',
            'most_common_time': 'N/A',
            'current_month_count': 0,
            'list': []
        }

    @staticmethod
    def _calculate_longest_streak(unique_dates):
        """Calculate longest streak of consecutive days."""
        if not unique_dates:
            return 0
            
        longest = 1
        current = 1
        for i in range(1, len(unique_dates)):
            if (unique_dates[i] - unique_dates[i-1]).days == 1:
                current += 1
                longest = max(longest, current)
            else:
                current = 1
        return longest

    @staticmethod
    def _calculate_longest_gap(unique_dates):
        """Calculate longest gap between entries."""
        if not unique_dates:
            return 0
            
        min_date = min(unique_dates)
        max_date = datetime.now().date()
        all_dates = {min_date + timedelta(days=x) for x in range((max_date - min_date).days + 1)}
        unique_dates_set = set(unique_dates)
        
        max_gap = 0
        current_gap = 0
        for date in sorted(all_dates):
            if date not in unique_dates_set:
                current_gap += 1
                max_gap = max(max_gap, current_gap)
            else:
                current_gap = 0
                
        return max_gap