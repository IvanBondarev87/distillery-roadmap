import path from 'path';
import webpack, { HotModuleReplacementPlugin } from 'webpack';
import { createFsFromVolume, Volume, IFs } from 'memfs';
import nodeExternals from 'webpack-node-externals';
import requireFromString, { RawSourceMap } from './require-from-string';
import listFiles from './list-files';
import hotUpdater from './emitter';
import { name as packageName } from '../package.json';

function getDerivedEntry(entry: webpack.Configuration['entry'], module: string) {
  if (entry instanceof Array) return [module, ...entry];
  if (entry instanceof Object) {
    const derivedEntry = {};
    const chunkList = Object.keys(entry);
    for (const chunkId of chunkList) {
      derivedEntry[chunkId] = getDerivedEntry(entry[chunkId], module);
    }
    return derivedEntry;
  };
  if (typeof entry === 'string') return [module, entry];
  throw new Error('Cannot merge entries.');
}

class WebpackOutput {

  [index: string]: any;
  
  private compiler: webpack.Compiler;
  private files: string[] = null;

  constructor(config: webpack.Configuration) {

    const derivedConfig: webpack.Configuration = {
      ...config,
      entry: getDerivedEntry(config.entry, './dev-toolkit/hot-update.ts'),
      plugins: [
        ...config.plugins,
        new HotModuleReplacementPlugin(),
      ],
      externals: [
        nodeExternals(),
        ({ context, request }, callback) => {
          if (context === __dirname && request === './emitter')
            callback(null, request);
          else callback();
        },
      ],
    };

    this.compiler = webpack(derivedConfig);
    this.compiler.outputFileSystem = createFsFromVolume(new Volume());
    this.compiler.watch({}, this.handleEmit.bind(this));
  }

  private readFile(filename: string) {
    
    const outputPath = this.compiler.outputPath;
    const outputFileSystem = this.compiler.outputFileSystem as IFs;
    const pathToFile = path.join(outputPath, filename);

    if (!outputFileSystem.existsSync(pathToFile)) return undefined;

    const buffer = outputFileSystem.readFileSync(pathToFile) as Buffer;
    return buffer.toString();
  }

  private loadModule(filename: string, id: string) {
    
    const code = this.readFile(filename);

    let sourceMap: RawSourceMap = null;
    if (path.extname(filename) === '.js') {
      const mapFile = this.readFile(filename + '.map');
      if (mapFile !== undefined) {
        sourceMap = JSON.parse(mapFile) as RawSourceMap;
        sourceMap.sources = sourceMap.sources.map(s => s.replace(`webpack://${packageName}/`, ''));
      }
    }

    return requireFromString(code, id, sourceMap);
  }

  private loadChunk(chunkId: string, stats: webpack.StatsCompilation) {
    const filename = stats.assetsByChunkName[chunkId][0];
    this[chunkId] = this.loadModule(filename, chunkId);
  };

  private handleEmit(error: Error, result: webpack.Stats) {

    if (error) return;

    const stats = result.toJson({ errors: true, groupAssetsByChunk: true });
    if (stats.errorsCount > 0) return;

    if (this.files === null) {

      const chunks = Object.keys(stats.assetsByChunkName);
      this.files = listFiles(this.compiler);
      for (const chunkId of chunks) this.loadChunk(chunkId, stats);

    } else {

      const currFiles = listFiles(this.compiler);
      const newFiles = currFiles.filter(f => !this.files.includes(f));
      this.files = currFiles;

      newFiles.filter(f => 
        f.endsWith('.hot-update.js')
        || f.endsWith('.hot-update.json')
      ).forEach(filename => this.loadModule(filename, './' + filename))

      hotUpdater.emit(
        'update chunks',
        this,
        (chunkId: string) => this.loadChunk(chunkId, stats)
      );

    }
  }

}

export default WebpackOutput;
