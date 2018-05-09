MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
PATH := ./test/node_modules/.bin:$(PATH)
REPORTER = tap
TAP = tap -R$(REPORTER)
VFS = file
SHELL = zsh
FIXTURE_SRC = test/fixtures
FIXTURE_DIR = /tmp/vfs-test-fixtures

export FIXTURE_DIR


# BEGIN-EVAL makefile-parser --make-help Makefile

help:
	@echo ""
	@echo "  Targets"
	@echo ""
	@echo "    test            Run all tests"
	@echo "    test-one        Run only the test given by TEST variable"
	@echo "    test-adapter    Test all vfs"
	@echo "    test-nyan        Terse test output"
	@echo "    server          Run Server"
	@echo "    doc             Build the README and static site"
	@echo "    README          Regenerate the API doc in README (requires shinclude)"
	@echo "    README/watch    Continuosly rebuild README"
	@echo "    README/serve    Build README in browser"
	@echo "    site            Build site"
	@echo "    site/serve      Preview site"
	@echo "    site/deploy     Deploy updated static site"
	@echo "    gh-pages        Clone deployed site as 'gh-pages'"
	@echo "    install-global  Install -g"

# END-EVAL

bootstrap:
	lerna bootstrap --loglevel info
	touch -m test/fixtures/folder/lib/file3.png
#
# Test
#


.PHONY: test

fixtures:
	mkdir -p $(FIXTURE_DIR)
	cp -r -n -t $(FIXTURE_DIR) $(FIXTURE_SRC)/*

# Run all tests
test: fixtures
	$(MAKE) bootstrap
	$(TAP) test/*.test.js test/*/*.test.js */*.test.js

# Run only the test given by TEST variable
test-one: fixtures
	$(MAKE) bootstrap
	tap -R$(REPORTER) $(TEST)

# Test all vfs
test-adapter: fixtures
	$(MAKE) bootstrap
	tap -R$(REPORTER) test/adapter/$(VFS).test.js

# Terse test output
test-nyan:
	@$(MAKE) test REPORTER=nyan SILENT=true 2>/tmp/vfs-test-stderr
	@cat /tmp/vfs-test-stderr

#
# Server
#

# Run Server
server:
	cd vfs-server && ./bin/vfs-server.js

#
# Doc
#

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

INSTALL_GLOBAL =  vfs-cli \
				  vfs-plugin-checksum
# Install -g
install-global:
	# lerna exec npm install -g
	for mod in $(INSTALL_GLOBAL);do \
		(cd $$mod && npm install -g); \
	done
