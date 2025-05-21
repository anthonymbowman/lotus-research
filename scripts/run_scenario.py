import json
import sys
from pathlib import Path

from lotus.core import LotusState, apply_action
from lotus.scenarios import run_scenario


def main(path: str) -> None:
    actions = json.loads(Path(path).read_text())
    states = run_scenario(LotusState(), actions)
    for i, s in enumerate(states):
        print(i, sum(s.supply), sum(s.borrow))


if __name__ == "__main__":
    main(sys.argv[1])
