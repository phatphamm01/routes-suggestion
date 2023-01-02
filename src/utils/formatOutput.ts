import * as vscode from 'vscode';
import { DocumentClassList } from './findClassLists';
import { SnippetData } from './formatNameToSnippet';

export const formatOutput = (
  regexMatch: DocumentClassList[],
  nameToSnippet: Set<SnippetData>
) =>
  regexMatch.reduce(
    (result: any, value) => [
      ...result,
      ...Array.from(nameToSnippet).map((name) => {
        const completion = new vscode.CompletionItem(name.name);
        completion.insertText = new vscode.SnippetString(name.snippet);
        completion.range = new vscode.Range(value.range.start, value.range.end);

        return completion;
      }),
    ],
    []
  );
