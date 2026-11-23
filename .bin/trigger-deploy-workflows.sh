#!/usr/bin/env bash
#
# Trigger manuelt alle workflows på main som bygger en JDK-app og deployer til både dev og prod.
# Formålet er å få nye Chainguard-images ut i JDK-appene: base-imaget hentes på nytt når appen
# bygges, så en ny bygg og deploy gir appen siste versjon av imaget.
#
# Skriptet går gjennom repoene som er sjekket ut i sas-meta, og trigger en workflow
# (gh workflow run --ref main) når den
#   - kan startes manuelt (workflow_dispatch),
#   - bygger en JDK-app (bygg-image-med-jib.yml, bygg-modul-image-med-jib.yml eller actions/setup-java),
#   - deployer til dev-gcp/dev-fss og prod-gcp/prod-fss (environment: eller CLUSTER:).
#
# Før du kjører:
#   Skriptet ser bare repoer som er sjekket ut lokalt, og leser workflow-filene slik de ligger lokalt.
#   Sjekk derfor at det ikke har kommet nye repoer siden sist, og at alt er oppdatert:
#     ./oppdater_metaoppsett.sh   # henter repoer der tbd er owner inn i .meta.yaml
#     meta git update             # cloner nye repoer
#     meta git pull               # oppdaterer workflow-filene
#   Kjør så med --dry-run og se over listen før du trigger.
#
# Bruk (fra hvor som helst):
#   .bin/trigger-deploy-workflows.sh            # viser hva som trigges og ber om bekreftelse
#   .bin/trigger-deploy-workflows.sh --dry-run  # viser bare hva som ville blitt trigget
#   .bin/trigger-deploy-workflows.sh --yes      # trigger uten å spørre
#
# Krever gh (GitHub CLI) innlogget med tilgang til å kjøre workflows i repoene.

set -euo pipefail

cd "$(dirname "$0")/.."

dry_run=false
assume_yes=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=true ;;
    --yes|-y) assume_yes=true ;;
    *) echo "Ukjent argument: $arg" >&2; exit 1 ;;
  esac
done

command -v gh >/dev/null || { echo "Fant ikke gh (GitHub CLI)" >&2; exit 1; }

is_jdk_deploy_workflow() {
  local file="$1"
  grep -q '^[[:space:]]*workflow_dispatch:' "$file" \
    && grep -qE 'bygg-(modul-)?image-med-jib\.yml|actions/setup-java' "$file" \
    && grep -qE '(environment|CLUSTER):[[:space:]]*dev-(gcp|fss)' "$file" \
    && grep -qE '(environment|CLUSTER):[[:space:]]*prod-(gcp|fss)' "$file"
}

github_repo() {
  local url
  url=$(git -C "$1" remote get-url origin 2>/dev/null) || return 1
  url="${url%.git}"
  url="${url//://}"
  echo "$(basename "$(dirname "$url")")/$(basename "$url")"
}

targets=()
for dir in */; do
  dir="${dir%/}"
  [[ -d "$dir/.git" && -d "$dir/.github/workflows" ]] || continue
  repo=$(github_repo "$dir") || continue
  for file in "$dir"/.github/workflows/*.y*ml; do
    [[ -f "$file" ]] || continue
    if is_jdk_deploy_workflow "$file"; then
      targets+=("$repo $(basename "$file")")
    fi
  done
done

if [[ ${#targets[@]} -eq 0 ]]; then
  echo "Fant ingen workflows å trigge."
  exit 0
fi

echo "Workflows som trigges på main (${#targets[@]}):"
printf '  %s\n' "${targets[@]}"

$dry_run && exit 0

if ! $assume_yes; then
  read -r -p "Trigge alle? [y/N] " svar
  [[ "$svar" =~ ^[yYjJ]$ ]] || { echo "Avbrutt."; exit 1; }
fi

feilet=()
for target in "${targets[@]}"; do
  read -r repo workflow <<<"$target"
  if gh workflow run "$workflow" --repo "$repo" --ref main; then
    echo "✅ $repo $workflow"
  else
    echo "❌ $repo $workflow"
    feilet+=("$target")
  fi
done

if [[ ${#feilet[@]} -gt 0 ]]; then
  echo
  echo "Feilet (${#feilet[@]}):"
  printf '  %s\n' "${feilet[@]}"
  exit 1
fi
