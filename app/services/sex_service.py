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
            longest_with, longest_with_period = cls._calculate_longest_streak_with_dates(unique_dates)
            longest_without, longest_without_period = cls._calculate_longest_gap_with_dates(unique_dates)

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

            # Additional context data for notifications
            today = datetime.now().date()
            entries_today = sum(1 for d in dates if d == today)
            todays_orgasms = 0  # Placeholder - orgasm_rating field not implemented
            
            # Calculate streak statistics
            current_streak = cls._calculate_current_streak(unique_dates)
            weekly_consistency = cls._calculate_weekly_consistency(dates)
            
            return {
                'total': total,
                'avg_gap_days': round(avg_gap_days, 2),
                'days_since_last': days_since_last,
                'last_entry_date': latest_date,
                'entries_per_week': round(entries_per_week, 2),
                'entries_per_month': round(entries_per_month, 2),
                'longest_with': longest_with,
                'longest_with_period': longest_with_period,
                'longest_without': longest_without,
                'longest_without_period': longest_without_period,
                'avg_satisfaction': round(avg_satisfaction, 2) if avg_satisfaction is not None else 'N/A',
                'most_common_time': most_common_time,
                'current_month_count': current_month_count,
                # New context data for notifications
                'entries_today': entries_today,
                'todays_orgasms': todays_orgasms,
                'current_streak': current_streak,
                'weekly_consistency': weekly_consistency,
                'monthly_total': current_month_count,
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
            'longest_with_period': None,
            'longest_without': 0,
            'longest_without_period': None,
            'avg_satisfaction': 'N/A',
            'most_common_time': 'N/A',
            'current_month_count': 0,
            'list': []
        }

    @staticmethod
    def _calculate_longest_streak_with_dates(unique_dates):
        """Calculate longest streak of consecutive days with date range."""
        if not unique_dates:
            return 0, None
            
        longest = 1
        current = 1
        longest_start = unique_dates[0]
        longest_end = unique_dates[0]
        current_start = unique_dates[0]
        
        for i in range(1, len(unique_dates)):
            if (unique_dates[i] - unique_dates[i-1]).days == 1:
                current += 1
                if current > longest:
                    longest = current
                    longest_start = current_start
                    longest_end = unique_dates[i]
            else:
                current = 1
                current_start = unique_dates[i]
        
        if longest > 1:
            period = f"{longest_start.strftime('%b %Y')}"
            if longest_start.year != longest_end.year or longest_start.month != longest_end.month:
                period += f" - {longest_end.strftime('%b %Y')}"
            return longest, period
        
        return longest, None

    @staticmethod
    def _calculate_longest_gap_with_dates(unique_dates):
        """Calculate longest gap between entries with date range."""
        if not unique_dates:
            return 0, None
            
        min_date = min(unique_dates)
        max_date = datetime.now().date()
        all_dates = sorted([min_date + timedelta(days=x) for x in range((max_date - min_date).days + 1)])
        unique_dates_set = set(unique_dates)
        
        max_gap = 0
        current_gap = 0
        gap_start = None
        gap_end = None
        current_gap_start = None
        
        for date in all_dates:
            if date not in unique_dates_set:
                if current_gap == 0:
                    current_gap_start = date
                current_gap += 1
                if current_gap > max_gap:
                    max_gap = current_gap
                    gap_start = current_gap_start
                    gap_end = date
            else:
                current_gap = 0
                
        if max_gap > 1 and gap_start and gap_end:
            period = f"{gap_start.strftime('%b %Y')}"
            if gap_start.year != gap_end.year or gap_start.month != gap_end.month:
                period += f" - {gap_end.strftime('%b %Y')}"
            return max_gap, period
        
        return max_gap, None

    @staticmethod
    def _calculate_current_streak(unique_dates):
        """Calculate current consecutive streak from most recent date backwards."""
        if not unique_dates:
            return 0
        
        today = datetime.now().date()
        unique_dates = sorted(unique_dates, reverse=True)  # Most recent first
        
        # Check if there's an entry today or yesterday
        most_recent = unique_dates[0]
        days_gap = (today - most_recent).days
        
        if days_gap > 1:  # More than 1 day gap, no current streak
            return 0
        
        # Count consecutive days backwards
        streak = 1
        expected_date = most_recent - timedelta(days=1)
        
        for i in range(1, len(unique_dates)):
            if unique_dates[i] == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
        
        return streak

    @staticmethod 
    def _calculate_weekly_consistency(dates):
        """Calculate how many days this week had entries."""
        if not dates:
            return 0
        
        today = datetime.now().date()
        # Get Monday of this week
        monday = today - timedelta(days=today.weekday())
        week_dates = [monday + timedelta(days=i) for i in range(7)]
        
        # Count unique days this week with entries
        week_entries = set()
        for date in dates:
            if date in week_dates:
                week_entries.add(date)
        
        return len(week_entries)

    @classmethod
    def get_monthly_entry_counts(cls):
        """Get monthly sex entry counts for the last 12 months."""
        try:
            entries = Sex.query.all()
            if not entries:
                return []

            # Group entries by month
            monthly_counts = {}
            for entry in entries:
                entry_date = datetime.fromisoformat(entry.datetime_iso.replace('Z', '+00:00')).date()
                month_key = entry_date.strftime('%Y-%m')
                monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1

            # Generate last 12 months (including current month even if 0)
            result = []
            today = datetime.now()
            
            for i in range(11, -1, -1):  # Last 12 months, most recent first
                month_date = today - timedelta(days=30*i)
                month_key = month_date.strftime('%Y-%m')
                count = monthly_counts.get(month_key, 0)
                
                result.append({
                    'month': month_date.strftime('%b %Y'),
                    'count': count,
                    'month_key': month_key
                })
            
            return result
        except Exception as e:
            print(f"Error getting monthly sex entry counts: {e}")
            return []

    @classmethod
    def get_time_distribution(cls):
        """Get sex entry distribution by time of day."""
        try:
            entries = Sex.query.all()
            if not entries:
                return {
                    'morning': 0,    # 6:00-11:59
                    'afternoon': 0,  # 12:00-17:59
                    'evening': 0,    # 18:00-21:59
                    'night': 0,      # 22:00-5:59
                    'missing': 0     # 00:00 or null
                }

            distribution = {
                'morning': 0,
                'afternoon': 0,
                'evening': 0,
                'night': 0,
                'missing': 0
            }

            for entry in entries:
                time_str = entry.time_of_day
                if not time_str or time_str == '00:00':
                    distribution['missing'] += 1
                    continue

                try:
                    # Parse time (assuming HH:MM format)
                    hour = int(time_str.split(':')[0])
                    
                    if 6 <= hour <= 11:
                        distribution['morning'] += 1
                    elif 12 <= hour <= 17:
                        distribution['afternoon'] += 1
                    elif 18 <= hour <= 21:
                        distribution['evening'] += 1
                    else:  # 22-23 and 00-5
                        distribution['night'] += 1
                except (ValueError, IndexError):
                    distribution['missing'] += 1

            return distribution
        except Exception as e:
            print(f"Error getting time distribution: {e}")
            return {
                'morning': 0,
                'afternoon': 0,
                'evening': 0,
                'night': 0,
                'missing': 0
            }