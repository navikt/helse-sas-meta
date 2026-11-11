---
name: gitmoji-commit
description: "Write commit messages, create commits, or squash commits using this repository's Gitmoji standard. Resolve additional co-authors named by the user from docs/agents/team.json."
---

# Gitmoji commits

Use this standard instead of Conventional Commits.

Accept an optional list of contributing developers by name or handle, for example:
`/gitmoji-commit co-authors: Kari, Ola`. Naming someone declares their contribution;
`team.json` or Git history supplies their identity, not proof that they contributed to this change.

## Workflow

1. Establish the target repository and the requested action: draft a message,
   commit changes, or squash a specified range. Inspect status and the complete
   relevant diff. For a commit, inspect the staged diff; for a squash, inspect
   every commit and trailer in the range and the resulting combined diff.
   Keep unrelated working-tree and staged changes outside the commit.
2. Select the emoji and write the message using the rules below. A squash message
   describes the final result, not intermediate approaches that were discarded.
3. Resolve issue references and co-authors, then validate the subject length,
   issue references and trailers.
4. Perform only the requested Git action. Rewriting history or pushing requires
   explicit user authorization. After a squash, verify that the new commit has
   the original tip's tree and the intended parent. After any commit, inspect
   the stored message and status to confirm its scope and attribution.

## Message

```text
<emoji> <Capitalized summary>

Context and reasoning when useful.

Refs navikt/sas-issues#123

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

- Start with the actual Unicode emoji, followed by a space. Use the complete
  [Gitmoji catalog](https://gitmoji.dev/), not a restricted subset.
  The [official JSON catalog](https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json)
  supplies `emoji` and its meaning. Use `emoji`, not the `code` shortcode or an
  emoji name. The [source repository](https://github.com/carloscuesta/gitmoji)
  is the reference if the website is unavailable.
- Choose the emoji for the main purpose of the final change. For example,
  `✨ Add person lookup` is a feature, even if a squash also contains refactoring.
- Capitalize the first word after the emoji. Keep the entire subject at most
  **72 Unicode code points**, including emoji, variation selectors and spaces.
  Measure characters, not UTF-8 bytes.
- Follow the repository's language. Prefer an imperative summary without a final
  period. The format is `<emoji> <Summary>`, without a Conventional Commits prefix.
- A body is encouraged when it explains the problem, constraints, why an approach
  was chosen, or why an alternative was rejected. Describe the final decision;
  retain useful reasoning from squashed commits without obsolete warnings.
  Separate subject, body and trailer block with blank lines.

## Issue references

Link every commit that belongs to a GitHub issue, so GitHub shows the commit on
the issue. The issue is the one the user names, the spec or ticket being
implemented, or one named in the branch name or in commits being squashed.

- Write the reference as its own paragraph after the body and before the
  trailer block, one issue per line, for example `Refs navikt/sas-issues#123`.
- Use the full `owner/repo#number` form whenever the issue lives in another
  repository than the commit, as specs and tickets in `navikt/sas-issues` do.
  Use the short `#number` form only for an issue in the commit's own repository.
- Use `Refs` by default. Use a closing keyword (`Closes owner/repo#123`) only
  when the user states that the commit completes the issue; GitHub closes the
  issue when the commit reaches the default branch.
- During a squash, keep every issue reference from the range, deduplicated.
- Verify the issue number against the issue itself, for example with
  `gh issue view 123 --repo navikt/sas-issues`. Ask the user when the issue is
  ambiguous.

## Co-authors

- Include the Copilot trailer above for Copilot-assisted work unless the user
  explicitly requests otherwise.
- Add one `Co-authored-by: Name <email>` trailer per additional developer named by
  the user. Look them up in `docs/agents/team.json` at the root of sas-meta first
  (`navn`, `github`, `epost`; see `docs/agents/team.md`), and use its name and
  email as written. Fall back to the target repository's history, including
  existing co-author trailers, only for someone missing from the file; then
  offer to add them to `team.json`. Respect `.mailmap` when present.
  This command lists author identities and co-author trailers for lookup:

  ```shell
  git log --all --format='%aN <%aE>%n%(trailers:key=Co-authored-by,valueonly)'
  ```

- Match names or handles against `team.json`, or else that history. Prefer an
  unambiguous canonical identity supported by `.mailmap` or consistent recent
  history. If the identity
  is missing or ambiguous, ask the user before committing. Never construct an
  email from a handle or choose an arbitrary match. Merely appearing in history
  does not make someone a co-author of the current change.
- During a squash, preserve existing human co-author attribution from the range.
  If commits have different primary authors, preserve the other contributors as
  co-authors as well. Deduplicate trailers and omit the final primary author
  from the co-author list.
- Keep trailers at the end of the message. Verify them with
  `git log -1 --format=%B` and `git log -1 --format=%B | git interpret-trailers --parse`.
