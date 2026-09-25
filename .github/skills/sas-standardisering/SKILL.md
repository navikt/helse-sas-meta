---
name: sas-standardisering
description: Convert a navikt/helse (tbd) Gradle project from an ad-hoc build and GitHub Actions setup to the standardized sas setup — the four sas-gradle-plugins (sas-root, sas-module, sas-kotlin, sas-deployable), standardized settings.gradle.kts, standard repo files, and reusable workflows from helse-sas-github-workflows. Trigger on requests like "standardiser dette prosjektet", "konverter til sas-oppsettet", "ta i bruk sas-gradle-plugins", "bytt ut Dockerfile med jib", or "rydd opp i workflowene".
license: MIT
compatibility: navikt/helse (team tbd) Kotlin/Gradle repositories deployed on Nais
metadata:
  domain: build-and-ci
  tags: gradle sas-gradle-plugins github-actions nais jib ktlint standardization tbd
---

# SAS Standardization Skill

Converts a nonstandardized Gradle + GitHub Actions project into the standardized SAS setup.

## Authoritative References

Never guess — read these when in doubt. They are the source of truth, and they change over time.

| Reference | Role |
| --- | --- |
| `navikt/helse-sas-gradle-plugins` | The four Gradle plugins. Read the plugin sources to know what they already provide. |
| `navikt/helse-sas-github-workflows` | The reusable workflows and their inputs. |
| `navikt/helse-sp-forsikring` | Authoritative example of a **multimodule** project. |
| `navikt/sparkel-norg` | Authoritative example of a **single-module** project. |

If the user has a local clone of the `navikt/helse-sas-meta` meta repo, these live as sibling
directories in it (`sas-gradle-plugins/`, `sas-github-workflows/`, `sp-forsikring/`, `sparkel-norg/`)
and should be read from disk. Otherwise fetch them with `gh`.

## Workflow

Work through the phases in order. Phases 1–2 are read-only; do not edit anything until you have
completed the survey and asked the questions it raises.

### Phase 1 — Read the references

1. Read all four plugin sources in `sas-gradle-plugins/src/main/kotlin/`.
   `no.nav.helse.sas.sas-singlemodule-deployable` is deprecated — ignore it, never apply it.
2. Read the reusable workflows in `sas-github-workflows/.github/workflows/`.
3. Read `sp-forsikring` or `sparkel-norg` in full, depending on the shape of the target project.
4. Note the pinned SHA + version comment that the matching reference repo uses for
   `navikt/helse-sas-github-workflows/...@<sha> # vX.Y.Z`. **Copy that exact SHA and comment** into
   the workflows you generate. Do not invent a SHA and do not look up the latest release.

### Phase 2 — Survey the target project

Determine and write down:

- **Shape**: single-module (no `include(...)` in `settings.gradle.kts`) or multimodule.
- **Module tree**: for each Gradle project, whether it has any `src/` sources or resources
  (including `src/test/**`), and whether it has child projects.
- **Deployables**: every image built today. Find them from the existing workflows — look for
  `nais/docker-build-push`, `docker build`, `jib`, Dockerfiles, and `IMAGE:`/`image:` wiring.
  Note the `image_suffix` input if `nais/docker-build-push` uses one.
- **Nais resources**: which files each deploy step passes as `RESOURCE` and `VARS`, per cluster.
- **Everything in the existing `build.gradle.kts` files** that is not just dependencies:
  custom tasks, test configuration, jar packaging, toolchain settings, plugins.
- **Existing workflows**, classified as: replaced by a standard workflow, superseded by the new
  setup, or unaccounted for.

### Phase 3 — Ask before changing anything

Confront the user about all of the following, in one batch, before editing:

- **Dockerfile discrepancies.** Compare each Dockerfile against what `sas-deployable` generates
  through jib (base image, `TZ`, `-XX:MaxRAMPercentage`, main class, anything else in the
  plugin's `jib { }` block).
  - A **JRE major version** difference is an expected upgrade — say nothing.
  - A **`MaxRAMPercentage`** difference is reported afterwards in the summary, but is not a blocker.
  - **Any other non-trivial difference** (extra `COPY`, extra `ENV`, custom `ENTRYPOINT`/`CMD`,
    exposed ports, added packages, non-default workdir) must be raised **before** you delete the
    Dockerfile, and you must wait for an answer.
- **Build logic not covered by the plugins.** For every custom construct found in Phase 2 that the
  sas plugins do not already provide (e.g. JUnit parallelism system properties, custom source sets,
  shadow/fat-jar packaging, extra repositories, custom `check` wiring), ask the user whether to keep
  it or drop it. Do not decide on your own. Fat-jar/manifest blocks are superseded by jib, but still
  mention that you are removing them.
- **Image-less resource deploys.** If the project deploys nais resources that are not workloads
  (Kafka `Topic`, `AivenApplication`, db policies, …) via a separate workflow, ask the user whether
  to fold them into the corresponding app workflow's `RESOURCE` list (as `sp-forsikring` does with
  `.nais/dev-db-policy.yaml`) or keep a separate, modernized workflow. The standard `deploy.yml`
  requires `WORKLOAD_IMAGE`, so a separate workflow cannot reuse it.
