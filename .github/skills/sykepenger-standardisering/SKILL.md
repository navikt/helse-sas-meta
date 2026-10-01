---
name: sykepenger-standardisering
description: Convert a navikt/helse (tbd) Gradle project from an ad-hoc build and GitHub Actions setup to the standardized sykepenger setup — the four sykepenger-gradle-plugins (no.nav.sykepenger.root, .module, .kotlin, .deployable), standardized settings.gradle.kts, standard repo files, reusable workflows from sykepenger-github-workflows, and the new Nais deploy standard (plain manifests in .nais/ with per-environment mixins, deployed through deploy-v2.yml). Trigger on requests like "standardiser dette prosjektet", "konverter til sas-oppsettet", "ta i bruk sykepenger-gradle-plugins", "bytt ut Dockerfile med jib", or "rydd opp i workflowene".
license: MIT
compatibility: navikt/helse (team tbd) Kotlin/Gradle repositories deployed on Nais
metadata:
  domain: build-and-ci
  tags: gradle sykepenger-gradle-plugins github-actions nais nais-apply mixins deploy-v2 jib ktlint standardization tbd
---

# Sykepenger Standardization Skill

Converts a nonstandardized Gradle + GitHub Actions project into the standardized sykepenger setup,
including the Nais deploy standard: plain manifests in `.nais/` with per-environment mixins,
deployed with `nais apply` through `deploy-v2.yml`. The reference repos use this deploy standard,
so a standardized project always gets it in the same pass.

The Nais part reuses the rules in the `nais-apply-migrering` skill
(`.github/skills/nais-apply-migrering/SKILL.md`). Read its sections "How `nais apply` and mixins
behave", Phase 5 ("Design base and mixins") and Phase 6 ("Write the manifests") before you touch
any manifest. This skill says **when** to do each Nais step. That skill says **how**.

## Authoritative References

Never guess — read these when in doubt. They are the source of truth, and they change over time.

| Reference | Role |
| --- | --- |
| `navikt/sykepenger-gradle-plugins` | The four Gradle plugins. Read the plugin sources to know what they already provide. |
| `navikt/sykepenger-github-workflows` | The reusable workflows and their inputs. |
| `navikt/helse-sp-forsikring` | Authoritative example of a **multimodule** project. |
| `navikt/sparkel-norg` | Authoritative example of a **single-module** project. |
| `nais-apply-migrering` skill | Mixin semantics, base/mixin design, baseline rendering and diffing. |

If the user has a local clone of the `navikt/helse-sas-meta` meta repo, these live as sibling
directories in it (`gradle-plugins/`, `github-workflows/`, `sp-forsikring/`, `sparkel-norg/`)
and should be read from disk. Otherwise fetch them with `gh`.

## Workflow

Work through the phases in order. Phases 1–2 are read-only, apart from the baseline rendered to a
temporary directory outside the repository. Do not edit anything until you have completed the
survey and asked the questions it raises.

### Phase 1 — Read the references

1. Read all four plugin sources in `gradle-plugins/src/main/kotlin/`.
2. Read the reusable workflows in `github-workflows/.github/workflows/`, in particular
   `deploy-v2.yml`.
3. Read `sp-forsikring` or `sparkel-norg` in full, depending on the shape of the target project,
   including its `.nais/` directory.
4. Note the pinned SHA + version comment that the matching reference repo uses for
   `navikt/sykepenger-github-workflows/...@<sha> # vX.Y.Z`. **Copy that exact SHA and comment** into
   the workflows you generate. Do not invent a SHA and do not look up the latest release.
   This overrides Phase 1 of `nais-apply-migrering`. If the project needs a `deploy-v2.yml` job
   without `image` and `image` is still `required: true` at that SHA, raise it in Phase 3.
5. Read the `nais-apply-migrering` sections listed at the top of this skill.

### Phase 2 — Survey the target project

Determine and write down:

- **Shape**: single-module (no `include(...)` in `settings.gradle.kts`) or multimodule.
- **Module tree**: for each Gradle project, whether it has any `src/` sources or resources
  (including `src/test/**`), and whether it has child projects.
