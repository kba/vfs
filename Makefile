MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
REPORTER = spec

bootstrap:
	lerna bootstrap --loglevel silly

.PHONY: test
test:
	$(MAKE) bootstrap
	tap test/index.js

# .PHONY: %
# test\:%: %
#     $(MAKE) bootstrap
#     tap -R$(REPORTER) "$</"*.test.js "$</"*.test.js
