#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$SCRIPT_DIR/.pull-state"

find_repos() {
    jq -r '.projects | keys[]' "$SCRIPT_DIR/.meta.yaml" | while IFS= read -r name; do
        if [ -d "$SCRIPT_DIR/$name/.git" ]; then
            echo "$SCRIPT_DIR/$name/"
        fi
    done
}

# Load saved SHAs from state file
declare -A saved_shas
if [ -f "$STATE_FILE" ]; then
    while IFS='=' read -r name sha; do
        [[ -n "$name" ]] && saved_shas["$name"]="$sha"
    done < "$STATE_FILE"
fi

# Pull all repos
just -f "$SCRIPT_DIR/justfile" pull-quiet

# Save new HEADs and collect new commits for printing
> "$STATE_FILE"
new_commits_found=false

while IFS= read -r repo; do
    name="$(basename "$repo")"
    new_sha="$(git -C "$repo" rev-parse HEAD 2>/dev/null || true)"
    [[ -z "$new_sha" ]] && continue

    echo "$name=$new_sha" >> "$STATE_FILE"

    old_sha="${saved_shas[$name]:-}"

    if [[ -z "$old_sha" ]]; then
        echo ""
        echo "┌─ $name (første gang)"
        git -C "$repo" log --oneline -10 | cat
        new_commits_found=true
    elif [[ "$old_sha" != "$new_sha" ]]; then
        echo ""
        echo "┌─ $name"
        git -C "$repo" log --oneline "$old_sha..$new_sha" | sed 's/^/│ /' | cat
        new_commits_found=true
    fi
done < <(find_repos)

if ! $new_commits_found; then
    echo ""
    echo "Ingen nye commits siden sist."
fi
