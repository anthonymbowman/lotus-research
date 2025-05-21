from __future__ import annotations

from decimal import Decimal
from typing import Dict, Iterable, List

from .core import LotusState, apply_action


def run_scenario(initial: LotusState, actions: Iterable[Dict]) -> List[LotusState]:
    states = [initial]
    state = initial
    for act in actions:
        state = apply_action(state, act)
        states.append(state)
    return states
