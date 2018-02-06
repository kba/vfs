MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
PATH := ./test/node_modules/.bin:$(PATH)
REPORTER = tap
TAP = tap -R$(REPORTER)
VFS = file


# BEGIN-EVAL makefile-parser --make-help Makefile

help:
	@echo ""
	@echo "  Targets"
	@echo ""
	@echo "    test          Run all tests"
	@echo "    test-one      Run only the test given by TEST variable"
	@echo "    test-vfs      Test all vfs"
	@echo "    server        Run Server"
	@echo "    doc           Build the README and static site"
	@echo "    README        Regenerate the API doc in README (requires shinclude)"
	@echo "    README/watch  Continuosly rebuild README"
	@echo "    README/serve  Build README in browser"
	@echo "    site          Build site"
	@echo "    site/serve    Preview site"
	@echo "    site/deploy   Deploy updated static site"
	@echo "    gh-pages      Clone deployed site as 'gh-pages'"

# END-EVAL

bootstrap:
	lerna bootstrap --loglevel info
	touch -m test/fixtures/folder/lib/file3.png

.PHONY: test

# Run all tests
test:
	$(MAKE) bootstrap
	$(TAP) test/*.test.js test/*/*.test.js

# Run only the test given by TEST variable
test-one:
	$(MAKE) bootstrap
	tap -R$(REPORTER) $(TEST)

# Test all vfs
test-vfs:
	$(MAKE) bootstrap
	tap -R$(REPORTER) test/vfs/$(VFS).test.js

# Run Server
server:
	cd vfs-server && ./bin/vfs-server.js

.PHONY: doc doc/watch README.md site

# Build the README and static site
doc: README site gh-pages

# Regenerate the API doc in README (requires shinclude)
README:
	shinclude -c xml -i README.md

# Continuosly rebuild README
README/watch:
	nodemon -w . -e 'js,md' -x make doc

# Build README in browser
README/serve:
	grip

# Build site
site:
	mkdir -p doc
	for i in $(wildcard ./doc-src/*);do \
		shinclude -c xml $$i > doc/`basename $$i`; \
	done
	mkdocs build

site/watch:
	nodemon -w doc-src -e 'md' -x make site

# Preview site
site/serve:
	mkdocs serve

# Deploy updated static site
site/deploy:
	mkdocs gh-deploy

# Clone deployed site as 'gh-pages'
gh-pages:
	git clone --depth 1 --branch gh-pages https://github.com/kba/vfs gh-pages
