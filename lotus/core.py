from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, getcontext
from typing import Dict, List, Optional

# Use high precision for rates
getcontext().prec = 28

Tick = int

@dataclass
class LotusState:
    """Represents the state of the Lotus IRM."""

    ticks: int = 101
    supply: List[Decimal] = field(default_factory=lambda: [Decimal(0)] * 101)
    borrow: List[Decimal] = field(default_factory=lambda: [Decimal(0)] * 101)
    target_rate: List[Decimal] = field(
        default_factory=lambda: [Decimal("0.001")] * 101
    )
    last_time: int = 0


def apply_action(state: LotusState, action: Dict[str, Decimal | int]) -> LotusState:
    """Apply an action and return updated state."""

    new_state = LotusState(
        ticks=state.ticks,
        supply=list(state.supply),
        borrow=list(state.borrow),
        target_rate=list(state.target_rate),
        last_time=action.get("t", state.last_time),
    )

    tick: Tick = int(action["tick"]) if "tick" in action else 0
    amount: Decimal = Decimal(action.get("amount", 0))
    act = action.get("action")

    if act == "supply":
        new_state.supply[tick] += amount
    elif act == "borrow":
        new_state.borrow[tick] += amount
    elif act == "repay":
        new_state.borrow[tick] = max(Decimal(0), new_state.borrow[tick] - amount)
    elif act == "withdraw":
        new_state.supply[tick] = max(Decimal(0), new_state.supply[tick] - amount)
    else:
        raise ValueError(f"unknown action {act}")

    assert_invariants(new_state)
    return new_state


def assert_invariants(state: LotusState) -> None:
    """Check IRM invariants."""

    for s, b in zip(state.supply, state.borrow):
        assert s >= 0
        assert b >= 0

    # additional invariants from specification would be added here

