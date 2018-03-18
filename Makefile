GENERATED := examples.bundle.js render.js

.PHONY: clean

example.bundle.js: build/example.js
	yarn run webpack

render.js: render.braid
	cat node_modules/braid-glrt/preamble.braid game_preamble.braid game_state.braid $^ | yarn run --silent braid -cmw > $@

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

clean:
	rm -rf build/ node_modules/ $(GENERATED)
