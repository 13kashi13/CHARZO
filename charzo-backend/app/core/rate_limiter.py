from slowapi import Limiter
from slowapi.util import get_remote_address

# Key function — use IP for unauthenticated, user ID for authenticated
limiter = Limiter(key_func=get_remote_address, default_limits=[])
