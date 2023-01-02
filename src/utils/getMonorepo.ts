import * as vscode from 'vscode';

export const getMonorepo = (
  doc: vscode.TextDocument,
  monorepos: Map<string, string>
) => {
  const [, valueWorkSpace] =
    [...monorepos].find(([name]) => doc.uri.fsPath.match(name)) || [];

  return valueWorkSpace;
};