- **Deployables**: every image built today. Find them from the existing workflows — look for
  `nais/docker-build-push`, `docker build`, `jib`, Dockerfiles, and `IMAGE:`/`image:` wiring.
  Note the `image_suffix` input if `nais/docker-build-push` uses one.
- **Nais resources**: the inventory table from Phase 2 of `nais-apply-migrering`, with the
  `RESOURCE` files, `VARS` file / inline `VAR` values, image and kinds per deploy step and
  cluster. Include everything that skill's Phase 2 asks you to find: every manifest `nais/deploy`
  rendered (with or without `VARS`), per-environment full copies, one template shared by many
  workloads, multi-document files, image-less deploys, and every other reference to the
  manifest paths (README, docs, scripts, `CODEOWNERS`).
- **Nais baseline**: render what is deployed today for every manifest in every environment,
  exactly as described in Phase 3 of `nais-apply-migrering`, into a temporary directory outside
  the repository. Note every HTML entity (`&amp;`, `&lt;`, …) in the output.
- **Everything in the existing `build.gradle.kts` files** that is not just dependencies:
  custom tasks, test configuration, jar packaging, toolchain settings, plugins.
- **Existing workflows**, classified as: replaced by a standard workflow, superseded by the new
  setup, or unaccounted for.

### Phase 3 — Ask before changing anything

Confront the user about all of the following, in one batch, before editing:

- **Dockerfile discrepancies.** Compare each Dockerfile against what `no.nav.sykepenger.deployable` generates
  through jib (base image, `TZ`, `-XX:MaxRAMPercentage`, main class, anything else in the
  plugin's `jib { }` block).
  - A **JRE major version** difference is an expected upgrade — say nothing.
  - A **`MaxRAMPercentage`** difference is reported afterwards in the summary, but is not a blocker.
  - **Any other non-trivial difference** (extra `COPY`, extra `ENV`, custom `ENTRYPOINT`/`CMD`,
    exposed ports, added packages, non-default workdir) must be raised **before** you delete the
    Dockerfile, and you must wait for an answer.
- **Build logic not covered by the plugins.** For every custom construct found in Phase 2 that the
  sykepenger plugins do not already provide (e.g. JUnit parallelism system properties, custom source sets,
  shadow/fat-jar packaging, extra repositories, custom `check` wiring), ask the user whether to keep
  it or drop it. Do not decide on your own. Fat-jar/manifest blocks are superseded by jib, but still
  mention that you are removing them.
- **Image-less resource deploys.** If the project deploys nais resources that are not workloads
  (Kafka `Topic`, `AivenApplication`, db policies, …) via a separate workflow, ask the user whether
  to fold them into the corresponding app deploy job's `extra_manifests` (as `sp-forsikring` does
  with `.nais/dev-db-policy.yaml`) or keep a separate workflow that calls `deploy-v2.yml` without
  `image`.
- **Nais questions from Phase 4 of `nais-apply-migrering`**: HTML-escaped values, a shared
  template that must become one base per workload, kinds missing from the `nais apply`
  whitelist, and several workloads sharing one deploy job.
- **Anything else that does not map cleanly onto these instructions.** When in doubt, ask.

### Phase 4 — Gradle conversion

#### Plugin selection

| Project | Plugin |
| --- | --- |
| Multimodule root **without** sources/resources | `no.nav.sykepenger.root` |
| Multimodule root **with** sources/resources | `no.nav.sykepenger.kotlin` (not `no.nav.sykepenger.root`) |
| Intermediate aggregator ("subroot") with children but no sources/resources | `no.nav.sykepenger.module` |
| Module with sources or resources (incl. test-only) that becomes an image | `no.nav.sykepenger.deployable` |
| Module with sources or resources that does not become an image | `no.nav.sykepenger.kotlin` |
| Single-module project that becomes an image | `no.nav.sykepenger.deployable` |

`no.nav.sykepenger.deployable` implies `no.nav.sykepenger.kotlin` implies `no.nav.sykepenger.module`.
Never apply two of them to the same project.

#### Application style

**Multimodule** — root declares aliases, submodules use string ids:

