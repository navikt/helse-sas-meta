# installer just med `brew install just`

meta_project := file_name(justfile_directory())

[private]
default:
    @just --list --unsorted

# puller alle repoene og viser nye commits siden forrige `just pull`
[group('Git')]
pull:
    @{{ justfile_directory() }}/pull-and-describe.sh

# puller alle repoene uten utskrift, bortsett fra hvilke som feilet
[group('Git')]
pull-quiet:
    @meta -s --parallel --exclude . exec git pull --all --rebase --autostash

# viser upushede commits repo for repo og spør om hvert repo skal pushes
[group('Git')]
prepush-review:
    @meta --sequential --exclude . exec -- sh -c ' \
        [ -n "$(git log --oneline "@{u}..HEAD" 2>/dev/null)" ] || exit 0; \
        git --no-pager show --oneline "@{u}..HEAD"; \
        printf "Pushe? (y/N) "; read -r a; \
        if [ "$a" = "y" ]; then git push || echo "Push feilet"; fi \
        '

# viser upushede commits i alle repoene, også metarepoet
[group('Git')]
list-unpushed-commits:
    @meta --parallel exec -- sh -c 'git --no-pager log --oneline "@{u}..HEAD" 2>/dev/null || true'

# viser ucommitede filer (staged, unstaged og untracked) i alle repoene, også metarepoet
[group('Git')]
list-uncommitted-changes:
    @meta --parallel exec git status --short

# viser både upushede commits og ucommitede filer i alle repoene, også metarepoet
[group('Git')]
list-changes:
    @meta --parallel exec -- sh -c ' \
        commits=$(git --no-pager log --oneline "@{u}..HEAD" 2>/dev/null); \
        status=$(git status --short); \
        [ -z "$commits" ] || printf "Upushede commits:\n%s\n" "$commits"; \
        [ -z "$status" ] || printf "Endringer:\n%s\n" "$status"; \
        true \
        '

# pusher alle repoene uten å spørre (se prepush-review)
[group('Git')]
push:
    @meta --exclude . exec git push

# forkaster unstaged endringer i trackede filer i alle repoene (git checkout .)
[group('Git')]
regret:
    @meta --exclude . exec git checkout .

# sletter untracked filer i alle repoene (git clean -f)
[group('Git')]
clean:
    @meta --exclude . exec git clean -f

# viser åpne PR-er i alle repoene
[group('Pull requests')]
list-prs:
    @meta --parallel --exclude . exec gh pr list \
        --json number,title,createdAt \
        --jq '.[] | "#\(.number) \(.title) (\(.createdAt[0:10]))"'

# viser PR-er opprettet det siste døgnet i alle repoene
[group('Pull requests')]
list-prs-opprettet-i-dag:
    @meta --parallel --exclude . exec gh pr list \
        --search "created:>$(date -v-1d +%F)" \
        --json number,title \
        --jq '.[] | "#\(.number) \(.title)"'

# oppgraderer Gradle wrapper til siste versjon, sjekker bygget med --dry-run og committer i alle repoene
[group('Oppgradering')]
upgrade-gradle:
    @meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_gradle.sh"

# oppgraderer Kotlin JVM til <versjon>, bygger og committer i alle repoene
[group('Oppgradering')]
upgrade-kotlin versjon:
    @KOTLIN_VERSION={{ versjon }} meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_kotlin_jvm.sh"

# oppgraderer Java language version til <versjon>, bygger og committer i alle repoene
[group('Oppgradering')]
upgrade-java-language-version versjon:
    @JAVA_LANGUAGE_VERSION={{ versjon }} meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_java_language_version.sh"

# kopierer .editorconfig fra metarepoet til alle Gradle-prosjektene og committer
[group('Oppgradering')]
upgrade-editorconfig:
    @meta --exclude . exec "{{ justfile_directory() }}/.bin/update_editorconfig.sh"

# henter repoene til team-sas fra GitHub og oppdaterer .meta.yaml, .gitignore og settings.gradle
[group('Verktøy')]
oppdater-metaoppsett:
    @{{ justfile_directory() }}/oppdater_metaoppsett.sh

# viser GitHub-beskrivelsen til alle repoene
[group('Verktøy')]
describe:
    @meta --parallel --exclude . exec gh repo view --json description -q .description

# bygger alle Gradle-prosjektene, ett om gangen
[group('Verktøy')]
build:
    @meta --exclude . exec -- sh -c 'if test -f ./gradlew; then ./gradlew -q build; fi'

# skriver avhengighetene til hvert Gradle-prosjekt til gradle_deps.txt i repoet
[group('Verktøy')]
deps:
    @meta --parallel --exclude . exec "{{ justfile_directory() }}/.bin/gradle_deps.sh"

# sletter GitHub-secreten NAIS_DEPLOY_APIKEY i alle repoene
[group('Verktøy')]
remove-deploy-key:
    @meta --parallel --exclude . exec gh secret delete NAIS_DEPLOY_APIKEY

# finner linjer i git-historikken som ligner fødselsnumre (11 sifre), også i metarepoet
[group('Verktøy')]
finnfnr:
    @meta --parallel exec -- sh -c "git log -p | grep -E '\b[0-9]{11}\b' || true"
