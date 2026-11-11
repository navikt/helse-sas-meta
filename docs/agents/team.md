# Team: `team.json`

`docs/agents/team.json` lists the people who work in sas-meta and the app repos underneath it. It is the first lookup for anyone a skill needs to name: participants in a grilling session, ADR authors, spec and ticket participants, and commit co-authors.

Each person has:

- **`navn`**: full name, as written in ADRs, specs and `Co-authored-by` trailers.
- **`github`**: GitHub username, or `null` when unknown.
- **`epost`**: the email to use in `Co-authored-by`. A GitHub noreply address is preferred when the person has one, since GitHub always links it to the account.

Add people who aren't in the file (for example a jurist or a fagspesialist who never commits) when the user names them, after confirming name, GitHub username and email with the user. Never construct an email or a username from a name. Keep the list sorted by `navn`.