```kotlin
// build.gradle.kts (root)
plugins {
    alias(libs.plugins.sykepenger.root)
    alias(libs.plugins.sykepenger.kotlin) apply false
    alias(libs.plugins.sykepenger.deployable) apply false
}

allprojects {
    group = "no.nav.helse.<eksisterende-group>"
}
```

```kotlin
// <modul>/build.gradle.kts
plugins {
    id("no.nav.sykepenger.kotlin")
}
```

Only declare `apply false` aliases for plugins that are actually used by submodules.

**Single-module** — alias directly:

```kotlin
group = "no.nav.helse.<eksisterende-group>"

plugins {
    alias(libs.plugins.sykepenger.deployable)
}

sykepengerDeployable {
    mainClass = "no.nav.helse.<...>.AppKt"
}

dependencies { /* ... */ }
```

#### `sykepengerDeployable` configuration

- `mainClass` is required — take it from the existing Dockerfile/jar manifest/`application` block.
- `imageName` defaults to `rootProject.name`. Derive the correct name from what the project builds
  **today**: if the existing workflow passed an `image_suffix` (or otherwise pushed a suffixed
  image), set `imageName = "${rootProject.name}-<suffix>"` as `opprydding-dev` does. Otherwise omit
  `imageName`.

#### Version catalog

`gradle/libs.versions.toml` is kept for the project's own dependencies. Remove only what the plugins
now provide: the Kotlin/ktlint/jib plugin versions, JUnit, the BOMs listed in `no.nav.sykepenger.kotlin`, and
toolchain settings. Add:

```toml
[versions]
sykepengerGradlePlugins = "<version from the reference repo>"

[plugins]
sykepenger-deployable = { id = "no.nav.sykepenger.deployable", version.ref = "sykepengerGradlePlugins" }
sykepenger-kotlin = { id = "no.nav.sykepenger.kotlin", version.ref = "sykepengerGradlePlugins" }
sykepenger-root = { id = "no.nav.sykepenger.root", version.ref = "sykepengerGradlePlugins" }
```

If the project inlines its dependency coordinates in `build.gradle.kts` (as sporbar does), move them
into the catalog. Only declare the plugin aliases the project actually uses.

Also remove from the build files anything now supplied by the plugins: `kotlin("jvm")`,
`jvmToolchain`, ktlint setup, `useJUnitPlatform()`, JUnit dependencies, the ktor/jackson/netty BOMs
that `no.nav.sykepenger.kotlin` already applies, and jib/Docker packaging.

#### `settings.gradle.kts`

Exact layout — `rootProject.name` first, `include(...)` next (multimodule only), then the two
management blocks verbatim, in this order:

```kotlin
rootProject.name = "<uendret>"
include(
    "<modul>",
)

// Sett opp repositories basert på om vi kjører i CI eller ikke
// Jf. https://github.com/navikt/utvikling/blob/3eed71e1b493a6a81762c32f2d30521a1a3ccab4/docs/teknisk/Konsumere%20biblioteker%20fra%20Github%20Package%20Registry.md
pluginManagement {
    repositories {
        if (providers.environmentVariable("GITHUB_ACTIONS").orNull == "true" && providers.environmentVariable("AI_AGENT").orNull == null) {
            maven("https://maven.pkg.github.com/navikt/maven-release") {
                credentials {
                    username = "token"
                    password = providers.environmentVariable("GITHUB_TOKEN").orNull!!
                }
            }
        } else {
            maven("https://github-package-registry-mirror.gc.nav.no/cached/maven-release/")
        }
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    // Bare tillat repositories-oppsett her i settings.gradle.kts
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)

    repositories {
        if (providers.environmentVariable("GITHUB_ACTIONS").orNull == "true" && providers.environmentVariable("AI_AGENT").orNull == null) {
            maven("https://maven.pkg.github.com/navikt/maven-release") {
                credentials {
                    username = "token"
                    password = providers.environmentVariable("GITHUB_TOKEN").orNull!!
                }
            }
        } else {
            maven("https://github-package-registry-mirror.gc.nav.no/cached/maven-release/")
        }
        mavenCentral()
    }
}
```

Copy the blocks from the reference repo rather than from this file, so they stay current.

