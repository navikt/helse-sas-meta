# installer just med `brew install just`

meta_project := file_name(justfile_directory())

[private]
default:
    @just --list --unsorted

# pull alle repos og vis nye commits siden sist
[group('Git')]
pull:
    @{{ justfile_directory() }}/pull-and-describe.sh

# pull alle repos uten å vise utdata, bare repoer som feiler
[group('Git')]
pull-quiet:
    @meta -s --parallel --exclude . exec git pull --all --rebase --autostash

# vis lokale commits og bestem om du vil pushe
[group('Git')]
prepush-review:
    @meta --sequential --exclude . exec -- sh -c ' \
        [ -n "$(git log --oneline "@{u}..HEAD" 2>/dev/null)" ] || exit 0; \
        git --no-pager show --oneline "@{u}..HEAD"; \
        printf "Pushe? (y/N) "; read -r a; \
        if [ "$a" = "y" ]; then git push || echo "Push feilet"; fi \
        '

# viser upushede commits i alle repoer
[group('Git')]
list-unpushed-commits:
    @meta --parallel exec -- sh -c 'git --no-pager log --oneline "@{u}..HEAD" 2>/dev/null || true'

# viser staged, unstaged og untracked endringer i alle repoer
[group('Git')]
list-uncommitted-changes:
    @meta --parallel exec git status --short

# viser upushede commits, staged, unstaged og untracked endringer i alle repoer
[group('Git')]
list-changes:
    @meta --parallel exec -- sh -c ' \
        commits=$(git --no-pager log --oneline "@{u}..HEAD" 2>/dev/null); \
        status=$(git status --short); \
        [ -z "$commits" ] || printf "Upushede commits:\n%s\n" "$commits"; \
        [ -z "$status" ] || printf "Endringer:\n%s\n" "$status"; \
        true \
        '

# pusher alle repos
[group('Git')]
push:
    @meta --exclude . exec git push

# kjør git checkout . på alle repo
[group('Git')]
regret:
    @meta --exclude . exec git checkout .

# slett alle filer som git ikke vet om
[group('Git')]
clean:
    @meta --exclude . exec git clean -f

# viser åpne PR-er i alle repoer
[group('Pull requests')]
list-prs:
    @meta --parallel --exclude . exec gh pr list \
        --json number,title,createdAt \
        --jq '.[] | "#\(.number) \(.title) (\(.createdAt[0:10]))"'

# viser PR-er opprettet siste døgn i alle repoer
[group('Pull requests')]
list-prs-opprettet-i-dag:
    @meta --parallel --exclude . exec gh pr list \
        --search "created:>$(date -v-1d +%F)" \
        --json number,title \
        --jq '.[] | "#\(.number) \(.title)"'

# oppdaterer alle til siste gradle-versjon
[group('Oppgradering')]
upgrade_gradle:
    @meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_gradle.sh"

# "versjon" er den nye kotlin-versjonen alle repoene skal bygges på
[group('Oppgradering')]
upgrade_kotlin versjon:
    @KOTLIN_VERSION={{ versjon }} meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_kotlin_jvm.sh"

# "versjon" er den nye java language version alle repoene skal bygges på
[group('Oppgradering')]
upgrade-java-language-version versjon:
    @JAVA_LANGUAGE_VERSION={{ versjon }} meta --exclude . exec "{{ justfile_directory() }}/.bin/upgrade_java_language_version.sh"

# oppdater editorconfig i alle prosjekter
[group('Oppgradering')]
upgrade-editorconfig:
    @meta --exclude . exec "{{ justfile_directory() }}/.bin/update_editorconfig.sh"

# oppdaterer .meta.yaml, .gitignore og settings.gradle med alle repoene til team-sas
[group('Verktøy')]
oppdater-metaoppsett:
    @{{ justfile_directory() }}/oppdater_metaoppsett.sh

# viser short description av alle repoer
[group('Verktøy')]
describe:
    @meta --parallel --exclude . exec gh repo view --json description -q .description

# bygger alle gradle-prosjekter
[group('Verktøy')]
build:
    @meta --exclude . exec -- sh -c 'if test -f ./gradlew; then ./gradlew -q build; fi'

# skriver avhengighetene til alle gradle-prosjekter til gradle_deps.txt i hvert repo
[group('Verktøy')]
deps:
    @meta --parallel --exclude . exec "{{ justfile_directory() }}/.bin/gradle_deps.sh"

# fjerner NAIS_DEPLOY_APIKEY fra alle repoene
[group('Verktøy')]
remove-deploy-key:
    @meta --parallel --exclude . exec gh secret delete NAIS_DEPLOY_APIKEY

# printer ut linjer i git-historikken til alle repoene som ligner på fødselsnumre
[group('Verktøy')]
finnfnr:
    @meta --parallel exec -- sh -c "git log -p | grep -E '\b[0-9]{11}\b' || true"
