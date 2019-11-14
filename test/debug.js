const debug = require('debug');
const LOG = debug('spring');
const path = require('path');
const springJS = require('../index');
// console.log('--')

const start = async () => {
  const smap = await springJS(__dirname + '/context.js');
  // const f1 = __dirname + '/demo2.js';
  // console.log(f1);
  const s1 = springJS.resolve(__dirname + '/demo2.js', 's2', 'service');
  const s2 = springJS.resolve(__dirname + '/router.js', 'route_user', 'anno');
  const sp = await springJS.import([s1, s2]);
  console.log(Object.keys(smap));
  console.log(smap.route_user);
  // console.log(smap.s2.play());
  // smap.route.login()
  // const rpath = path.resolve('./routertest.js');
  // // console.log(rpath)
  // const t1 = module.require(rpath);
  // const rt = springJS.router(rpath, 'user');
  // console.log(rt);

  // const rt = springJS.resolve('./router.js', 'test', 'anno');
  // console.log(rt)
};


(start)()