---
name: nais-apply-migrering
description: Migrate a navikt/helse (tbd) repository from Handlebars-templated Nais manifests (VARS files, nais/deploy, the deploy.yml reusable workflow) to the new Nais deploy standard. The result is plain manifests in .nais/ with per-environment mixins, deployed with nais/setup and nais apply through the deploy-v2.yml reusable workflow from sykepenger-github-workflows. Trigger on requests like "oppgrader til nais apply", "bytt templating med mixins", "ta i bruk deploy-v2", "flytt manifestene til .nais", or "migrer bort fra VARS-filer".
license: MIT
compatibility: navikt/helse (team tbd) repositories deployed on Nais that are already converted with the sas-standardisering skill but still use deploy.yml (sas-standardisering now includes this migration for unconverted repos)
metadata:
  domain: deploy
  tags: nais nais-apply mixins handlebars github-actions deploy-v2 tbd
---

# Nais apply migration skill

Converts Handlebars-templated Nais manifests into plain base manifests plus environment mixins in
`.nais/`, and switches the deploy jobs from `deploy.yml` to `deploy-v2.yml`.

The goal is that **every resource renders to exactly what it renders to today**, in every
environment. Treat any difference in the rendered output as a bug until the user has approved it.

## Authoritative references

Read these when in doubt. They change over time, and the code beats the docs.

