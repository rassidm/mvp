# Issue tracker

Issues for this repo are tracked in **GitHub Issues** using the `gh` CLI.

## Creating issues

Use `gh issue create` with appropriate flags:

```bash
gh issue create --title "Title" --body "Description"
```

## Listing issues

```bash
gh issue list --limit 50
```

## Viewing an issue

```bash
gh issue view <issue-number>
```

## PRs as a request surface

**Disabled by default.** External pull requests are NOT automatically added to the triage queue. 

If you want to treat incoming PRs as feature requests or bug reports that enter triage, flip this flag to `true` and the `triage` skill will include them.

```yaml
prs_as_request_surface: false
```
