GENERATED := examples.bundle.js render.js

.PHONY: clean, engine, parser

example.bundle.js: build/example.js
	yarn run webpack

data/data.braid: parser
	yarn run compile-data data/data.json

sim.braid: data/data.braid game_state.braid game_engine.braid
	rm -f sim.braid
	cat preamble.braid $^ > sim.braid

engine: sim.braid render.braid
	cat sim.braid render.braid | braid -cmw

render.js: sim.braid render.braid
	cat $^ | braid -cmw > $@

bug.js: bugtest.braid
	cat preamble.braid $^ | braid -cmw > $@

bug: example.ts bug.js
	yarn run tsc --p bug_tsconfig.json

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

build/data_compiler.js: data_compiler.ts
	yarn run tsc --p data_compiler_tsconfig.json

parser: data_compiler.ts build/data_compiler.js
	yarn run tsc --p data_compiler_tsconfig.json

clean:
	rm -rf build/ node_modules/ $(GENERATED)
