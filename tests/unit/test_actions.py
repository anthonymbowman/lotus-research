from decimal import Decimal

import pytest

from lotus.core import LotusState, apply_action


def make_action(action: str, tick: int, amount: int):
    return {"action": action, "tick": tick, "amount": amount}


def run_sequence(n: int) -> LotusState:
    state = LotusState()
    for i in range(n):
        state = apply_action(state, make_action("supply", i % state.ticks, i))
    return state


# Generate 30 deterministic tests using parametrization
@pytest.mark.parametrize("n", range(1, 31))
def test_sequences(n):
    state = run_sequence(n)
    assert sum(state.supply) == sum(range(n))
