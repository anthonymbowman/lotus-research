from __future__ import annotations

from decimal import Decimal
from typing import List

TARGET_UTIL = Decimal('0.9')


def short_term_rate(util: Decimal, prev_rate: Decimal, next_rate: Decimal, prev_prev_rate: Decimal) -> Decimal:
    """Compute borrow rate based on utilisation and neighboring target rates."""
    if util > TARGET_UTIL:
        return (next_rate - prev_rate) * (util - TARGET_UTIL) / (Decimal(1) - TARGET_UTIL) + prev_rate
    return (prev_rate - prev_prev_rate) * (util - TARGET_UTIL) / TARGET_UTIL + prev_rate
