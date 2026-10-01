#!/usr/bin/env sh

gh api /teams/$(gh api /orgs/navikt/teams/tbd | jq -r '.id')/repos --paginate \
  | jq --sort-keys -r '{projects: [.[] | select(.archived == false and .name != "helse-sas-meta" and .name != "helsearbeidsgiver-bro-sykepenger" and .name != "vault-iac") | {(.name | ltrimstr("helse-") | ltrimstr("sykepenger-")):.ssh_url}] | add}' \
  | tee > .meta

{ cat .gitignore_base; jq -r '.projects | keys[] | "/" + .' .meta;  } > .gitignore

first_line=$(head -1 settings.gradle)
{
  echo "$first_line"
  echo ""
  jq -r '.projects | keys[]' .meta | while IFS= read -r dir; do
    if [ -f "$dir/build.gradle" ] || [ -f "$dir/build.gradle.kts" ]; then
      echo "includeBuild \"$dir\""
    fi
  done | sort
} > settings.gradle

