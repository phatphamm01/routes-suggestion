import glob from 'fast-glob';
import * as vscode from 'vscode';
import { IGNORE } from '../constants/ignore';

export const getMonorepos = async () => {
  const monorepos = new Map<string, string>();
  const allPackageFile = glob.stream(`**/package.json`, {
    cwd: vscode.workspace.workspaceFolders?.[0].uri.path,
    ignore: IGNORE,
  });

  for await (const entry of allPackageFile) {
    if (typeof entry === 'string') {
      const str = entry.replace(/(package\.json)|(\/package\.json)/g, '');

      if (str === '') continue;
      const allRouterFolders = await glob(`**/routes`, {
        cwd: vscode.workspace.workspaceFolders?.[0].uri.path + `/${str}`,
        onlyDirectories: true,
        ignore: IGNORE,
      });

      const routerFolder = allRouterFolders?.[0];
      if (!routerFolder) continue;

      monorepos.set(str, `${str}/${routerFolder}`);
    }
  }

  return monorepos;
};