**Preserve `rootProject.name` and `group` exactly as they are.** Only add
`allprojects { group = ... }` if the project already had a group.

**Leave the Gradle wrapper alone** — do not change `gradle/wrapper/gradle-wrapper.properties`,
`gradlew`, or `gradlew.bat`.

### Phase 5 — Standard repository files

Copy these **byte for byte** from `sp-forsikring`, overwriting whatever is there:

- `.editorconfig`
- `.gitignore`
- `CODEOWNERS`
- `gradle/gradle-daemon-jvm.properties`
- `.github/dependabot.yml`
- `.github/workflows/standard-dependabot-auto-merge.yml`
- `.github/workflows/standard-dependency-submission.yml`
- `.github/workflows/standard-pr.yml`
- `.github/workflows/copilot-setup-steps.yml`

`gradle.properties` is **merged**, not replaced: keep existing entries and ensure it contains

```properties
org.gradle.caching=true
org.gradle.parallel=true
```

Delete:

- All `Dockerfile`s and `.dockerignore` (after Phase 3 sign-off).
- `.idea/codeStyles/` and any other editor formatting config that competes with `.editorconfig`.
- Any standalone CodeQL workflow (`.github/workflows/codeql.yml` or similar) — always removed.
- Every workflow superseded by the standard ones (old build/deploy/PR/dependabot/dependency-graph
  workflows).

Leave `README.md` and `LICENSE`/`LICENSE.md` where they are. The nais resource files are handled
in Phase 6.

### Phase 6 — Nais manifests

Convert the manifests to `.nais/` with per-environment mixins, following Phases 5 and 6 of
`nais-apply-migrering`. The most important rules:

- One base `.nais/<navn>.yaml` per workload or resource, named after `metadata.name`. Keep an
  existing `.nais/` base name such as `.nais/app.yaml`.
- The base holds only what is identical in **every** environment the file is deployed to.
  Everything environment-specific goes in `.nais/<navn>.<env>.yaml` (`dev-gcp`, `prod-gcp`, …).
- Mixin lists are **appended** to base lists. Never split one list item between base and mixin,
  and never let a base `env` entry reference a variable that only a mixin defines.
- Resolve every Handlebars construct into literal YAML with the types it renders to today. Turn
  `\{{` into `{{`. Remove `image: {{image}}` and any equivalent `spec.image`, since
  `deploy-v2.yml` sets the image with `--set spec.image=...`.
- Resources that exist in one environment only (e.g. `.nais/dev-db-policy.yaml`) stay standalone,
  without mixins.
- Move files with `mv`, not `git mv`. Delete the old templates, vars files and per-environment
  copies, and remove directories left empty.
- Update the other references to the old paths found in Phase 2 (README, docs, scripts,
  `CODEOWNERS`).

### Phase 7 — Main-branch workflows

Always use `cron: '0 4 * * 3'` with `timezone: 'Europe/Oslo'`, plus `workflow_dispatch`, regardless
of what the project used before.

**Single-module** — one `.github/workflows/main.yml`, modeled on `sparkel-norg`, using
`bygg-og-test-med-gradle.yml`, `bygg-image-med-jib.yml`, and one `deploy-v2.yml` job per cluster.

**Multimodule** — one `.github/workflows/main-<modul>.yml` per deployed image, modeled on
`sp-forsikring`, using `bygg-modul-image-med-jib.yml` with `with: modul: <modul>`. The `paths`
filter follows the sp-forsikring pattern:

```yaml
    paths:
      # Generelt oppsett - alt unntatt dokumentasjon / urelatert oppsett
      - '**'
      - '!**.md'
      - '!CODEOWNERS'
      - '!LICENSE'
      - '!docs/**'
      - '!.nais/**'
      - '!.github/workflows/standard-dependabot-auto-merge.yml'
      - '!.github/workflows/standard-dependency-submission.yml'
      # Ressursene som deployes av denne workflowen
      - '.nais/<denne-tjenesten>.yaml'
      - '.nais/<denne-tjenesten>.*.yaml'
      - '.nais/<extra-manifests-for-denne-tjenesten>.yaml'
      # Spesielt for denne tjenesten ellers
      - '!.github/workflows/standard-pr.yml'
      - '!.github/workflows/main-<andre-moduler>.yml'
      - '!<andre-deployable-moduler>/**'
```

