const debug = require('debug');
const LOG = debug('spring');
const path = require('path');
const springJS = require('../index');
// console.log('--')

const start = async () => {
  const smap = await springJS(undefined);
  smap.route.login()
  // const rpath = path.resolve('./routertest.js');
  // // console.log(rpath)
  // const t1 = module.require(rpath);
  // const rt = springJS.router(rpath, 'user');
  // console.log(rt);

  // const rt = springJS.resolve('./router.js', 'test', 'anno');
  // console.log(rt)
};


(start)()