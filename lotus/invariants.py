from __future__ import annotations

from decimal import Decimal

from .core import LotusState

EPS = Decimal('1e-18')
R_MIN = Decimal('0.001')
R_MAX = Decimal('2.0')


def assert_invariants(state: LotusState) -> None:
    for s, b in zip(state.supply, state.borrow):
        assert s >= 0
        assert b >= 0

    for i in range(state.ticks - 1):
        assert state.target_rate[i] + EPS <= state.target_rate[i + 1]
        assert R_MIN <= state.target_rate[i] <= R_MAX
