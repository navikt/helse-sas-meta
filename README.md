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

For å hente og sette opp alle repoene brukes [meta](https://github.com/mateodelnorte/meta) - altså **ikke** vanlige git-kommandoer.

Først installerer man meta
```
pnpm install meta -g
```

Så bruker man meta for å hente alle repoene:
```
meta git clone git@github.com:navikt/helse-sas-meta.git
```

Kommandoen over vil opprette en mappe kalt `helse-sas-meta`, med alle prosjektene våre (det vil si; alle som er listet i `.meta`) inni seg.

Deretter kan man bruke git som normalt for hvert repo.

Se [meta](https://github.com/mateodelnorte/meta) for flere kommandoer.

### Tickets i sas-issues og cplt-sandkassen

Tickets ligger som issues i [navikt/sas-issues](https://github.com/navikt/sas-issues/issues), og repoet blir sjekket ut i `./sas-issues` sammen med de andre. Kjører du Copilot i [cplt](https://github.com/navikt/cplt)-sandkassen, kan agenten i utgangspunktet bare skrive til `helse-sas-meta`. Da stopper sandkassen for eksempel `gh issue create` og `gh label create` mot `navikt/sas-issues`. Gi agenten tilgang ved å kjøre dette én gang, utenfor sandkassen, fra `helse-sas-meta`:

```shell
cplt config set --local sandbox.repo_dirs sas-issues
```

Innstillingen lagres bare hos deg, i `~/.config/cplt/local/`, og ikke i repoet. Den gjelder fra neste gang du starter cplt.

Dersom du nå åpner `build.gradle.kts` med `Open` (som Project) i IntelliJ så får du alle komponentene inn i ett IntelliJ-oppsett.

## Legge til nye repos?

Det enkleste er å kjøre `./oppdater_metaoppsett.sh` ettersom den selv vil innhente alle repos hvor `tbd` er owner,
og dytte resultatet inn i `.meta` (den ekskluderer også noen repoer Team SAS ikke eier - se [oppdater_metaoppsett.sh](oppdater_metaoppsett.sh)).

Så kjører du `meta git update` for å clone nye repositories. Om det er et gradle-prosjekt må den også legges inn i `settings.gradle`

## Hvordan .... ?

Alt nedenfor som refererer til `make` kan erstattes av `just`, men dobbeltsjekk syntaxen (den er kulere syntax med just).

### Finne ut av hva jeg kan gjøre med `just`

`just --list`

og så besøke https://just.systems/man/en/ om du har lyst til å skjønne `just`

### Oppgradere Gradle wrapper

```
make upgrade-gradle
```
Kommandoen vil gå gjennom alle prosjektene og bumpe gradle til siste versjon, bygge/teste koden, og commite til slutt.
Du kan bekrefte commits etterpå ved å kjøre:
```
make list-local-commits
```

For å shippe det:
```
meta git push
```

### Oppgradere Kotlin JVM

```
KOTLIN_VERSION=<kotlin_versjon> make upgrade-kotlin-jvm
```
Kommandoen vil gå gjennom alle prosjektene og bumpe kotlin jvm til angitt versjon, bygge/teste koden, og commite til slutt.
Du kan bekrefte commits etterpå ved å kjøre:
```
make list-local-commits
```

For å shippe det:
```
meta git push
```

_Forutsetninger_: koden forutsetter at det finnes en `build.gradle.kts`-fil med en slik linje:
```kotlin
kotlin("jvm") version "<kotlin_versjon>"
```

### Oppgradere Java Language Version

```
JAVA_LANGUAGE_VERSION=<java_versjon> make upgrade-java-language-version
```
Kommandoen vil gå gjennom alle prosjektene og bumpe Java Language Version til siste versjon, bygge/teste koden, og commite til slutt.
Du kan bekrefte commits etterpå ved å kjøre:
```
make list-local-commits
```

For å shippe det:
```
meta git push
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
make upgrade-editorconfig
```

Kommandoen vil gå gjennom alle prosjektene og endre til nyeste versjon, og commite til slutt.
Du kan bekrefte commits etterpå ved å kjøre:

```
make list-local-commits
```

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

### For NAV-ansatte
Interne henvendelser kan sendes via Slack i kanalen [#team-sas-værsågod](https://nav-it.slack.com/archives/C019637N90X).
