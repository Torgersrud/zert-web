# Spec: Simulated zert-cli Terminal Demo

**Status:** Draft
**Repo:** https://github.com/Torgersrud/zert-cli
**Summary:** An in-browser, fully simulated terminal that lets visitors try the zert-cli workflow (launch a temporary VM hosted in Norway, enter it, tear it down) without installing anything and without creating real infrastructure.

---

## 1. Goals

- Let a visitor experience the core zert-cli workflow in under 60 seconds.
- Make the demo feel like a real terminal: prompt, cursor, history, colors, realistic timing.
- Carry no risk and no cost: no backend, no real VMs, no credentials.
- Clearly signal that the demo is simulated and link to the real tool.

## 2. Non-Goals

- Running the real zert-cli binary (no WASM build, no server-side execution).
- Creating, tunneling to, or managing real VMs.
- User accounts, login, or persistence across sessions.
- Full POSIX shell emulation. Only a small, curated command set is supported.

## 3. Target Users

- Developers evaluating zert-cli who want a quick feel for it before installing.
- Visitors to a landing page or portfolio who want a hands-on demo.

## 4. User Flow

1. Page loads; the terminal renders with a welcome banner and a hint (`Type "help" to get started`).
2. Visitor types `help` and sees the available commands.
3. Visitor runs the launch command (e.g. `zert vm`). A provisioning sequence plays with realistic delays.
4. The prompt changes to indicate the visitor is "inside" the VM (e.g. `user@zert-vm-a1b2:~$`).
5. Visitor explores with a few fake shell commands (`ls`, `whoami`, `uname -a`, `cat`, etc.).
6. Visitor runs `exit` to leave the VM; zert reports the VM was destroyed.
7. A call-to-action is shown linking to the GitHub repo and install instructions.

## 5. Functional Requirements

### 5.1 Terminal behavior

| ID | Requirement |
|----|-------------|
| T1 | Render a terminal with a blinking cursor and monospace font. |
| T2 | Support typing, backspace, and Enter. |
| T3 | Support left/right arrow cursor movement within the current line. |
| T4 | Support command history via up/down arrows. |
| T5 | Support `Ctrl+C` (cancel current input or running animation) and `Ctrl+L` (clear screen). |
| T6 | Support Tab completion for command names. |
| T7 | Support pasting text. |
| T8 | Unknown commands print `command not found: <cmd>` with a hint to run `help`. |

### 5.2 Host-mode commands (outside the VM)

> **Note:** Command names and flags below are placeholders. Replace them with the real zert-cli commands before implementation.

| Command | Behavior |
|---------|----------|
| `help` | List available commands with one-line descriptions. |
| `zert --version` | Print a plausible version string. |
| `zert login` | Simulated login: fake device/auth flow that succeeds after a short delay. |
| `zert vm` | Simulated VM provisioning (see 5.4). Enters VM mode on success. |
| `zert list` | List active simulated VMs (empty, or the current one). |
| `zert kill [id]` | Destroy a simulated VM. |
| `zert kill all` | Destroy all simulated VM. |
| `clear` | Clear the screen. |
| `about` | Short description of zert-cli with a link to the repo. |

### 5.3 VM-mode commands (inside the simulated VM)

| Command | Behavior |
|---------|----------|
| `ls`, `pwd`, `cd` | Operate on a small fake in-memory filesystem. |
| `cat <file>` | Print fake file contents (e.g. a `README` explaining the demo). |
| `whoami`, `hostname` | Return the fake user and VM hostname. |
| `uname -a` | Return a plausible Linux kernel string. |
| `uptime` | Return time since the simulated VM started. |
| `echo <text>` | Print text. |
| `exit` | Leave the VM, trigger teardown output, return to host mode. |

Any other command prints `bash: <cmd>: command not found`.

### 5.4 Provisioning simulation

`zert vm` should print staged output with delays, for example:

```
Authenticating...                         done
Requesting VM in Norway (region: no-osl)  done
Allocating resources                      done
Establishing secure tunnel                done
VM ready: zert-vm-a1b2 (expires in 30m)
Connecting...
```

Requirements:
- Each stage appears with a randomized delay of 300-900 ms.
- A simple spinner or progress indicator runs while a stage is pending.
- VM ID is randomly generated per session (e.g. `zert-vm-` + 4 hex chars).
- A fake expiry countdown is shown at launch and reported by `uptime`/`zert list`. It does not actually terminate the session (optional: show a notice when it "expires").

### 5.5 Teardown simulation

`exit` or `zert down` prints:

```
Closing tunnel...      done
Destroying VM          done
Session ended. VM zert-vm-a1b2 has been removed.
```

## 6. Content and Copy

- **Heading:** Try zert-cli
- **Subtext:** A simulated session of zert-cli. No real VMs are created. Type `help` to get started.
- **Post-session CTA:** "Ready for the real thing? Install zert-cli from GitHub." (link to repo)
- Banner and error text should be short and friendly; avoid jargon.

## 7. Technical Design

