test:
	@NODE_ENV=test node node_modules/lab/bin/lab -m 10000
test-cov:
	@NODE_ENV=test node node_modules/lab/bin/lab -t 100
test-cov-html:
	@NODE_ENV=test node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-cov test-cov-html