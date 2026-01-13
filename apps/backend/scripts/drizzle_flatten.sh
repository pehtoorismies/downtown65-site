#!/bin/bash

rm -rf ./drizzle_flat
mkdir -p ./drizzle_flat
find ./drizzle -name migration.sql -print0 | xargs -0 -I{} bash -c 'cp "{}" "./drizzle_flat/$(basename $(dirname {})).sql"'

echo "Flattened migrations copied to ./drizzle_flat"