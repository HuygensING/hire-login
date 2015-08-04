
#!/bin/sh

node_modules/.bin/watchify src/index.jsx \
  --detect-globals false \
  --extension=.jsx \
  --external classnames \
  --external react \
  --outfile 'node_modules/.bin/derequire > build/index.js' \
  --standalone HireFormsLogin \
  --transform [ babelify --plugins object-assign ] \
  --verbose