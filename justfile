# installer just med `brew install just`

meta_project := file_name(justfile_directory())

[private]
default:
    @just --list --unsorted

# pull alle repos og vis nye commits siden sist
[group('Git')]
pull:
    @{{ justfile_directory() }}/pull-and-describe.sh

# pull alle repos
[group('Git')]
pull-all:
    @meta --exclude . exec git pull --all --rebase --autostash 

# viser frem lokale commits
[group('Git')]
list-commits:
    @meta --exclude . exec "git log --pretty=format:%s @{u}..HEAD"

# vis lokale commits og bestem om du vil pushe
[group('Git')]
prepush-review:
    @meta --exclude . exec 'output=$(git log --oneline origin/HEAD..HEAD) ; [ -n "$output" ] && (git show --oneline origin/HEAD..HEAD | cat && echo "Pushe? (y/N)" && read a && [ "$a" = "y" ] && git push) || true'

# pusher alle repos
[group('Git')]
push:
    @meta exec "git push"

# kjør git checkout . på alle repo
[group('Git')]
regret:
    @meta exec "git checkout ."

# slett alle filer som git ikke vet om
[group('Git')]
clean:
    @meta exec "git clean -f"

# viser åpne PR-er i alle repoer
[group('Pull requests')]
list-prs:
    @meta --exclude . exec 'output=$( \
        gh pr list \
            --json number,title,createdAt \
            --jq ".[] | \"#\(.number) \(.title) (\(.createdAt[0:10]))\"" \
        ); \
        [ -n "$output" ] && echo "$output" \
        '

# viser PR-er opprettet siste døgn i alle repoer
[group('Pull requests')]
list-prs-opprettet-i-dag:
    @meta --exclude . exec 'output=$( \
            gh pr list --search "created:>$(date -v-1d +%F)" \
                --json number,title \
                --jq ".[] | \"#\(.number) \(.title)\"" \
        ); \
        [ -n "$output" ] && echo "$output" \
        '

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
    @meta --exclude . exec "gh repo view --json description -q '.[\"description\"]'"

# bygg alt på nytt
[group('Verktøy')]
bygg-alt-pa-nytt:
    @meta --exclude . exec "{{ justfile_directory() }}/.bin/bygg_alt_på_nytt.sh"