Leave out the mixin pattern if the workload has no mixins.

Each deploy job uses `deploy-v2.yml`, **one job per workload per environment**:

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

Derive the inputs from what the old deploy steps actually used, per cluster: `CLUSTER` becomes
`environment`, the workload in `RESOURCE` becomes `manifest`, the other `RESOURCE` files become
comma-separated `extra_manifests` (leave the input out when there are none), and `VARS`
disappears. Every deploy job depends on `bygg-image` only (`needs: bygg-image`), so dev and prod
deploy in parallel. Never let a prod deploy wait on a dev deploy. Copy the `permissions:` blocks
from the reference repo verbatim.

Image-less resources kept in a separate workflow (as agreed in Phase 3) also use `deploy-v2.yml`,
one job per environment, without `image` and without `needs`. See Phase 7 of
`nais-apply-migrering`. Never leave out `image` for a workload in a build-and-deploy workflow,
since it would keep running the old image.

### Phase 8 — Verify

Run:

```bash
./gradlew clean build jibDockerBuild -Djib.console=plain --build-cache
```

This mirrors `standard-pr.yml`. Fix the fallout (missing dependencies moved out of a removed BOM,
compilation against the newer toolchain, ktlint formatting, tests relying on removed system
properties). Iterate until it is green. If a test failure is clearly pre-existing and unrelated,
say so explicitly instead of quietly ignoring it.

Verify the Nais manifests exactly as described in Phase 8 of `nais-apply-migrering`: render every
manifest per environment with `nais apply --dry-run`, diff against the Phase 2 baseline, dry-run
each `manifest` input with `--set spec.image=dummy`, validate with `nais validate -vv`, check that
every path in `manifest`, `extra_manifests` and `paths` exists, and search for leftovers (`{{`,
`\{{`, `VARS:`, `WORKLOAD_IMAGE`, `deploy.yml@`, the old directory names). The diff must be empty
apart from harmless list order changes and changes the user approved in Phase 3. Delete the
temporary baseline directory afterwards.

Parse every workflow with `yq . <file> > /dev/null`.

### Phase 9 — Report

Leave all changes **unstaged** — do not `git add` or `git commit`.

Summarize:

- Which plugin each Gradle project got.
- Which images are built and by which workflow, with their resolved image names.
- The Nais inventory from Phase 2, mapped to the new `.nais/` files and deploy-v2 jobs, including
  lists split between base and mixins and lists moved entirely into mixins.
- Every remaining diff against the Nais baseline, and why it is acceptable.
- Files added, overwritten, moved, and deleted.
- Every Dockerfile difference that was dropped, explicitly including any `MaxRAMPercentage` change.
- Anything the user decided to drop in Phase 3.
- Anything still unresolved or needing a human decision.

## Boundaries

### ✅ Always

- Read the plugin sources and reference repos before converting — they are the source of truth.
- Copy the reusable-workflow SHA and `# vX.Y.Z` comment from the matching reference repo.
- Ask before dropping build logic the plugins do not cover.
- Render the Nais baseline before changing any manifest, and diff against it afterwards.
- Keep only content shared by all environments in a Nais base manifest.
- Verify with a real build before declaring done.

### ⚠️ Ask First

- Non-trivial Dockerfile divergence from the jib configuration.
- Image-less resource deploys (Kafka topics, db policies, Aiven resources).
- Values that Handlebars HTML-escaped, shared templates for many workloads, and kinds missing from
  the `nais apply` whitelist.
- Any existing setup that does not map cleanly onto these rules.

### 🚫 Never

- Change `rootProject.name`, `group`, or the Gradle wrapper.
- Keep a Dockerfile, a CodeQL workflow, or a superseded build/deploy workflow.
- Use `deploy.yml`, or leave Handlebars syntax, `\{{` escapes or vars files behind.
- Override a list item through a mixin, or put dev-only values in a base manifest.
- Stage or commit the changes.
