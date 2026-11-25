Meta for Team SAS
=====================

## Noen forutsetninger

Du må ha installert:
- jq (`brew install jq`)
- gh (`brew install gh`)
- pnpm (for eksempel `brew install pnpm`)

Du må kunne clone fra GitHub-URL-er på formatet `git@github.com:<repo>.git`
  - en måte er å få git til å bytte til https under panseret:
  - `git config --global url."https://github.com/".insteadOf git@github.com:`

Det kan være flere ting du må ha på plass. Spør en vennlig sjel - og oppdater gjerne denne filen etterpå :D

### En valgfri forutsetning

`brew install just`

.. eller hvordan du ellers har lyst til å installere `just` på akkurat _din_ maskin.


## Komme i gang

For å hente og sette opp alle repoene brukes [meta](https://github.com/gitkb/meta) - altså **ikke** vanlige git-kommandoer.

Først installerer man meta
```
brew install gitkb/tap/meta-cli
```

Har du den gamle versjonen av meta (fra npm/pnpm), må du avinstallere den først. `which -a meta` viser hvilke versjoner du har installert.

`meta exec` kjører kommandoen uten shell, så skriv `meta exec git push`, ikke `meta exec "git push"`. Trenger du pipes eller `$()`, bruk `meta exec -- sh -c '...'`.

Så bruker man meta for å hente alle repoene:
```
meta git clone git@github.com:navikt/helse-sas-meta.git
```

Kommandoen over vil opprette en mappe kalt `helse-sas-meta`, med alle prosjektene våre (det vil si; alle som er listet i `.meta.yaml`) inni seg.

Deretter kan man bruke git som normalt for hvert repo.

Se [meta](https://github.com/gitkb/meta) for flere kommandoer.

### Tickets i sas-issues og cplt-sandkassen

Tickets ligger som issues i [navikt/sas-issues](https://github.com/navikt/sas-issues/issues), og repoet blir sjekket ut i `./sas-issues` sammen med de andre. Kjører du Copilot i [cplt](https://github.com/navikt/cplt)-sandkassen, kan agenten i utgangspunktet bare skrive til `helse-sas-meta`. Da stopper sandkassen for eksempel `gh issue create` og `gh label create` mot `navikt/sas-issues`. Gi agenten tilgang ved å kjøre dette én gang, utenfor sandkassen, fra `helse-sas-meta`:

```shell
cplt config set --local sandbox.repo_dirs sas-issues
```

Innstillingen lagres bare hos deg, i `~/.config/cplt/local/`, og ikke i repoet. Den gjelder fra neste gang du starter cplt.

En kort guide til hvordan teamet bruker Copilot, cplt og nav-pilot står i [docs/copilot-i-team-sas.html](docs/copilot-i-team-sas.html). Den er skrevet for teammedlemmer, ikke for agenter.

Dersom du nå åpner `build.gradle.kts` med `Open` (som Project) i IntelliJ så får du alle komponentene inn i ett IntelliJ-oppsett.

## Legge til nye repos?

Det enkleste er å kjøre `just oppdater-metaoppsett` (eller `./oppdater_metaoppsett.sh`) ettersom den selv vil innhente alle repos hvor `tbd` er owner,
og dytte resultatet inn i `.meta.yaml` (den ekskluderer også noen repoer Team SAS ikke eier - se [oppdater_metaoppsett.sh](oppdater_metaoppsett.sh)).

Så kjører du `meta git update` for å clone nye repositories. Om det er et gradle-prosjekt må den også legges inn i `settings.gradle`

## Hvordan .... ?

### Finne ut av hva jeg kan gjøre med `just`

`just --list`

og så besøke https://just.systems/man/en/ om du har lyst til å skjønne `just`

### Oppgradere Gradle wrapper

```
just upgrade-gradle
```
Kommandoen vil gå gjennom alle prosjektene og bumpe gradle til siste versjon, bygge/teste koden, og commite til slutt.
Se over commitene og push dem repo for repo med:
```
just prepush-review
```

### Oppgradere Kotlin JVM

```
just upgrade-kotlin <kotlin_versjon>
```
Kommandoen vil gå gjennom alle prosjektene og bumpe kotlin jvm til angitt versjon, bygge/teste koden, og commite til slutt.
Se over commitene og push dem repo for repo med:
```
just prepush-review
```

_Forutsetninger_: koden forutsetter at det finnes en `build.gradle.kts`-fil med en slik linje:
```kotlin
kotlin("jvm") version "<kotlin_versjon>"
```

### Oppgradere Java Language Version

```
just upgrade-java-language-version <java_versjon>
```
Kommandoen vil gå gjennom alle prosjektene og bumpe Java Language Version til siste versjon, bygge/teste koden, og commite til slutt.
Se over commitene og push dem repo for repo med:
```
just prepush-review
```

_Forutsetning_: koden forutsetter at det finnes en `build.gradle.kts`-fil med en slik linje:
```kotlin
languageVersion.set(JavaLanguageVersion.of("java_versjon"))
```
for eksempel noe sånn:
```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of("21"))
    }
}
```

### Oppdatere linting i alle prosjekt

Gjør endringer i .editorconfig på root.
Kjør kommandoen
```
just upgrade-editorconfig
```

Kommandoen vil gå gjennom alle prosjektene og endre til nyeste versjon, og commite til slutt.
Se over commitene og push dem repo for repo med:

```
just prepush-review
```

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

### For NAV-ansatte
Interne henvendelser kan sendes via Slack i kanalen [#team-sas-værsågod](https://nav-it.slack.com/archives/C019637N90X).
