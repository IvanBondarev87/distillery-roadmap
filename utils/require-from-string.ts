import Module from 'module';
import { runInThisContext } from 'vm';
import sourceMapSupport from 'source-map-support';
import { RawSourceMap } from 'source-map';
import pjson from '../package.json';

const sourceMapList = new Map<string, RawSourceMap>();
const replacer: any = `webpack://${pjson.name}/`;

sourceMapSupport.install({
  retrieveSourceMap: id => {
    const srcMap = sourceMapList.get(id);
    if (srcMap === undefined) return null;
    return {
      url: id,
      map: srcMap,
    };
  }
});

const cache: Record<string, Module> = {};

function _require(id: string) {
  const _module = cache[id];
  if (_module !== undefined) return _module.exports;
  return require(id);
}

function requireFromString<T = any>(code: string, id: string, sourceMap?: string) {
  const _module = new Module(id);
  cache[id] = _module;
  const wrappedCode = Module.wrap(code);
  const loadModule = runInThisContext(wrappedCode, { filename: id });
  loadModule(_module.exports, _require, _module, __filename, __dirname);

  if (sourceMap != null) {
    const srcMapObj = JSON.parse(sourceMap) as RawSourceMap;
    srcMapObj.sources = srcMapObj.sources.map(s => s.replace(replacer, ''));
    sourceMapList.set(id, srcMapObj);
  }

  return _module.exports as T;
}

export default requireFromString;

// import path from 'path';
// // @ts-expect-error
// const originalResolveFilename = Module._resolveFilename;
// // @ts-expect-error
// Module._resolveFilename = function (id: string, ...args: any[]) {
//   if (require.cache[id] !== undefined) return id;
//   return originalResolveFilename(id, ...args);
// };
// function createModuleFromString(src: string, id: string) {
//   const _module = new Module(id);
//   // @ts-expect-error
//   _module.paths = Module._nodeModulePaths(path.dirname(id));
//   // @ts-expect-error
//   _module._compile(src, id);
//   _module.filename = id;
//   require.cache[id] = _module;
//   return _module.exports;
// }