import { Config } from "./config.ts";
import { buildArchPackage, readPackageBuild } from "./utils.ts";
const AUR_URL = "https://aur.archlinux.org";

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

export async function buildAurPackage(config: Config, pkgName: string) {
  const workPath = `${config.workdir}/${pkgName}`;

  try {
    await Deno.remove(workPath, {
      recursive: true,
    });
  } catch {}

  await ensurePath(workPath);

  const gitUrl = `${AUR_URL}/${pkgName}.git`;
  console.log(`Cloning ${gitUrl} into ${workPath}`);
  const git = await Deno.spawnAndWait("git", {
    args: ["clone", gitUrl, workPath],
  });

  if (!git.success) {
    throw new Error(
      `Could not clone: ${gitUrl}: ${new TextDecoder().decode(git.stderr)}`,
    );
  }

  const pkgInfo = await readPackageBuild(workPath);

  await buildArchPackage({
    info: pkgInfo,
    name: pkgName,
    workPath,
    databasePath: config.databaseDir,
  });
  // const databaseDir = Path.dirname(config.databaseDir);
  // const databaseFile = Path.basename(config.databaseDir);

  // if (await getPackageDistFile(databaseDir, pkgInfo)) {
  //   console.info("Skipping:", pkgName);
  //   return;
  // }

  // // Build package
  // console.log(`Building package ${pkgName} in ${workPath}`);
  // const ret = await Deno.spawnAndWait("makepkg", {
  //   cwd: workPath,
  //   args: ["-s", "--install", "--clean", "--noconfirm"],
  // });

  // if (!ret.success) {
  //   throw new Error(
  //     `Failed to build package: ${new TextDecoder().decode(ret.stderr)}`,
  //   );
  // }

  // const distFile = await getPackageDistFile(workPath, pkgInfo);

  // if (!distFile) {
  //   throw new Error(
  //     "Could not find destination file " + JSON.stringify(pkgInfo),
  //   );
  // }

  // // Move file to database
  // const status = await Deno.spawnAndWait("sudo", {
  //   args: ["mv", `${workPath}/${distFile}`, `${databaseDir}/${distFile}`],
  // });

  // if (!status.success) {
  //   throw new Error(
  //     `Failed to move package: ${new TextDecoder().decode(status.stderr)}`,
  //   );
  // }

  // // Add to database
  // const addStatus = await Deno.spawnAndWait("repo-add", {
  //   cwd: databaseDir,
  //   args: ["-n", "-p", databaseFile, distFile],
  // });

  // if (!addStatus.success) {
  //   throw new Error(
  //     `Failed to add package to database: ${
  //       new TextDecoder().decode(addStatus.stderr)
  //     }`,
  //   );
  // }

  // console.log(`Successfully built and added ${pkgName} to database`);
}
