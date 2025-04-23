.PHONY: dev build

dev:
	cd life-game-core && wasm-pack build --release --target web
	npm install
	npm run dev

build:
	cd life-game-core && wasm-pack build --release --target web
	npm install
	npm run build
