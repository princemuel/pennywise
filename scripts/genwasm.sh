#!/usr/bin/env bash

set -euo pipefail # Exit on error, undefined vars, pipe failures

# Configuration
pkg_scope="kits"      # NPM scope (e.g., @kits/postmark)
pkg_dir="./kits"      # Output directory for built WASM packages
crates_dir="./crates" # Source directory where Rust crates live

# Ensure directories exist
mkdir -p "$pkg_dir"

# Find all crates that have Cargo.toml
pkgs=()
for dir in "$crates_dir"/*/; do
	if [ -f "$dir/Cargo.toml" ]; then
		pkgs+=("$(basename "$dir")")
	fi
done

if [ ${#pkgs[@]} -eq 0 ]; then
	echo "❌ No crates found with Cargo.toml in $crates_dir"
	exit 1
fi

echo "📦 Found crates with Cargo.toml: ${pkgs[*]}"
echo

# Build each package
for pkg in "${pkgs[@]}"; do
	crate_path="$crates_dir/$pkg"
	output_path=$(realpath --relative-to="$crate_path" "$pkg_dir/$pkg")

	echo "📦 Building package: $pkg"

	# Clean previous build
	rm -rf "$output_path"

	# Build with wasm-pack
	if ! wasm-pack build "$crate_path" \
		--target nodejs \
		--out-name index \
		--out-dir "$output_path" \
		--scope "$pkg_scope" \
		--reference-types \
		--weak-refs \
		--release; then
		echo "❌ Failed to build $pkg"
		exit 1
	fi

	echo "✅ Successfully built $pkg"
done

printf "\n🎉 Build completed! All packages are in %s\n\n" "$pkg_dir"

# Generate package.json dependencies
package_json="package.json"

if [ ! -f "$package_json" ]; then
	echo "❌ package.json not found"
	exit 1
fi

# Check if jq is available
if ! command -v jq &>/dev/null; then
	echo "❌ jq is required but not installed"
	exit 1
fi

# Generate local dependencies object
local_deps=$(jq -n '
    reduce $ARGS.positional[] as $pkg ({};
        . + {"@'$pkg_scope'/\($pkg)": "file:kits/\($pkg)"}
    )
' --args "${pkgs[@]}")

echo "Generated local deps:"
echo "$local_deps" | jq .
echo

# Backup original package.json
cp "$package_json" "$package_json.bak"

# Merge dependencies and sort
if ! jq --argjson local "$local_deps" '
    .dependencies += $local |
    .dependencies |= (to_entries | sort_by(.key) | from_entries)
' "$package_json.bak" >"$package_json"; then
	echo "❌ Failed to update package.json"
	mv "$package_json.bak" "$package_json"
	exit 1
fi

rm "$package_json.bak"
echo "✅ Updated and sorted dependencies in $package_json"

# Detect package manager from package.json
detect_package_manager() {
	local package_manager
	if [ -f "package.json" ]; then
		package_manager=$(jq -r '.packageManager // empty' package.json 2>/dev/null)
		if [ -n "$package_manager" ]; then
			# Extract package manager name (e.g., "pnpm@8.0.0" -> "pnpm")
			echo "${package_manager%%@*}"
			return
		fi
	fi

	# Fallback detection based on lock files
	if [ -f "pnpm-lock.yaml" ]; then
		echo "pnpm"
	elif [ -f "yarn.lock" ]; then
		echo "yarn"
	elif [ -f "bun.lockb" ]; then
		echo "bun"
	else
		echo "npm"
	fi
}

# Install dependencies
package_manager=$(detect_package_manager)
echo "📥 Running $package_manager install..."

case "$package_manager" in
"pnpm")
	if ! corepack pnpm install; then
		echo "❌ pnpm install failed"
		exit 1
	fi
	;;
"yarn")
	if ! corepack yarn install; then
		echo "❌ yarn install failed"
		exit 1
	fi
	;;
"bun")
	if ! bun install; then
		echo "❌ bun install failed"
		exit 1
	fi
	;;
*)
	if ! npm install; then
		echo "❌ npm install failed"
		exit 1
	fi
	;;
esac

echo "🎉 All done! Your WASM packages are ready to use."
