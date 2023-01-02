import { join } from 'path';
import * as vscode from 'vscode';

export interface FilesExclude {
  [key: string]: string;
}
export interface FileInfo {
  file: string;
  isFile: boolean;
  documentExtension?: string;
}

function getDocumentExtension(file: string, fileStat: vscode.FileStat) {
  if (fileStat.type !== vscode.FileType.File) {
    return undefined;
  }

  const fragments = file.split('.');
  return fragments[fragments.length - 1];
}

export async function getChildrenOfPath(path: string) {
  try {
    const filesTubles = await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(path)
    );

    const files = filesTubles.map((fileTuble) => fileTuble[0]);

    const fileInfoList: FileInfo[] = [];

    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(
        vscode.Uri.file(join(path, file))
      );
      fileInfoList.push({
        file,
        isFile: fileStat.type === vscode.FileType.File,
        documentExtension: getDocumentExtension(file, fileStat),
      });
    }

    return fileInfoList;
  } catch (error) {
    return [];
  }
}

export async function getFoldersInBaseUrl(
  workfolder: vscode.WorkspaceFolder,
  baseUrl: string,
  name = ''
): Promise<(FileInfo & { name: string })[]> {
  try {
    const allFiles = await getChildrenOfPath(
      join(workfolder.uri.fsPath, baseUrl)
    );

    const getAllChildren = await allFiles.reduce(
      async (result: any = [], value) => {
        let fileName = value.file.replace(/(.tsx|.ts)/g, '');
        if (fileName === 'index') return result;
        if (fileName.match(/^__/)) {
          fileName = '';
        }

        const fullName = `${name ? `${name}` : ''}${
          fileName ? `/${fileName}` : ''
        }`;

        if (!value.isFile) {
          return [
            ...(await result),
            { ...value, name: fullName },
            ...(await getFoldersInBaseUrl(
              workfolder,
              baseUrl + `/${value.file}`,
              fullName
            )),
          ];
        }

        return [...(await result), { ...value, name: fullName }];
      },
      []
    );

    return getAllChildren;
  } catch (error) {
    console.log(`getFoldersInBaseUrl failed, error == `, error);
  }

  return [];
}
