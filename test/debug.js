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

// const smp = springJS.get()
// const resolve
// const route = () => { }

// const load = (cfg) => {
//   const arrs = Object.keys(cfg).map(c => service(cfg[c], c));
//   LOG(arrs)
// };


// const cfg = {
//   s1: __dirname + '/demo.js',
//   s2: __dirname + '/demo2.js',
// };

// load(cfg)

// const parsed = [{
//     type: 'ecreate',
//     name: 's1',
//     filename: '/Users/yj431/work/spring.js/test/demo.js',
//     isAsync: true,
//     params: []
// },
// {
//     type: 'exports',
//     name: 's2',
//     filename: '/Users/yj431/work/spring.js/test/demo2.js',
//     params: ['s1']
// }];


// (container.build.bind(container, parsed))();
// const pm = parse1(__dirname + '/router.js', 'demo', { router: 1 });
// console.log(pm);