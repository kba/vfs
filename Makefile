MAKEFLAGS += --no-print-directory --silent
REPORTER = spec

test\:all:
	$(MAKE) test:vfs-file test:vfs-zip test:vfs-tar

.PHONY: %
test\:%: %
	-$(MAKE) bootstrap
	-tap -R$(REPORTER) "$</"*.test.js "$</"*.test.js