### 7.1 Stack

- **Terminal rendering:** [xterm.js](https://xtermjs.org/) (pinned version, loaded from a CDN or bundled).
- **Logic:** Vanilla JavaScript or TypeScript; no framework required.
- **Hosting:** Static files only. No backend.

### 7.2 Architecture

```
index.html
 |- xterm.js (rendering + key input)
 |- demo.js
     |- InputHandler    line buffer, cursor, history, tab completion
     |- CommandRouter   maps input to handlers based on current mode
     |- Mode            "host" | "vm"
     |- SessionState    loggedIn, vmId, startedAt, cwd
     |- FakeFS          in-memory directory tree for VM mode
     |- Scripts         provisioning/teardown stage definitions
```

### 7.3 Session state

```js
{
  mode: "host",          // "host" | "vm"
  loggedIn: false,
  vmId: null,
  startedAt: null,
  cwd: "/home/user",
  history: []
}
```

State is held in memory only and resets on page reload.

### 7.4 Command handler contract

Each command is a handler `(args, ctx) => Promise<void>` that writes to the terminal through `ctx.write()` / `ctx.writeln()`. Long-running handlers must respect an abort signal so `Ctrl+C` can cancel them.

## 8. UI and Design

- Dark theme by default; respect `prefers-color-scheme` if a light theme is provided.
- Window chrome (optional): three-dot title bar and a title such as `zert - demo`.
- Prompts:
  - Host mode: `$ `
  - VM mode: `user@<vmId>:<cwd>$ `
- Color use: green for success, yellow for in-progress, red for errors, dim gray for hints.
- Font: system monospace stack with a fallback (e.g. `"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace`).
- Responsive: terminal fills container width; minimum usable width 320 px; font size adjusts on small screens.

## 9. Accessibility

- Terminal container has an accessible label (`aria-label="Simulated zert-cli terminal"`).
- Enable xterm.js screen reader mode where feasible.
- Provide a visible "Skip demo" link or a text alternative describing the workflow.
- Ensure sufficient color contrast for all text.
- Do not rely on color alone to convey success or failure (include text such as `done` / `error`).
- Respect `prefers-reduced-motion` by shortening or removing animation delays and spinners.

## 10. Mobile Considerations

- On touch devices, tapping the terminal should focus a hidden input to bring up the keyboard.
- Provide quick-action buttons below the terminal (e.g. `help`, `zert vm`, `exit`) since typing is slower on mobile.
- Verify that the on-screen keyboard does not obscure the prompt.

## 11. Performance

- Total page weight for the demo (excluding site chrome) under 300 KB gzipped.
- Time to interactive under 1.5 s on a typical broadband connection.
- No network requests after initial load.

## 12. Security and Privacy

- No backend, no cookies, no analytics beyond what the host site already uses.
- Never evaluate user input as code (`eval`, `Function`, `innerHTML` with user text). All output goes through `term.write`.
- The demo must never prompt for or accept real credentials. `zert login` is a pure simulation and should say so.
- Pin third-party script versions and use Subresource Integrity (SRI) hashes when loading from a CDN.

## 13. Analytics (Optional)

If the host site already uses analytics, track these events only:
- Demo started (first keypress)
- `zert vm` completed
- Session completed (`exit`)
- Repo CTA clicked

## 14. Testing and Acceptance Criteria

**Acceptance criteria**
- [ ] A new visitor can complete the full flow (`help` > launch VM > run a command inside > `exit`) without instructions.
- [ ] Typing, backspace, history, Tab completion, `Ctrl+C`, and `Ctrl+L` behave as specified.
- [ ] Unknown commands in both modes produce the specified error messages.
- [ ] `Ctrl+C` cleanly cancels provisioning and returns to the host prompt.
- [ ] The simulation is clearly labeled as such on the page.
- [ ] Works in current Chrome, Firefox, Safari, and Edge, plus iOS Safari and Android Chrome.
- [ ] Passes an automated accessibility scan with no critical issues.

**Test approach**
- Unit tests for the command router, FakeFS, and input handler (line editing, history).
- Manual cross-browser and mobile pass.
- Manual keyboard-only and screen-reader pass.

## 15. Milestones

| Milestone | Scope |
|-----------|-------|
| M1 | xterm.js setup, input handling, `help`, `clear`, unknown-command handling. |
| M2 | Host-mode commands, provisioning and teardown simulation. |
| M3 | VM mode with fake filesystem and shell commands. |
| M4 | Copy, styling, mobile quick-actions, accessibility pass. |
| M5 | Cross-browser testing, performance check, launch. |

## 16. Open Questions

1. What are the real zert-cli command names, flags, and output formats the simulation should mirror?
2. What regions, VM specs, and expiry times should the fake output show?
3. Should the simulated VM expire automatically after the countdown, or stay open until `exit`?
4. Light theme, dark theme only, or match the host site?
5. Is a future "launch a real session" upgrade planned (hybrid model)? If so, keep the command router modular so a real backend can be swapped in behind the same interface.
