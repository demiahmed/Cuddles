import re
from datetime import datetime

def parse_iso(dt_str):
    """Parse an ISO format datetime string to datetime object without timezone conversion."""
    try:
        if not dt_str:
            return None
            
        # Remove the timezone part completely to keep dates in local time
        dt_str = dt_str.split('.')[0]
        if 'Z' in dt_str:
            dt_str = dt_str.replace('Z', '')
        if '+' in dt_str:
            dt_str = dt_str.split('+')[0]
            
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError) as e:
        print(f"Failed to parse datetime: {dt_str}, Error: {str(e)}")
        return None

def remove_html_tags(text):
    """Remove HTML tags from a string."""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

def format_date(dt):
    """Format a datetime object to ISO format string."""
    return dt.isoformat() if dt else None