const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const debug = require('debug');

const { service, route } = require('./parser');
const { build } = require('./container');
const LOG = debug('spring');
const store = {};
const DEFAULT_KEY = 'def';
module.exports = async (cfg = './context.js', base = {}, alias = DEFAULT_KEY) => {
  const smap = {};
  if(typeof cfg === 'object') {
    Object.assign(smap, cfg);
  } else {
    const ctxPath = path.resolve(cfg);
    LOG('load cfg from ', ctxPath);
    if(!fs.existsSync(ctxPath)){
      throw new Error('no cfg file');
    }
    Object.assign(smap, module.require(ctxPath));
  }
  const slist = [];
  for(const serviceName in smap) {
    const uri = smap[serviceName];
    let dm;
    if(uri.indexOf('@') > 0) {
      dm = service(path.resolve(uri.substring(uri.indexOf('@') + 1)), serviceName, uri.substring(0, uri.indexOf('@')));
    } else {
      dm = service(path.resolve(uri), serviceName);
    }
    if (dm) slist.push(dm);
  }
  store[alias] = await build(slist, Object.assign({}, base));
  LOG('get all service', Object.keys(slist).length);
  return store[alias];
};

module.exports.import = async (slist, alias = DEFAULT_KEY) => {
  const base = store[alias];
  await build(slist, base);
  LOG('import service', Object.keys(slist).length);
  return base;
};

module.exports.resolve = (filename, name, resolver) => {
  return service(path.resolve(filename), name, resolver);
};

module.exports.router = (filename, name) => {
  return route(filename, name);
};

module.exports.get = (name = DEFAULT_KEY) => {
  return store[name];
};