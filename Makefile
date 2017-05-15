MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
PATH := ./test/node_modules/.bin:$(PATH)
REPORTER = tap
TAP = tap -R$(REPORTER)

bootstrap:
	lerna bootstrap --loglevel info

.PHONY: test
test:
	$(MAKE) bootstrap
	$(TAP) test/*.test.js test/*/*.test.js

TEST =
.PHONY: %
test-one: %
	$(MAKE) bootstrap
	tap -R$(REPORTER) $(TEST)
