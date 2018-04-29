GENERATED := examples.bundle.js render.js

.PHONY: clean, engine

example.bundle.js: build/example.js
	yarn run webpack


sim.braid: data.braid game_state.braid game_engine.braid 
	rm -f sim.braid
	cat node_modules/braid-glrt/preamble.braid $^ > sim.braid

engine: sim.braid render.braid
	cat sim.braid render.braid | braid -cmw

render.js: sim.braid render.braid
	cat $^ | braid -cmw > $@

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

clean:
	rm -rf build/ node_modules/ $(GENERATED)
