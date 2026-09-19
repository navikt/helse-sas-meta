#!/usr/bin/env bash
#
# Genererer oversikt over hvilke moduler i metarepoet som bruker hvilke
# biblioteker fra bibliotekprosjektene våre.
#
# Kjør fra hvor som helst:  ./generer-biblioteksbruk.sh
# Resultat: biblioteksbruk-<bibliotekprosjekt>.md i docs-mappa.
#
# Kilder som skannes:
#   1. direkte koordinater (group:artifact) i build.gradle[.kts]
#   2. aliaser deklarert i gradle/libs.versions.toml, sporet til modulen
#      som bruker libs-accessoren
#   3. aliaser deklarert programmatisk i settings.gradle.kts
#      (library("alias", "group", "artifact"))
#   4. interne project(":modul")-avhengigheter i selve bibliotekprosjektet

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# bibliotekprosjekt|maven-group
PROSJEKTER=(
    "tbd-libs|com.github.navikt.tbd-libs"
    "sykepenger-libs|no.nav.sykepenger.libs"
)

# Gjør en streng om til et regex som matcher den bokstavelig.
escape_regex() {
    printf '%s' "$1" | sed -e 's/[.[\*^$()+?{}|]/\\&/g'
}

# Alle build-filer i metarepoet, uten byggekataloger og uten et gitt prosjekt.
build_filer() {
    local utelat="${1:-}"
    find . -type d \( -name build -o -name .git -o -name node_modules \) -prune -o \
        -type f \( -name 'build.gradle.kts' -o -name 'build.gradle' \) -print |
        if [ -n "$utelat" ]; then grep -v "^\./$utelat/"; else cat; fi
}

# Modulnavn ut fra stien til en build-fil: ./spenn/spenn-mq/build.gradle.kts -> spenn:spenn-mq
modulnavn() {
    dirname "${1#./}" | tr '/' ':'
}

# Konfigurasjonen (api, implementation, testImplementation ...) en linje bruker.
konfigurasjon() {
    printf '%s' "$1" | sed -nE 's/^[[:space:]]*([A-Za-z]+)[[:space:]]*\(.*/\1/p'
}

# Skriver linjer på formen: type<TAB>modul<TAB>artefakt<TAB>konfigurasjon
samle_bruk() {
    local prosjekt="$1" group="$2"
    local group_re
    group_re="$(escape_regex "$group")"

    # 1. Direkte koordinater utenfor bibliotekprosjektet
    while IFS= read -r fil; do
        local modul
        modul="$(modulnavn "$fil")"
        while IFS= read -r linje; do
            local artefakt konf
            artefakt="$(printf '%s' "$linje" | { grep -Eo "${group_re}[\":, ]+[a-z0-9-]+" || true; } | sed -E "s/.*[\":, ]//")"
            [ -n "$artefakt" ] || continue
            konf="$(konfigurasjon "$linje")"
            printf 'ekstern\t%s\t%s\t%s\n' "$modul" "$artefakt" "${konf:--}"
        done < <(grep -E "${group_re}[\":, ]+[a-z0-9-]+" "$fil" || true)
    done < <(build_filer "$prosjekt")

    # 2. og 3. Aliaser i versjonskatalog eller settings.gradle.kts
    while IFS= read -r deklarasjon; do
        local repo alias artefakt accessor accessor_re
        repo="${deklarasjon%%|*}"
        alias="$(printf '%s' "$deklarasjon" | cut -d'|' -f2)"
        artefakt="${deklarasjon##*|}"
        accessor="libs.$(printf '%s' "$alias" | tr '_-' '..')"
        accessor_re="$(escape_regex "$accessor")"

        while IFS= read -r fil; do
            local modul
            modul="$(modulnavn "$fil")"
            while IFS= read -r linje; do
                local konf
                konf="$(konfigurasjon "$linje")"
                printf 'ekstern\t%s\t%s\t%s\n' "$modul" "$artefakt" "${konf:--}"
            done < <(grep -E "${accessor_re}([^A-Za-z0-9_.]|$)" "$fil" || true)
        done < <(build_filer "$prosjekt" | grep "^\./$repo/" || true)
    done < <(alias_deklarasjoner "$prosjekt" "$group_re")

    # 4. Interne avhengigheter i bibliotekprosjektet
    while IFS= read -r fil; do
        local modul
        modul="$(modulnavn "$fil")"
        while IFS= read -r linje; do
            local artefakt konf
            artefakt="$(printf '%s' "$linje" | sed -nE 's/.*project\("[:]?([A-Za-z0-9:_-]+)"\).*/\1/p' | tr ':' '\n' | tail -1)"
            [ -n "$artefakt" ] || continue
            konf="$(konfigurasjon "$linje")"
            printf 'intern\t%s\t%s\t%s\n' "$modul" "$artefakt" "${konf:--}"
        done < <(grep -E 'project\(":' "$fil" || true)
    done < <(find "./$prosjekt" -type d -name build -prune -o -type f \( -name 'build.gradle.kts' -o -name 'build.gradle' \) -print)
}

