import hotUpdater from './emitter';

type Hot = Omit<__WebpackModuleApi.Hot, 'check'> & {
  check: (autoApply: boolean) => Promise<string[]>
}
const hot = module.hot as unknown as Hot;

const installedChunks = __webpack_require__.hmrS_require;
const chunkId = Object.keys(installedChunks)[0];
const msgPrefix = `[HMR:${chunkId}]`;

async function updateChunk(chunks: Record<string, any>, reloadChunk: (chunkId: string) => void) {

  if (hot.status() === 'idle') try {

    const updatedModules: string[] = await hot.check(true);
    if (updatedModules?.length > 0) {
      console.log(`${msgPrefix} Updated modules:`);
      updatedModules.forEach(moduleId => console.log(` - ${moduleId}`));
      const entryModuleId = updatedModules.pop();
      chunks[chunkId] = __webpack_require__(entryModuleId);
    } else {
      console.warn(`${msgPrefix} Cannot find update.`);
    }

  } catch (error) {

    if (['abort', 'fail'].includes(hot.status())) {
      console.warn(`${msgPrefix} Cannot apply update:`, error);
    } else {
      console.error(`${msgPrefix} Update failed:`, error);
    }
    reloadChunk?.(chunkId);
    console.warn(`${msgPrefix} Reloaded.`);

  }
};

hotUpdater.on('update chunks', updateChunk);
