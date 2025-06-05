default: build

all: test

test: build
	cargo test

build:
	stellar contract build
	@ls -l ../../target/wasm32-unknown-unknown/release/academy_badge_tracker.wasm

fmt:
	cargo fmt --all

clean:
	cargo clean