# Skriver linjer på formen: repo|alias|artefakt
alias_deklarasjoner() {
    local prosjekt="$1" group_re="$2"

    # Versjonskataloger: alias = { module = "group:artefakt" ... }  eller  alias = "group:artefakt:versjon"
    while IFS= read -r fil; do
        local repo
        repo="$(printf '%s' "${fil#./}" | cut -d/ -f1)"
        [ "$repo" != "$prosjekt" ] || continue
        { grep -E "^[A-Za-z0-9_.-]+[[:space:]]*=.*${group_re}[\":][a-z0-9-]+" "$fil" || true; } |
            sed -E "s/^([A-Za-z0-9_.-]+)[[:space:]]*=.*${group_re}[\":]+([a-z0-9-]+).*/${repo}|\1|\2/"
    done < <(find . -type d \( -name build -o -name .git \) -prune -o -type f -name 'libs.versions.toml' -print)

    # settings.gradle.kts: library("alias", "group", "artefakt")
    while IFS= read -r fil; do
        local repo
        repo="$(printf '%s' "${fil#./}" | cut -d/ -f1)"
        [ "$repo" != "$prosjekt" ] || continue
        { grep -E "library\(\"[A-Za-z0-9_.-]+\",[[:space:]]*\"${group_re}\"" "$fil" || true; } |
            sed -E "s/.*library\(\"([A-Za-z0-9_.-]+)\",[[:space:]]*\"${group_re}\",[[:space:]]*\"([a-z0-9-]+)\".*/${repo}|\1|\2/"
    done < <(find . -type d \( -name build -o -name .git \) -prune -o -type f \( -name 'settings.gradle.kts' -o -name 'settings.gradle' \) -print)
}

# Modulene bibliotekprosjektet publiserer, hentet fra include(...) i settings.gradle.kts
publiserte_moduler() {
    local prosjekt="$1"
    sed -nE '/^include\(/,/^\)/p' "$prosjekt/settings.gradle.kts" |
        grep -Eo '"[A-Za-z0-9:_-]+"' | tr -d '"' | sort -u
}

skriv_rapport() {
    local prosjekt="$1" group="$2" bruksfil="$3" utfil="$4"

    {
        printf '# Bruk av bibliotekene i %s\n\n' "$prosjekt"
        printf 'Generert av `generer-biblioteksbruk.sh` %s. Ikke rediger for hånd.\n\n' "$(date '+%d.%m.%Y')"
        printf 'Maven-group: `%s`. Modulnavn er stien i metarepoet, med `:` som skilletegn.\n' "$group"
        printf 'Interne avhengigheter mellom modulene i %s er tatt med i egen tabell.\n\n' "$prosjekt"

        printf '## Bibliotek til modul\n\n'
        printf '| Bibliotek | Antall moduler | Moduler |\n| --- | --- | --- |\n'
        awk -F'\t' '$1 == "ekstern" { print $3 "\t" $2 }' "$bruksfil" | sort -u |
            awk -F'\t' '{ m[$1] = m[$1] ", " $2; n[$1]++ }
                        END { for (a in m) { sub(/^, /, "", m[a]); printf "%d\t| %s | %d | %s |\n", n[a], a, n[a], m[a] } }' |
            sort -k1,1nr -k2,2 | cut -f2-

        printf '\n## Modul til bibliotek\n\n'
        printf '| Modul | Biblioteker |\n| --- | --- |\n'
        awk -F'\t' '$1 == "ekstern" { print $2 "\t" $3 }' "$bruksfil" | sort -u |
            awk -F'\t' '{ b[$1] = b[$1] ", " $2 }
                        END { for (m in b) { sub(/^, /, "", b[m]); printf "| %s | %s |\n", m, b[m] } }' |
            sort

        printf '\n## Interne avhengigheter i %s\n\n' "$prosjekt"
        printf '| Modul | Avhenger av |\n| --- | --- |\n'
        awk -F'\t' -v p="$prosjekt" '$1 == "intern" { sub("^" p ":", "", $2); print $2 "\t" $3 " (" $4 ")" }' "$bruksfil" | sort -u |
            awk -F'\t' '{ b[$1] = b[$1] ", " $2 }
                        END { for (m in b) { sub(/^, /, "", b[m]); printf "| %s | %s |\n", m, b[m] } }' |
            sort

        printf '\n## Moduler uten eksterne brukere\n\n'
        local bare_internt helt_ubrukte
        bare_internt="$(comm -12 \
            <(comm -23 <(publiserte_moduler "$prosjekt") <(awk -F'\t' '$1 == "ekstern" { print $3 }' "$bruksfil" | sort -u)) \
            <(awk -F'\t' '$1 == "intern" { print $3 }' "$bruksfil" | sort -u) | paste -sd, - | sed 's/,/, /g')"
        helt_ubrukte="$(comm -23 <(publiserte_moduler "$prosjekt") \
            <(awk -F'\t' '{ print $3 }' "$bruksfil" | sort -u) | paste -sd, - | sed 's/,/, /g')"

        if [ -n "$bare_internt" ]; then
            printf 'Brukes bare av andre moduler i %s: %s.\n\n' "$prosjekt" "$bare_internt"
        else
            printf 'Ingen moduler brukes utelukkende internt.\n\n'
        fi
        if [ -n "$helt_ubrukte" ]; then
            printf 'Ingen treff verken i andre komponenter eller internt i %s: %s.\n' "$prosjekt" "$helt_ubrukte"
        else
            printf 'Alle publiserte moduler har minst én bruker.\n'
        fi
    } > "$utfil"
}

for oppsett in "${PROSJEKTER[@]}"; do
    prosjekt="${oppsett%%|*}"
    group="${oppsett##*|}"

    if [ ! -d "$prosjekt" ]; then
        printf 'Hopper over %s: katalogen finnes ikke i metarepoet.\n' "$prosjekt" >&2
        continue
    fi

    bruksfil="$(mktemp)"
    trap 'rm -f "$bruksfil"' EXIT

    samle_bruk "$prosjekt" "$group" | sort -u > "$bruksfil"
    skriv_rapport "$prosjekt" "$group" "$bruksfil" "docs/biblioteksbruk-$prosjekt.md"
    printf 'Skrev biblioteksbruk-%s.md (%s treff)\n' "$prosjekt" "$(wc -l < "$bruksfil" | tr -d ' ')"

    rm -f "$bruksfil"
    trap - EXIT
done
