#!/usr/bin/env bash

if ! test -f ./gradlew; then
  exit 0
fi

./gradlew dependencies $(./gradlew -q projects | grep -Fe '--- Project' | sed -n "s/.*':\([^']*\)'.*/:\1:dependencies/p") > gradle_deps.txt