- **Anything else that does not map cleanly onto these instructions.** When in doubt, ask.

### Phase 4 — Gradle conversion

#### Plugin selection

| Project | Plugin |
| --- | --- |
| Multimodule root **without** sources/resources | `sas-root` |
| Multimodule root **with** sources/resources | `sas-kotlin` (not `sas-root`) |
| Intermediate aggregator ("subroot") with children but no sources/resources | `sas-module` |
| Module with sources or resources (incl. test-only) that becomes an image | `sas-deployable` |
| Module with sources or resources that does not become an image | `sas-kotlin` |
| Single-module project that becomes an image | `sas-deployable` |

`sas-deployable` implies `sas-kotlin` implies `sas-module`. Never apply two of them to the same project.

#### Application style

**Multimodule** — root declares aliases, submodules use string ids:

```kotlin
// build.gradle.kts (root)
plugins {
    alias(libs.plugins.sas.root)
    alias(libs.plugins.sas.kotlin) apply false
    alias(libs.plugins.sas.deployable) apply false
}

allprojects {
    group = "no.nav.helse.<eksisterende-group>"
}
```

```kotlin
// <modul>/build.gradle.kts
plugins {
    id("no.nav.helse.sas.sas-kotlin")
}
```

Only declare `apply false` aliases for plugins that are actually used by submodules.

**Single-module** — alias directly:

```kotlin
group = "no.nav.helse.<eksisterende-group>"

plugins {
    alias(libs.plugins.sas.deployable)
}

sasDeployable {
    mainClass = "no.nav.helse.<...>.AppKt"
}

dependencies { /* ... */ }
```

#### `sasDeployable` configuration

- `mainClass` is required — take it from the existing Dockerfile/jar manifest/`application` block.
- `imageName` defaults to `rootProject.name`. Derive the correct name from what the project builds
  **today**: if the existing workflow passed an `image_suffix` (or otherwise pushed a suffixed
  image), set `imageName = "${rootProject.name}-<suffix>"` as `opprydding-dev` does. Otherwise omit
  `imageName`.

#### Version catalog

`gradle/libs.versions.toml` is kept for the project's own dependencies. Remove only what the plugins
now provide: the Kotlin/ktlint/jib plugin versions, JUnit, the BOMs listed in `sas-kotlin`, and
toolchain settings. Add:

```toml
[versions]
sasGradlePlugins = "<version from the reference repo>"

[plugins]
sas-deployable = { id = "no.nav.helse.sas.sas-deployable", version.ref = "sasGradlePlugins" }
sas-kotlin = { id = "no.nav.helse.sas.sas-kotlin", version.ref = "sasGradlePlugins" }
sas-root = { id = "no.nav.helse.sas.sas-root", version.ref = "sasGradlePlugins" }
```

If the project inlines its dependency coordinates in `build.gradle.kts` (as sporbar does), move them
into the catalog. Only declare the plugin aliases the project actually uses.

Also remove from the build files anything now supplied by the plugins: `kotlin("jvm")`,
`jvmToolchain`, ktlint setup, `useJUnitPlatform()`, JUnit dependencies, the ktor/jackson/netty BOMs
that `sas-kotlin` already applies, and jib/Docker packaging.

#### `settings.gradle.kts`

Exact layout — `rootProject.name` first, `include(...)` next (multimodule only), then the two
management blocks verbatim, in this order:

