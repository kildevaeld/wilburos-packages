import { parseArgs } from "@std/cli";
import { buildAurPackage } from "./build-aur-pkg.ts";
import { buildLocalPackage } from "./build-local-pkg.ts";
import type { Config } from "./config.ts";

function prinUsage() {
  console.log("Usage:");
  console.log("  wilbur-build [options] ...");
}

const args = parseArgs(Deno.args, {
  string: ["pkgs", "work", "database"],
  boolean: ["aur", "help"],
  alias: {
    aur: "a",
    help: "h",
    work: "w",
    database: "d",
  },
});

if (args.help) {
  prinUsage();
  Deno.exit(0);
}

const pkgNames = args._ as string[];

if (!args.work || !args.database) {
  console.log("Database and work path are rquired");
  Deno.exit(1);
}

const cfg: Config = {
  workdir: args.work,
  databaseDir: args.database,
};

if (args.aur) {
  for (const pkgName of pkgNames) {
    try {
      await buildAurPackage(cfg, pkgName);
    } catch (e) {
      console.error("Could not build:", pkgName);
      console.error(e);
    }
  }
} else {
  for (const pkgName of pkgNames) {
    try {
      await buildLocalPackage(cfg, pkgName);
    } catch (e) {
      console.error("Could not build:", pkgName);
      console.error(e);
    }
  }
}
