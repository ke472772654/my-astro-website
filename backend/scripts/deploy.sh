#!/usr/bin/env sh
set -eu

release_dir="$1"
current_link="$2"

test -f "$release_dir/index.html"

ln -sfn "$release_dir" "${current_link}.next"
mv -Tf "${current_link}.next" "$current_link"
