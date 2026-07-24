import { Config } from "./config.ts";
import { buildArchPackage, readPackageBuild } from "./utils.ts";
import * as Path from "@std/path";
import { cp } from "node:fs/promises";

async function ensurePath(path: string) {
  await Deno.mkdir(path, {
    recursive: true,
  });
}

// interface Package {
//   name: string;
//   version: string;
//   buildNumber: string;
//   arch: string[];
// }

// export function pkgFileNames(pkg: Package): string[] {
//   const fileNames: string[] = [];

//   for (const arch of pkg.arch) {
//     fileNames.push(
//       `${pkg.name}-${pkg.version}-${pkg.buildNumber}-${arch}.pkg.tar.zst`,
//     );
//   }

//   return fileNames;
// }

// // export async function checkPackage(directory: string, pkg: Package) {
// //   const fileNames = pkgFileNames(pkg);
// //   for (const fileName of fileNames) {
// //     const fp = `${config.databaseDir}/${fileName}`;

// //     if (await exists(fp)) {
// //       return true;
// //     }
// //   }
// //   return false;
// // }

// export async function getPackageDistFile(path: string, pkg: Package) {
//   const fileNames = pkgFileNames(pkg);
//   for (const fileName of fileNames) {
//     const fp = `${path}/${fileName}`;

//     if (await exists(fp)) {
//       return fileName;
//     }
//   }
//   return null;
// }

// function createExtractFieldRegex(field: string) {
//   const reg = new RegExp(`${field}=([^\n]+)`, "gm");
//   return reg;
// }

// export async function readPackage(path: string) {
//   const pkgPath = `${path}/PKGBUILD`;
//   const pkgString = await Deno.readTextFile(pkgPath);

//   const name = createExtractFieldRegex("pkgname").exec(pkgString)![1].replace(
//     /["']/gm,
//     "",
//   ).trim();

//   const version = createExtractFieldRegex("pkgver").exec(pkgString)![1];
//   const relno = createExtractFieldRegex("pkgrel").exec(pkgString)![1];
//   const arch = createExtractFieldRegex("arch").exec(pkgString)![1].replace(
//     /[\(\)]/gm,
//     "",
//   ).replace(/['"]/gm, "").split(" ");

//   return {
//     name,
//     version,
//     buildNumber: relno,
//     arch,
//   } as Package;
// }

export async function buildLocalPackage(config: Config, pkgPath: string) {
  const pkgName = Path.basename(pkgPath);

  const workPath = `${config.workdir}/${pkgName}`;

  try {
    await Deno.remove(workPath, {
      recursive: true,
    });
  } catch {}

  await cp(pkgPath, workPath, { recursive: true });

  const pkgInfo = await readPackageBuild(workPath);

  await buildArchPackage({
    info: pkgInfo,
    name: pkgName,
    workPath,
    databasePath: config.databaseDir,
  });
}
