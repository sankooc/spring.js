const debug = require('debug');
const LOG = debug('spring');
const path = require('path');
const springJS = require('../index');
console.log('--')

const start = async () => {
  const smap = await springJS(undefined);
  const rpath = path.resolve('./router.js');
  console.log(rpath)
  const t1 = module.require(rpath);
  const rt = springJS.router(rpath, 'user');
  await t1.login();

};


(start)()