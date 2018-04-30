GENERATED := examples.bundle.js render.js

.PHONY: clean, engine, build

example.bundle.js: build/example.js
	yarn run webpack


sim.braid: game_preamble.braid data.braid game_state.braid game_engine.braid
	rm -f sim.braid
	cat node_modules/braid-glrt/preamble.braid $^ > sim.braid

engine: sim.braid render.braid
	cat sim.braid render.braid | braid -cmw

render.js: sim.braid render.braid
	cat $^ | braid -cmw > $@

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

build: $(wildcard *.ts)
	yarn run tsc --p tsdataconfig.json

clean:
	rm -rf build/ node_modules/ $(GENERATED)
