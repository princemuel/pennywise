#!/bin/bash

crates=("markd")

# Build all crates in the workspace
cargo build --workspace

for crate in "${crates[@]}"; do
  rm -rf ./crates/$crate/pkg
  wasm-pack build ./crates/$crate --target nodejs  --out-name index --scope libr
  # wasm-pack build ./crates/$crate --target nodejs --out-name index --scope libr
done

echo "Build completed!"

corepack yarn install
