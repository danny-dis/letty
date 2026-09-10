---
name: interactive-testing
description: Test and debug letty's interactive mode in a controlled tmux terminal. Use for TUI behavior checks and interactive release smoke tests.
---

# Testing letty Interactive Mode with tmux

Run the TUI in a controlled terminal (from the repo root, two directories above this skill):

```bash
tmux new-session -d -s letty-test -x 80 -y 24
tmux send-keys -t letty-test "./letty-test.sh" Enter
sleep 3 && tmux capture-pane -t letty-test -p     # capture after startup
tmux send-keys -t letty-test "your prompt here" Enter
tmux send-keys -t letty-test Escape               # special keys (also C-o for ctrl+o, etc.)
tmux kill-session -t letty-test
```

For release smoke tests, start the tmux session with `-c /tmp` and replace `./letty-test.sh` with the absolute path to the release binary. Test both Node and Bun binaries separately, submit a prompt, and wait for the model reply; startup alone is not a passing smoke test.
