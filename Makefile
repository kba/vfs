MAKEFLAGS += --no-print-directory --silent
REPORTER = spec

bootstrap:
	./node_modules/.bin/lerna bootstrap --loglevel silly

test\:all:
	$(MAKE) test:vfs-file test:vfs-zip test:vfs-tar

.PHONY: %
test\:%: %
	-$(MAKE) bootstrap
	tap -R$(REPORTER) "$</"*.test.js "$</"*.test.js
