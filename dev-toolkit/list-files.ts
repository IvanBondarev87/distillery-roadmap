import path from 'path';
import webpack from 'webpack';
import { IFs } from 'memfs';

function listDirFiles(_fs: IFs, dirname: string) {
  const files: { name: string, ctime: number }[] = [];

  for (const itemName of _fs.readdirSync(dirname) as string[]) {
    const itemPath = path.join(dirname, itemName);

    const stat = _fs.statSync(itemPath);
    if (stat.isDirectory()) {

      const dirFiles = listDirFiles(_fs, itemPath);
      dirFiles.forEach(f => f.name = itemName + '/' + f.name);
      files.push(...dirFiles);

    } else files.push({
      name: itemName,
      ctime: stat.ctimeMs
    });
  }

  return files;
}

function listFiles(compiler: webpack.Compiler) {
  const { outputFileSystem, outputPath } = compiler;

  return listDirFiles(outputFileSystem as IFs, outputPath)
    .sort((f1, f2) => f1.ctime - f2.ctime)
    .map(f => f.name);
}

export default listFiles;
