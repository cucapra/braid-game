GENERATED := examples.bundle.js render.js

.PHONY: clean

example.bundle.js: build/example.js
	yarn run webpack

render.js: render.braid
	cat ../braid/glrt/preamble.braid $^ | braid -cmw > $@

build/example.js: $(wildcard *.ts) render.js
	yarn run tsc

clean:
	rm -rf build/ node_modules/ $(GENERATED)