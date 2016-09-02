function noop() { return null }

require.extensions['.jade'] = noop;
require.extensions['.css'] = noop;
require.extensions['.jpg'] = noop;
require.extensions['.svg'] = noop;
require.extensions['.scss'] = noop;
