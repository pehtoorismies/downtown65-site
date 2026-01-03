#!/bin/bash

find ./drizzle -name migration.sql -print0 | xargs -0 -I{} bash -c 'cp "{}" "./drizzle_flat/$(basename $(dirname {})).sql"'