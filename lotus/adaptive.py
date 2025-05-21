from __future__ import annotations

from decimal import Decimal, getcontext
from math import exp

getcontext().prec = 28

KAPPA_P = Decimal('50') / Decimal('31536000')  # approx seconds per year
TARGET_UTIL = Decimal('0.9')
R_MIN = Decimal('0.001')
R_MAX = Decimal('2.0')


def adapt_rate(
    current_rate: Decimal,
    util: Decimal,
    delta_t: Decimal,
) -> Decimal:
    """Adjust target rate toward utilisation."""
    if util > TARGET_UTIL:
        e = (util - TARGET_UTIL) / (Decimal(1) - TARGET_UTIL)
    else:
        e = (util - TARGET_UTIL) / TARGET_UTIL
    speed = Decimal(exp(float(KAPPA_P * e * delta_t)))
    new_rate = current_rate * speed
    return max(R_MIN, min(R_MAX, new_rate))
