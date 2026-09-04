# Triage labels

The `triage` skill uses these five canonical labels to manage issue state:

| Role | Label string |
|------|--------------|
| Needs triage | `needs-triage` |
| Needs info | `needs-info` |
| Ready for agent | `ready-for-agent` |
| Ready for human | `ready-for-human` |
| Won't fix | `wontfix` |

When an issue enters one of these states, the skill applies the corresponding label. These are the defaults and work out of the box with GitHub Issues.

## Customizing labels

If your repo already uses different label names, update the "Label string" column above. For example, if you use `status:triage` instead of `needs-triage`, change the row to:

| Role | Label string |
|------|--------------|
| Needs triage | `status:triage` |

The skill reads this file to know which strings to apply.
