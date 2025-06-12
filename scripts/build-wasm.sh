#!/usr/bin/env bash

set -euo pipefail # Exit on error, undefined vars, pipe failures

# Configuration
pkg_scope="kits"      # NPM scope (e.g., @kits/postmark)
pkg_dir="./kits"      # Output directory for built WASM packages
crates_dir="./crates" # Source directory where Rust crates live

# Colors for better output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $*${NC}"; }
log_success() { echo -e "${GREEN}✅  $*${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $*${NC}"; }
log_error() { echo -e "${RED}❌  $*${NC}"; }

# Check prerequisites
check_prerequisites() {
	local missing_tools=()

	# Check for required tools
	if ! command -v wasm-pack &>/dev/null; then
		missing_tools+=("wasm-pack")
	fi

	if ! command -v jq &>/dev/null; then
		missing_tools+=("jq")
	fi

	if ! command -v cargo &>/dev/null; then
		missing_tools+=("cargo (Rust)")
	fi

	if [ ${#missing_tools[@]} -gt 0 ]; then
		log_error "Missing required tools: ${missing_tools[*]}"
		echo "Please install them and try again."
		exit 1
	fi
}

# Ensure directories exist
setup_directories() {
	mkdir -p "$pkg_dir"

	if [ ! -d "$crates_dir" ]; then
		log_error "Crates directory '$crates_dir' does not exist"
		exit 1
	fi
}

# Find all crates that have Cargo.toml
find_crates() {
	local crates=()

	if [ ! -d "$crates_dir" ]; then
		log_error "Crates directory '$crates_dir' not found"
		return 1
	fi

	for dir in "$crates_dir"/*/; do
		if [ -d "$dir" ] && [ -f "$dir/Cargo.toml" ]; then
			local crate_name
			crate_name=$(basename "$dir")
			crates+=("$crate_name")
		fi
	done

	if [ ${#crates[@]} -eq 0 ]; then
		log_error "No crates found with Cargo.toml in $crates_dir"
		return 1
	fi

	printf '%s\n' "${crates[@]}"
}

# Get currently installed local packages from package.json
get_installed_packages() {
	local package_json="package.json"

	[ ! -f "$package_json" ] && return 0

	echo "Looking for packages with scope '@$pkg_scope' and 'file:' prefix" >&2

	jq -r --arg scope "@$pkg_scope/" '
        .dependencies // {} |
        to_entries |
        map(select(.key | startswith($scope))) |
        map(.key | ltrimstr($scope)) |
        .[]
    ' "$package_json" 2>/dev/null

}

# Remove orphaned packages (packages that no longer have corresponding crates)
cleanup_orphaned_packages() {
	local -a current_crates=("$@")
	local -a installed_packages
	local package_json="package.json"

	if [ ! -f "$package_json" ]; then
		log_warning "No package.json found, skipping cleanup"
		return 0
	fi

	# Read installed packages into array
	mapfile -t installed_packages < <(get_installed_packages)

	if [ ${#installed_packages[@]} -eq 0 ]; then
		log_info "No $pkg_scope packages found in package.json"
		return 0
	else
		echo "Found ${#installed_packages[@]} packages:"
		printf '  - %s\n' "${installed_packages[@]}"
	fi

	local -a orphaned_packages=()
	local package

	# Find packages that don't have corresponding crates
	for package in "${installed_packages[@]}"; do
		local found=false
		for crate in "${current_crates[@]}"; do
			if [ "$package" = "$crate" ]; then
				found=true
				break
			fi
		done

		if [ "$found" = false ]; then
			orphaned_packages+=("$package")
		fi
	done

	if [ ${#orphaned_packages[@]} -eq 0 ]; then
		log_info "No orphaned packages found"
		return 0
	fi

	log_warning "Found orphaned packages: ${orphaned_packages[*]}"

	# Remove orphaned packages from package.json
	local temp_file
	temp_file=$(mktemp)

	# Build jq filter to remove orphaned packages
	local jq_filter='.'
	for package in "${orphaned_packages[@]}"; do
		jq_filter="$jq_filter | del(.dependencies[\"@$pkg_scope/$package\"])"
	done

	if jq "$jq_filter" "$package_json" >"$temp_file"; then
		mv "$temp_file" "$package_json"
		log_success "Removed orphaned packages from package.json"
	else
		log_error "Failed to remove orphaned packages from package.json"
		rm -f "$temp_file"
		return 1
	fi

	# Remove orphaned package directories
	for package in "${orphaned_packages[@]}"; do
		local package_dir="$pkg_dir/$package"
		if [ -d "$package_dir" ]; then
			log_info "Removing orphaned package directory: $package_dir"
			rm -rf "$package_dir"
		fi
	done
}

# Build a single package
build_package() {
	local pkg="$1"
	local crate_path="$crates_dir/$pkg"
	local output_path

	# Use absolute path for output to avoid issues with relative paths
	output_path=$(realpath "$pkg_dir/$pkg")

	log_info "Building package: $pkg"

	# Validate crate structure
	if [ ! -f "$crate_path/Cargo.toml" ]; then
		log_error "Cargo.toml not found in $crate_path"
		return 1
	fi

	# Clean previous build
	if [ -d "$output_path" ]; then
		log_info "Cleaning previous build: $output_path"
		rm -rf "$output_path"
	fi

	# Check if the crate has wasm-related dependencies
	if ! grep -q "wasm" "$crate_path/Cargo.toml" 2>/dev/null; then
		log_warning "Crate $pkg might not be configured for WASM (no 'wasm' found in Cargo.toml)"
	fi

	# Build with wasm-pack with better error handling
	local wasm_pack_args=(
		"$crate_path"
		--target nodejs
		--out-name index
		--out-dir "$output_path"
		--scope "$pkg_scope"
		--reference-types
		--weak-refs
	)

	# Add release flag if not in debug mode
	if [ "${DEBUG:-}" != "1" ]; then
		wasm_pack_args+=(--release)
	fi

	if wasm-pack build "${wasm_pack_args[@]}"; then
		log_success "Successfully built $pkg"

		# Verify the build output
		if [ ! -f "$output_path/package.json" ]; then
			log_error "Build succeeded but package.json not found in output"
			return 1
		fi

		return 0
	else
		log_error "Failed to build $pkg"

		# Clean up failed build
		if [ -d "$output_path" ]; then
			rm -rf "$output_path"
		fi

		return 1
	fi
}

# Build all packages
build_packages() {
	local -a pkgs=("$@")
	local -a failed_builds=()
	local pkg

	log_info "Building ${#pkgs[@]} packages..."
	echo

	for pkg in "${pkgs[@]}"; do
		if ! build_package "$pkg"; then
			failed_builds+=("$pkg")
		fi
		echo
	done

	if [ ${#failed_builds[@]} -gt 0 ]; then
		log_error "Failed to build packages: ${failed_builds[*]}"
		exit 1
	fi

	log_success "Build completed! All packages are in $pkg_dir"
}

# Update package.json with dependencies
update_package_json() {
	local -a pkgs=("$@")
	local package_json="package.json"

	if [ ! -f "$package_json" ]; then
		log_error "package.json not found"
		exit 1
	fi

	# Generate local dependencies object
	local local_deps
	local_deps=$(jq -n --arg scope "$pkg_scope" '
        reduce $ARGS.positional[] as $pkg ({};
            . + {"@\($scope)/\($pkg)": "file:kits/\($pkg)"}
        )
    ' --args "${pkgs[@]}")

	log_info "Generated local dependencies:"
	echo "$local_deps" | jq .
	echo

	# Backup original package.json
	cp "$package_json" "$package_json.bak"

	# Merge dependencies and sort
	if jq --argjson local "$local_deps" '
        .dependencies //= {} |
        .dependencies += $local |
        .dependencies |= (to_entries | sort_by(.key) | from_entries)
    ' "$package_json.bak" >"$package_json"; then
		rm "$package_json.bak"
		log_success "Updated and sorted dependencies in $package_json"
	else
		log_error "Failed to update package.json"
		mv "$package_json.bak" "$package_json"
		exit 1
	fi
}

# Detect package manager from package.json and lock files
detect_package_manager() {
	# First check packageManager field in package.json
	if [ -f "package.json" ]; then
		local package_manager
		package_manager=$(jq -r '.packageManager // empty' package.json 2>/dev/null)
		if [ -n "$package_manager" ]; then
			# Extract package manager name (e.g., "pnpm@8.0.0" -> "pnpm")
			echo "${package_manager%%@*}"
			return
		fi
	fi

	# Fallback detection based on lock files (order matters for preference)
	if [ -f "pnpm-lock.yaml" ]; then
		echo "pnpm"
	elif [ -f "bun.lockb" ]; then
		echo "bun"
	elif [ -f "yarn.lock" ]; then
		echo "yarn"
	else
		echo "npm"
	fi
}

# Install dependencies with the detected package manager
install_dependencies() {
	local package_manager
	package_manager=$(detect_package_manager)

	log_info "Installing dependencies with $package_manager..."

	case "$package_manager" in
	"pnpm")
		if command -v corepack &>/dev/null; then
			corepack pnpm install
		elif command -v pnpm &>/dev/null; then
			pnpm install
		else
			log_error "pnpm not found. Install it or use corepack."
			exit 1
		fi
		;;
	"yarn")
		if command -v corepack &>/dev/null; then
			corepack yarn install
		elif command -v yarn &>/dev/null; then
			yarn install
		else
			log_error "yarn not found. Install it or use corepack."
			exit 1
		fi
		;;
	"bun")
		if command -v bun &>/dev/null; then
			bun install
		else
			log_error "bun not found. Please install it first."
			exit 1
		fi
		;;
	*)
		if command -v npm &>/dev/null; then
			npm install
		else
			log_error "npm not found. Please install Node.js."
			exit 1
		fi
		;;
	esac
}

# Main execution
main() {
	log_info "Starting WASM build process..."

	# Check prerequisites
	check_prerequisites

	# Setup directories
	setup_directories

	# Find all crates
	local -a pkgs
	mapfile -t pkgs < <(find_crates)

	log_info "Found crates with Cargo.toml: ${pkgs[*]}"
	echo

	# Clean up orphaned packages first
	cleanup_orphaned_packages "${pkgs[@]}"
	echo

	# Build each package
	build_packages "${pkgs[@]}"
	echo

	# Update package.json
	update_package_json "${pkgs[@]}"
	echo

	# Install dependencies
	if install_dependencies; then
		echo
		log_success "🎉 All done! Your WASM packages are ready to use."
	else
		log_error "Dependency installation failed"
		exit 1
	fi
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 130' INT TERM

# Run main function
main "$@"
