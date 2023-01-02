import Regex from 'becke-ch--regex--s0-0-v1--base--pl--lib';
import * as vscode from 'vscode';
import { DEFAULT_REGEX } from '../constants/default-regex';
import { EXTENSION_NAME } from '../constants/name';

export interface DocumentClassList {
  range: {
    start: vscode.Position;
    end: vscode.Position;
  };
}

export async function findClassLists(
  doc: vscode.TextDocument,
  position: vscode.Position
): Promise<DocumentClassList[] | undefined> {
  try {
    const settings = vscode.workspace.getConfiguration(EXTENSION_NAME);
    let { regexClass: regexes } = settings;
    regexes = [...DEFAULT_REGEX, ...regexes];

    const positionOffset = doc.offsetAt(position);

    const searchRange: vscode.Range = new vscode.Range(
      doc.positionAt(Math.max(0, positionOffset - 1000)),
      doc.positionAt(positionOffset + 1000)
    );

    const text = doc.getText(searchRange);

    const result: DocumentClassList[] = [];

    for (let i = 0; i < regexes.length; i++) {
      const [containerRegexString, classRegexString] = Array.isArray(regexes[i])
        ? regexes[i]
        : [regexes[i]];

      const containerRegex = new Regex(containerRegexString, 'g');
      let containerMatch: ReturnType<Regex['exec']>;

      while ((containerMatch = containerRegex.exec(text)) !== null) {
        const searchStart = doc.offsetAt(searchRange.start);
        const matchStart = searchStart + containerMatch.index[1];
        const matchEnd = matchStart + containerMatch[1].length;
        const cursor = doc.offsetAt(position);
        if (cursor >= matchStart && cursor <= matchEnd) {
          if (classRegexString) {
            const classRegex = new Regex(classRegexString, 'g');
            let classMatch: ReturnType<Regex['exec']>;

            while ((classMatch = classRegex.exec(containerMatch[1])) !== null) {
              const classMatchStart = matchStart + classMatch.index[1];
              const classMatchEnd = classMatchStart + classMatch[1].length;
              result.push({
                range: {
                  start: doc.positionAt(classMatchStart),
                  end: doc.positionAt(classMatchEnd),
                },
              });
            }
          } else {
            result.push({
              range: {
                start: doc.positionAt(matchStart),
                end: doc.positionAt(matchEnd),
              },
            });
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.log(`findClassLists failed, error == `, error);
  }
}