```kotlin
rootProject.name = "<uendret>"
include(
    "<modul>",
)

// Sett opp repositories basert på om vi kjører i CI eller ikke
// Jf. https://github.com/navikt/utvikling/blob/main/docs/teknisk/Konsumere%20biblioteker%20fra%20Github%20Package%20Registry.md
pluginManagement {
    repositories {
        if (providers.environmentVariable("GITHUB_ACTIONS").orNull == "true") {
            maven("https://maven.pkg.github.com/navikt/maven-release") {
                credentials {
                    username = "token"
                    password = providers.environmentVariable("GITHUB_TOKEN").orNull!!
                }
            }
        } else {
            maven("https://repo.adeo.no/repository/github-package-registry-navikt/")
        }
        gradlePluginPortal()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    // Bare tillat repositories-oppsett her i settings.gradle.kts
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)

    repositories {
        if (providers.environmentVariable("GITHUB_ACTIONS").orNull == "true") {
            maven("https://maven.pkg.github.com/navikt/maven-release") {
                credentials {
                    username = "token"
                    password = providers.environmentVariable("GITHUB_TOKEN").orNull!!
                }
            }
        } else {
            maven("https://repo.adeo.no/repository/github-package-registry-navikt/")
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

Leave `README.md`, `LICENSE`/`LICENSE.md`, and the nais resource files where they are.

### Phase 6 — Main-branch workflows

**Leave nais resource files where they are** (e.g. `deploy/dev.yml` stays in `deploy/`) and point
`RESOURCE`/`VARS` at those existing paths. Adjust the workflows' `paths` filters to the project's
actual nais directory.

Remove `image: {{image}}` (and any equivalent `IMAGE`-driven field) from nais `Application`/`Naisjob`
manifests — `WORKLOAD_IMAGE` produces a companion `Image` resource. Only remove it when it does
correspond to the image the workflow deploys.

Always use `cron: '0 4 * * 3'` with `timezone: 'Europe/Oslo'`, plus `workflow_dispatch`, regardless
of what the project used before.

**Single-module** — one `.github/workflows/main.yml`, modeled on `sparkel-norg`, using
`bygg-og-test-med-gradle.yml`, `bygg-image-med-jib.yml`, and one `deploy.yml` job per cluster.

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
      - '!<nais-katalog>/**'
      - '!.github/workflows/standard-dependabot-auto-merge.yml'
      - '!.github/workflows/standard-dependency-submission.yml'
      # Ressursene som deployes av denne workflowen
      - '<nais-katalog>/<denne-tjenesten>.yaml'
      # Spesielt for denne tjenesten ellers
      - '!.github/workflows/standard-pr.yml'
      - '!.github/workflows/main-<andre-moduler>.yml'
      - '!<andre-deployable-moduler>/**'
```

Take `CLUSTER`, `RESOURCE`, and `VARS` from what the old deploy steps actually used, per cluster.
Every deploy job depends on `bygg-image` only (`needs: bygg-image`), so dev and prod deploy in
parallel. Never let a prod deploy wait on a dev deploy. Copy the `permissions:` blocks from the
reference repo verbatim.

### Phase 7 — Verify

Run:

```bash
./gradlew clean build jibDockerBuild -Djib.console=plain --build-cache
```

This mirrors `standard-pr.yml`. Fix the fallout (missing dependencies moved out of a removed BOM,
compilation against the newer toolchain, ktlint formatting, tests relying on removed system
properties). Iterate until it is green. If a test failure is clearly pre-existing and unrelated,
say so explicitly instead of quietly ignoring it.

Also sanity-check the workflows, e.g. `gh workflow list` after pushing, or at minimum a YAML parse.

### Phase 8 — Report

Leave all changes **unstaged** — do not `git add` or `git commit`.

Summarize:

- Which plugin each Gradle project got.
- Which images are built and by which workflow, with their resolved image names.
- Files added, overwritten, and deleted.
- Every Dockerfile difference that was dropped, explicitly including any `MaxRAMPercentage` change.
- Anything the user decided to drop in Phase 3.
- Anything still unresolved or needing a human decision.

## Boundaries

### ✅ Always

- Read the plugin sources and reference repos before converting — they are the source of truth.
- Copy the reusable-workflow SHA and `# vX.Y.Z` comment from the matching reference repo.
- Ask before dropping build logic the plugins do not cover.
- Verify with a real build before declaring done.

### ⚠️ Ask First

- Non-trivial Dockerfile divergence from the jib configuration.
- Image-less resource deploys (Kafka topics, db policies, Aiven resources).
- Any existing setup that does not map cleanly onto these rules.

### 🚫 Never

- Apply `sas-singlemodule-deployable`.
- Change `rootProject.name`, `group`, or the Gradle wrapper.
- Move or rename nais resource files.
- Keep a Dockerfile, a CodeQL workflow, or a superseded build/deploy workflow.
- Stage or commit the changes.
