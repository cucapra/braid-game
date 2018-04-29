GENERATED := examples.bundle.js render.js

.PHONY: clean, engine

example.bundle.js: build/example.js
	yarn run webpack


test.braid: data.braid game_state.braid game_engine.braid
	rm -f test.braid
	cat node_modules/braid-glrt/preamble.braid data.braid game_state.braid game_engine.braid > test.braid

engine: test.braid
	cat test.braid | braid -cmw

render.js: render.braid
	cat node_modules/braid-glrt/preamble.braid data.braid game_state.braid game_engine.braid $^ | braid -cmw > $@

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

clean:
	rm -rf build/ node_modules/ $(GENERATED)
