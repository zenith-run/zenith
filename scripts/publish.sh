#!/bin/bash

bun test
if [ $? -ne 0 ]; then
  echo "Tests failed, aborting publish"
  exit 1
fi

pnpm --no-git-checks --filter=@zenith-run/core publish
pnpm --no-git-checks --filter=@zenith-run/std publish
