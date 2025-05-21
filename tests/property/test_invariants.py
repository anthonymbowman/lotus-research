from hypothesis import given, strategies as st
from lotus.core import LotusState, apply_action


action_strategy = st.fixed_dictionaries(
    {
        "action": st.sampled_from(["supply", "borrow", "repay", "withdraw"]),
        "tick": st.integers(min_value=0, max_value=100),
        "amount": st.integers(min_value=0, max_value=1000),
    }
)


@given(st.lists(action_strategy, min_size=1, max_size=50))
def test_no_negative(actions):
    state = LotusState()
    for act in actions:
        state = apply_action(state, act)

    assert all(s >= 0 for s in state.supply)
    assert all(b >= 0 for b in state.borrow)