| Reference | What it tells you |
| --- | --- |
| [Nais log 2026-09-21](https://nais.io/log/#2026-09-21-nye-mater-a-sette-opp-og-deploye-applikasjoner-i-nais) | The announcement of `nais/setup`, `nais apply` and mixins. |
| [Environment mixins](https://docs.nais.io/build/explanations/environment-mixins/) | Merge rules and the list concatenation gotcha. |
| [Deploy pipeline](https://docs.nais.io/build/how-to/deploy-pipeline/) | Recommended `.nais/` layout and file naming. |
| `nais/cli`: `internal/apply/render.go`, `merge.go`, `apply.go` | Exact mixin loading, merge and `--set` semantics. |
| `nais/api`: `internal/apply/whitelist.go` | The resource kinds `nais apply` accepts. |
| `navikt/sykepenger-github-workflows`: `.github/workflows/deploy-v2.yml` | Inputs and behavior of the reusable workflow. |

If the user has a local clone of `navikt/helse-sas-meta`, the workflows live in
`github-workflows/`. Otherwise fetch them with `gh`.

## How `nais apply` and mixins behave

These rules come from the `nais/cli` source. Every design decision below follows from them.

- **Mixin lookup.** For a base file `.nais/<navn>.yaml` and `--environment <env>`, the CLI
  auto-loads `.nais/<navn>.<env>.yaml` if it exists. Environment names are Nais environment
  names: `dev-gcp`, `prod-gcp`, `dev-fss`, `prod-fss`.
- **Merge.** Maps merge recursively key by key. Scalars in the mixin replace the base value.
  **Lists are concatenated: base items first, then mixin items.** A mixin never replaces or
  removes a list item.
- **Single document.** When a mixin is loaded or `--set` is used, the base and the mixin must
  each contain exactly one YAML document. Without a mixin and without `--set`, multi-document
  files are applied as they are.
- **`deploy-v2.yml` passes `--set spec.image=<image>` to `manifest` only when `image` is set.**
  With `image`, `manifest` must be a single-document `Application` or `Naisjob`. Without `image`,
  `manifest` can be any allowed kind, for example a `Topic`. It can also hold several documents,
  as long as it has no mixin. `extra_manifests` are applied first, one by one, without `--set`,
  and also get their mixins auto-loaded.
- **Workload without `image`.** The CLI looks up the image that is running now and keeps it. If
  the workload does not exist yet, it is applied without an image and will not start.
- **Image.** `spec.image` set by `--set` wins over the old companion `Image` resource, which
  `nais/deploy` created from `WORKLOAD_IMAGE`. Naiserator prefers `spec.image` when it is set, so
  the leftover `Image` resource does no harm. Extra manifests do **not** get the image. A second
  workload in `extra_manifests` keeps running its old image.
- **No templating.** Nothing is rendered. `{{ ... }}` is sent literally. This has three
  consequences:
  - Every Handlebars expression must be resolved into literal YAML.
  - `\{{` was the Handlebars escape for a literal `{{`, for example in Prometheus or
    Alertmanager templates such as `\{{ $labels.app }}`. It must become `{{`.
  - `{{ x }}` HTML-escaped its value (`&` became `&amp;`). Only `{{{ x }}}` did not. A value that
    was escaped before will change when it is inlined. Report it to the user (see Phase 4).
- **Allowed kinds.** The Nais API only applies whitelisted `apiVersion`/`kind` pairs, listed in
  `nais/api/internal/apply/whitelist.go`. Examples are `Application`, `Naisjob`, `Topic`,
  `AivenApplication`, `NetworkPolicy`, `Alerts`, `PrometheusRule`, `AlertmanagerConfig`,
  `ConfigMap` and `Valkey`/`OpenSearch`. Check every deployed kind against the list.
- **Namespace.** The API sets `metadata.namespace` to the team. Keep `metadata.namespace` and
  `metadata.labels.team` anyway, because `nais validate` requires them.

## Workflow

Work through the phases in order. Phases 1 to 3 are read-only. Do not edit anything until you
have asked the questions from Phase 4.

### Phase 1: Read the references

1. Read `deploy-v2.yml` and `deploy.yml` in `sykepenger-github-workflows`.
2. Resolve the newest release of `sykepenger-github-workflows`:

   ```bash
   tag=$(gh api repos/navikt/sykepenger-github-workflows/releases/latest --jq .tag_name)
   gh api "repos/navikt/sykepenger-github-workflows/commits/$tag" --jq .sha
   ```

   `deploy-v2.yml` first exists in `v1.0.2`, but `image` is required up to and including
   `v1.0.6`. If the repo pins an older version, move every
   `navikt/sykepenger-github-workflows/...@<sha> # vX.Y.Z` reference in the repo to the newest
   release, so the repo stays on a single version. If the repo is already on `v1.0.2` or newer,
   keep its pinned SHA, unless it needs a deploy without `image` and the pinned version still
   has `required: true` on `image`. Check `deploy-v2.yml` at the SHA you end up with.

### Phase 2: Survey the target repository

Make an inventory table and keep it for the report. For every deploy step in every workflow,
note:

| Workflow / job | Environment | `RESOURCE` files | `VARS` file / `VAR` inline vars | Image | Kinds in each file |
| --- | --- | --- | --- | --- | --- |

Also find:

- **Every templated or deployed manifest.** Look in `.nais/`, `deploy/`, `config/`, `nais/` and
  anywhere else `RESOURCE` points. `nais/deploy` rendered every file with Handlebars, also
  without a `VARS` file, so check all of them for `\{{`.
- **Per-environment full copies.** For example `deploy/dev.yml` + `deploy/prod.yml` describing
  the same workload. These are templates in disguise and become one base plus mixins.
- **One template, many workloads.** For example `config/nais.yml` rendered with
  `config/<app>/<env>.yml` for many apps, as in `spre` and `sparkelapper`. Mixins cannot vary the
  base per workload, so each workload needs its own base file.
- **Multi-document files.** Split them when they are the `manifest` input or need a mixin.
- **Workflows that deploy without an image.** For example Kafka topics, Aiven applications and
  alerts through `nais/deploy/actions/deploy` directly.
- **Every other reference to the manifest paths:** workflow `paths` filters, `README.md`, docs,
  scripts and `CODEOWNERS`.
- **Repos that are not standardized.** If deploys are hand-written `nais/deploy` steps rather
  than the `deploy.yml` reusable workflow, raise it in Phase 4. The user may want to run the
  `sas-standardisering` skill instead, which includes this migration.

### Phase 3: Render the baseline

Render what is deployed today, for every manifest in every environment, with the exact vars the
workflow uses. Store the output in a temporary directory **outside** the repository.

```bash
baseline=$(mktemp -d)
nais validate -vv --no-colors -f <vars-file> [--var key=value ...] <manifest> 2>/dev/null \
  | awk '/^\[.*\] Printing /{p=1;next} p && /^\[/{exit} p' \
  | yq -S -y 'select(. != null) | del(.spec.image)' > "$baseline/<navn>.<env>.yaml"
```

Use the inline `VAR` values from the workflow as `--var` flags. Drop `-f` if there is no vars
file. With mikefarah's Go `yq`, the normalization step is
`yq -P 'sort_keys(..) | del(.spec.image)'`.

Look through the rendered output for `&amp;`, `&lt;`, `&gt;`, `&#x27;` or `&quot;`. These come
from Handlebars HTML escaping.

### Phase 4: Ask before changing anything

Raise all of the following in one batch, and wait for answers before editing:

- **HTML-escaped values.** List every value where the rendered output contains an HTML entity.
  Ask whether to keep the escaped text, which is what runs today, or use the unescaped value,
  which is probably what was intended.
- **Shared template for many workloads.** Confirm that each workload gets its own base file, and
  that the common content is duplicated into each base.
- **Image-less resource deploys.** Ask whether to fold them into the matching app's
  `extra_manifests`, or to keep a separate workflow. A separate workflow calls `deploy-v2.yml`
  without `image`, with the resource as `manifest` (see Phase 7).
- **Kinds missing from the whitelist.** `nais apply` cannot deploy these at all. Stop and let the
  user decide.
- **Several workloads sharing one deploy job.** Each needs its own deploy-v2 job, since only
  `manifest` gets the image. Confirm the job split.
- **Anything else that does not map cleanly onto these instructions.**

### Phase 5: Design base and mixins

For each workload or resource, compare the rendered baselines of all environments it is deployed
to.

- **Base `.nais/<navn>.yaml`** holds only what is identical in **every** environment the file is
  deployed to. Do not put dev values in the base and override them in prod, even though the Nais
  docs suggest it. A mixin cannot override list items, and a forgotten scalar override silently
  ships dev config to prod.
- **Mixin `.nais/<navn>.<env>.yaml`** holds everything specific to that environment. Create one
  for each environment that differs from the base. Skip it if there is no difference.
- **Scalars and maps** that differ go into every mixin, never into the base.
- **Lists that differ between environments: think about the concatenation.**
  - Items are independent of each other and order does not matter: put the items common to all
    environments in the base, and put only each environment's additional items in its mixin.
    Examples are `ingresses`, `accessPolicy.inbound.rules`, `accessPolicy.outbound.rules`,
    `accessPolicy.outbound.external`, `envFrom` and `filesFrom`.
  - An item differs in any field between environments: that item goes in each mixin in full,
    never in the base. Examples are an `env` entry with a different `value` or a `sqlInstances`
    entry with a different `tier`. A base entry plus a mixin entry gives **two** entries with the
    same identity, such as duplicate env var names or a second SQL instance.
  - The list is a single structured unit, or its order matters: put the whole list in each mixin
    and leave it out of the base. Examples are `gcp.sqlInstances`, and the `databases`, `users`
    and `flags` lists inside one SQL instance entry.
- **`env` ordering.** Kubernetes only expands `$(VAR)` from variables defined **earlier** in the
  list. Mixin items always come after base items. A base entry must never reference a variable
  that only a mixin defines. Variables injected by Nais (`DATABASE_*`, `GCP_TEAM_PROJECT_ID`, …)
  are not affected.
- **Lists identical in all environments** stay in the base, untouched.
- **Resources that exist in only one environment** (for example `dev-db-policy.yaml`) stay as
  standalone files without mixins. Only that environment's deploy job lists them.
- **The same resource (kind + name) as separate files per environment** becomes one base plus
  mixins.

### Phase 6: Write the manifests

- Put all manifests in `.nais/`. Name each base after the workload or resource
  (`metadata.name`). Keep an existing `.nais/` base name such as `.nais/app.yaml`.
- Watch for name collisions. The CLI auto-loads any existing `<navn>.<env>.yaml` next to a base
  `<navn>.yaml` as a mixin.
- Move files with `mv`, not `git mv`, so nothing gets staged. Delete the old templates, vars
  files and per-environment copies, and remove directories left empty.
- Resolve every Handlebars construct into literal YAML: `{{x}}`, `{{{x}}}`, `{{#if}}`,
  `{{#each}}`, `{{else}}` and `\{{`. Remove `image: {{image}}` and any equivalent `spec.image`.
- **Keep the YAML types exactly as rendered today.** `value: "{{x}}"` rendered as a string, so
  inline it as `"3"`, `"on"` or `"true"`. An unquoted `{{x}}` may have rendered as a number or
  boolean. The diff in Phase 8 shows type changes.
- Carry over meaningful comments from the vars files. For example, keep group names next to
  inlined Entra ID UUIDs, and keep commented-out alternative configuration.
- Mixins contain only `spec`, or other top-level keys that differ. Leave out `apiVersion`, `kind`
  and `metadata` unless those differ.
- Split multi-document files when a document is a `manifest` input or needs a mixin.

### Phase 7: Workflows

Replace each `deploy.yml` job with a `deploy-v2.yml` job, **one job per workload per
environment**:

```yaml
  deploy-dev:
    name: Deploy til dev
    needs: bygg-image
    uses: navikt/sykepenger-github-workflows/.github/workflows/deploy-v2.yml@<sha> # vX.Y.Z
    with:
      manifest: .nais/<navn>.yaml
      environment: dev-gcp
      image: ${{ needs.bygg-image.outputs.image_ref }}
      extra_manifests: .nais/dev-db-policy.yaml
    permissions:
      contents: read
      id-token: write # for nais login
```

- Map the old inputs like this: `CLUSTER` becomes `environment`. The workload in `RESOURCE`
  becomes `manifest`. The other `RESOURCE` files become `extra_manifests`, comma-separated.
  `VARS` disappears. `WORKLOAD_IMAGE` becomes `image`.
- Leave out `extra_manifests` when there are none.
- Keep the job names, the `needs: bygg-image` wiring (dev and prod deploy in parallel) and the
  `permissions:` blocks.
- Update the `paths` filters. `'!<old-dir>/**'` becomes `'!.nais/**'`. Each workflow lists its
  base, its mixins and its extra manifests, for example `'.nais/<navn>.yaml'` and
  `'.nais/<navn>.*.yaml'`. Remove the patterns for the vars files.
- Image-less resources kept in a separate workflow, as agreed in Phase 4, also use
  `deploy-v2.yml`. Leave out `image` and `needs`, so dev and prod deploy in parallel. Use one job
  per environment. List other image-less files for the same environment in `extra_manifests`:

  ```yaml
    deploy-dev:
      name: Deploy til dev
      uses: navikt/sykepenger-github-workflows/.github/workflows/deploy-v2.yml@<sha> # vX.Y.Z
      with:
        manifest: .nais/<ressurs>.yaml
        environment: dev-gcp
      permissions:
        contents: read
        id-token: write # for nais login
  ```

  Never leave out `image` for a workload in a build-and-deploy workflow. It would keep running
  the old image.

- Do not add a separate "manifest-only" deploy workflow unless the user asks for one.
- Update the other references found in Phase 2: README, docs, scripts and `CODEOWNERS`.

### Phase 8: Verify

For every manifest and environment, render the new setup offline and diff it against the
baseline:

```bash
nais apply --dry-run --no-colors -t tbd -e <env> .nais/<navn>.yaml 2>/dev/null \
  | sed -n '/^---$/,$p' | grep -v -e ': would apply$' -e '^dry-run complete' \
  | yq -S -y 'select(. != null) | del(.spec.image)' > "$baseline/<navn>.<env>.new.yaml"
diff -u "$baseline/<navn>.<env>.yaml" "$baseline/<navn>.<env>.new.yaml"
```

`--dry-run` needs no login. It renders the base, the mixin and any `--set` exactly as the real
deploy does.

- The diff must be empty, with two exceptions. **List order changes** that come from
  concatenation must be checked one by one: they are harmless for access policies and ingresses,
  but not for `env` entries with `$(VAR)` references. **Changes the user approved** in Phase 4
  are also allowed.
- Also run `nais apply --dry-run` with `--set spec.image=dummy` on each `manifest` input that
  gets an `image`. This proves that it is a single document and that `--set` works.
- Validate each rendered result with `nais validate -vv <rendered-file>`. Skip validation for
  files that contain literal `{{`, such as alert templates, because `nais validate` would render
  them with Handlebars.
- Parse every changed workflow with `yq . <file> > /dev/null`. Check that every path in
  `manifest`, `extra_manifests` and `paths` exists.
- Search the repo for leftovers: `{{`, `\{{`, `VARS:`, `WORKLOAD_IMAGE`, `deploy.yml@`, and the
  old directory names.
- Delete the temporary baseline directory.

### Phase 9: Report

Leave all changes **unstaged**. Do not `git add` or `git commit`.

Summarize:

- The inventory from Phase 2, mapped to the new files and deploy-v2 jobs.
- Files added, moved and deleted.
- Lists split between base and mixins, and lists moved entirely into mixins.
- Every remaining diff against the baseline, and why it is acceptable.
- The `sykepenger-github-workflows` version bump, if any.
- Anything unresolved or needing a human decision.

## Boundaries

### ✅ Always

- Render the baseline before changing anything, and diff against it afterwards.
- Keep only content shared by all environments in the base.
- Give each workload its own deploy-v2 job per environment.
- Keep all `sykepenger-github-workflows` references in the repo on one pinned SHA with a
  `# vX.Y.Z` comment.

### ⚠️ Ask first

- Values that Handlebars HTML-escaped.
- Image-less resource deploys and kinds missing from the API whitelist.
- Splitting a shared template into one base per workload.
- Repos still on hand-written `nais/deploy` steps.

### 🚫 Never

- Override a list item through a mixin. It gets appended, not replaced.
- Put dev-only values in the base.
- Pass `image` to `deploy-v2.yml` together with a non-workload or multi-document `manifest`.
- Leave Handlebars syntax, `\{{` escapes or vars files behind.
- Stage or commit the changes.
