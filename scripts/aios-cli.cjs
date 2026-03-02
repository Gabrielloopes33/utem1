"use strict";

import("../.aios-core/cli/index.js")
  .then(({ run }) => run(["node", "aios", ...process.argv.slice(2)]))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
