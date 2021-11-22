import path from 'path';
import Module from 'module';
import { runInThisContext } from 'vm';
import sourceMapSupport from 'source-map-support';
import { RawSourceMap } from 'source-map-support/node_modules/source-map';

export {
  RawSourceMap
}

const isJSON = (id: string) => path.extname(id) === '.json';

const sourceMapList = new Map<string, RawSourceMap>();
sourceMapSupport.install({
  retrieveSourceMap: id => {
    const map = sourceMapList.get(id);
    if (map === undefined) return null;
    return {
      url: id,
      map,
    };
  }
});

const cache: Record<string, Module> = {};

function _require(id: string) {
  const _module = cache[id];
  if (_module !== undefined) return isJSON(id) ? _module : _module.exports;
  return require(id);
}

function requireFromString<T = any>(code: string, id: string, sourceMap: RawSourceMap) {

  if (isJSON(id)) {
    const json = JSON.parse(code);
    cache[id] = json;
    return json;
  }

  const _module = new Module(id);
  cache[id] = _module;
  const wrappedCode = Module.wrap(code);
  const loadModule = runInThisContext(wrappedCode, { filename: id });
  loadModule(_module.exports, _require, _module, __filename, __dirname);

  if (sourceMap != null) sourceMapList.set(id, sourceMap);

  return _module.exports as T;
}

export default requireFromString;