MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
PATH := ./test/node_modules/.bin:$(PATH)
REPORTER = tap
TAP = tap -R$(REPORTER)

help:
	@echo "Targets"
	@echo ""
	@echo "test      Run all tests"
	@echo "test-one  Run only the test given by TEST variable"
	@echo "doc       Regenerate the API doc in README (requires shinclude)"

bootstrap:
	lerna bootstrap --loglevel info

.PHONY: test
test:
	$(MAKE) bootstrap
	$(TAP) test/*.test.js test/*/*.test.js

test-one:
	$(MAKE) bootstrap
	tap -R$(REPORTER) $(TEST)

.PHONY: doc doc/watch
doc:
	shinclude -c xml -i README.md

doc/watch:
	nodemon -w . -e 'js,md' -x make doc

doc/serve:
	grip
