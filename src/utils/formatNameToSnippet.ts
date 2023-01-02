import { FileInfo } from './searchFileAndFolder';

export type SnippetData = {
  name: string;
  snippet: string;
};

export const formatNameToSnippet = (
  allPath: (FileInfo & {
    name: string;
  })[]
): Set<SnippetData> =>
  new Set(
    allPath.flat(Infinity).map((value) => {
      let flag = 1;
      return {
        name: value.name,
        snippet: value.name
          .split('/')
          .map((str, index) =>
            str.match(/^\$/) ? `\${${flag++}|${str.replace(/^\$/, '')}|}` : str
          )
          .join('/'),
      };
    })
  );
