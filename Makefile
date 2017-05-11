MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
REPORTER = tap
TAP = tap -R$(REPORTER)

bootstrap:
	lerna bootstrap --loglevel info

.PHONY: test
test:
	$(MAKE) bootstrap
	$(TAP) test/*.test.js

# .PHONY: %
# test\:%: %
#     $(MAKE) bootstrap
#     tap -R$(REPORTER) "$</"*.test.js "$</"*.test.js
