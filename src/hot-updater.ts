import eventEmitter from 'webpack/hot/emitter';

interface Hot {
  check: (autoApply: boolean) => Promise<string[]>
  status: __WebpackModuleApi.Hot['status']
  accept: __WebpackModuleApi.Hot['accept']
}
const hot = module.hot as unknown as Hot;

// if (hot) {
//   hot.accept();
// }

let currentManifest: any = null;
__webpack_require__.hmrM = () => currentManifest;

eventEmitter.on('update', async ({
  manifest, onSuccess, onError
}) => {
  console.log('!!!!!!!update!!!!!!!!!')
  currentManifest = manifest;
  if (hot.status() === 'idle') try {
    const updatedModules: string[] = await hot.check(true);

    if (updatedModules?.length > 0) {
      const { renderAppToHTML } = __webpack_require__('./src/prerender-node.tsx');
      onSuccess(renderAppToHTML);
      console.log('Updated modules:');
      updatedModules.forEach(moduleId => console.log(` - ${moduleId}`));
      console.log('Update applied.');
    } else {
      console.warn('Cannot find update.');
    }

  } catch (err) {

    if (['abort', 'fail'].includes(hot.status())) {
      console.warn(`Cannot apply update. ${err}`);
    } else {
      console.error('Update failed.', err);
    }
    onError();

  }
});