#!/bin/bash

# Configuration
pkg_scope="kits"      # NPM scope (e.g., @kits/postmark)
pkg_dir="./kits"      # Output directory for built WASM packages
crates_dir="./crates" # Source directory where Rust crates live

# Find all crates that have Cargo.toml
pkgs=()
for dir in "$crates_dir"/*/; do
	if [ -f "$dir/Cargo.toml" ]; then
		pkgs+=("$(basename "$dir")")
	fi
done

echo "📦 Found crates with Cargo.toml: ${pkgs[*]}"
echo

# Build all Rust code in the workspace
echo "🔧 Building Rust workspace..."

cargo build --workspace

for pkg in "${pkgs[@]}"; do
	crate_path="$crates_dir/$pkg"
	output_path=$(realpath --relative-to="$crate_path" "$pkg_dir/$pkg")

	rm -rf "$output_path"
	echo "📦 Building package: $pkg"

	wasm-pack build "$crate_path" \
		--target nodejs \
		--out-name index \
		--out-dir "$output_path" \
		--scope "$pkg_scope" \
		--reference-types \
		--weak-refs \
		--release
done

printf "Build completed!  All packages are in %s\n\n" "$pkg_dir"
echo

# Generate package.json with local dependencies

package_json="package.json"
tmp_json="package.tmp.json"
local_deps_json="local-deps.json"

# Generate local dependencies JSON
echo '{' >"$local_deps_json"
first=true
for dir in "$pkg_dir"/*/; do
	[ -d "$dir" ] || continue
	pkg=$(basename "$dir")
	if [ "$first" = true ]; then
		first=false
	else
		echo ',' >>"$local_deps_json"
	fi
	echo "  \"@kits/$pkg\": \"file:kits/$pkg\"" >>"$local_deps_json"
done

echo '' >>"$local_deps_json"
echo '}' >>"$local_deps_json"

echo "Generated local deps:"
cat "$local_deps_json"
echo

# Merge local deps into package.json with sorting
jq --slurpfile local "$local_deps_json" '
  .dependencies += $local[0] |
  .dependencies |= (to_entries | sort_by(.key) | from_entries)
' "$package_json" >"$tmp_json"

mv "$tmp_json" "$package_json"
rm "$local_deps_json"
echo "Merged and sorted dependencies in $package_json"

# Run yarn install
echo "Running yarn install..."

corepack yarn install
