import * as vscode from 'vscode';
import { SUPPORT_LANGUAGE } from './constants/support-language';
import { findClassLists } from './utils/findClassLists';
import { formatNameToSnippet } from './utils/formatNameToSnippet';
import { formatOutput } from './utils/formatOutput';
import { getMonorepo } from './utils/getMonorepo';
import { getMonorepos } from './utils/getMonorepos';
import { getFoldersInBaseUrl } from './utils/searchFileAndFolder';

export async function activate(context: vscode.ExtensionContext) {
  const monorepos = await getMonorepos();

  const provider = vscode.languages.registerCompletionItemProvider(
    SUPPORT_LANGUAGE,
    {
      async provideCompletionItems(
        doc: vscode.TextDocument,
        position: vscode.Position
      ) {
        try {
          const regexMatch = await findClassLists(doc, position);
          if (!regexMatch) return;
          const valueWorkSpace = getMonorepo(doc, monorepos);
          if (!valueWorkSpace) return;

          const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
          const allPath = await getFoldersInBaseUrl(
            workspaceFolder!,
            valueWorkSpace
          );

          const nameToSnippet = formatNameToSnippet(allPath);
          return formatOutput(regexMatch, nameToSnippet);
        } catch (error) {
          console.log('error == ', error);
        }
      },
    }
  );

  context.subscriptions.push(provider);
}
