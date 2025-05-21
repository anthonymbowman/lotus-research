from decimal import Decimal

from lotus.core import LotusState, apply_action


def make_action(action: str, tick: int, amount: int):
    return {"action": action, "tick": tick, "amount": amount}


# generate simple deterministic tests
def test_sequence():
    state = LotusState()
    actions = [make_action("supply", i % state.ticks, 100) for i in range(10)]
    for act in actions:
        state = apply_action(state, act)

    assert sum(state.supply) == Decimal(1000)


def test_30_cases():
    state = LotusState()
    for i in range(30):
        state = apply_action(state, make_action("supply", i % state.ticks, i))
    assert len(state.supply) == state.ticks
