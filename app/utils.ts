import { exists } from "@std/fs";
import * as Path from "@std/path";

interface Package {
  name: string;
  version: string;
  buildNumber: string;
  arch: string[];
}

export function pkgFileNames(pkg: Package): string[] {
  const fileNames: string[] = [];

  for (const arch of pkg.arch) {
    fileNames.push(
      `${pkg.name}-${pkg.version}-${pkg.buildNumber}-${arch}.pkg.tar.zst`,
    );
  }

  return fileNames;
}

export async function getPackageDistFile(path: string, pkg: Package) {
  const fileNames = pkgFileNames(pkg);
  for (const fileName of fileNames) {
    const fp = `${path}/${fileName}`;

    if (await exists(fp)) {
      return fileName;
    }
  }
  return null;
}

function createExtractFieldRegex(field: string) {
  const reg = new RegExp(`${field}=([^\n]+)`, "gm");
  return reg;
}

export async function readPackageBuild(path: string) {
  const pkgPath = `${path}/PKGBUILD`;
  const pkgString = await Deno.readTextFile(pkgPath);

  const name = createExtractFieldRegex("pkgname").exec(pkgString)![1].replace(
    /["']/gm,
    "",
  ).trim();

  const version = createExtractFieldRegex("pkgver").exec(pkgString)![1];
  const relno = createExtractFieldRegex("pkgrel").exec(pkgString)![1];
  const arch = createExtractFieldRegex("arch").exec(pkgString)![1].replace(
    /[\(\)]/gm,
    "",
  ).replace(/['"]/gm, "").split(" ");

  return {
    name,
    version,
    buildNumber: relno,
    arch,
  } as Package;
}

export interface BuildRequest {
  name: string;
  workPath: string;
  databasePath: string;
  info: Package;
}

export async function buildArchPackage(
  { databasePath, name: pkgName, info: pkgInfo, workPath }: BuildRequest,
) {
  const databaseDir = Path.dirname(databasePath);
  const databaseFile = Path.basename(databasePath);

  if (await getPackageDistFile(databaseDir, pkgInfo)) {
    console.info("Skipping:", pkgName);
    return;
  }

  console.log("Building package:", pkgName);
  const ret = await Deno.spawnAndWait("makepkg", {
    cwd: workPath,
    args: ["-s", "--install", "--clean", "--noconfirm"],
  });

  if (!ret.success) {
    throw new Error(
      `Failed to build package: ${new TextDecoder().decode(ret.stderr)}`,
    );
  }

  const distFile = await getPackageDistFile(workPath, pkgInfo);

  if (!distFile) {
    throw new Error(
      "Could not find destination file " + JSON.stringify(pkgInfo),
    );
  }

  // Move file to database
  const status = await Deno.spawnAndWait("sudo", {
    args: ["mv", `${workPath}/${distFile}`, `${databaseDir}/${distFile}`],
  });

  if (!status.success) {
    throw new Error(
      `Failed to move package: ${new TextDecoder().decode(status.stderr)}`,
    );
  }

  // Add to database
  const addStatus = await Deno.spawnAndWait("repo-add", {
    cwd: databaseDir,
    args: ["-n", "-p", databaseFile, distFile],
  });

  if (!addStatus.success) {
    throw new Error(
      `Failed to add package to database: ${
        new TextDecoder().decode(addStatus.stderr)
      }`,
    );
  }

  console.log(`Successfully built and added ${pkgName} to database`);
}
