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
  let ctxPath = path.resolve(cfg);
  LOG('load cfg from ', ctxPath);
  if(!fs.existsSync(ctxPath)){
    throw new Error('no cfg file');
  }
  const smap = module.require(ctxPath);
  const slist = [];
  for(const serviceName in smap) {
    const dm = service(path.resolve(smap[serviceName]), serviceName);
    if (dm) slist.push(dm);
  }
  store[alias] = await build(slist, base);
  LOG('get all service', Object.keys(slist).length);
};

module.exports.router = (filename, name) => {
  return route(filename, name);
};

module.exports.get = (name = DEFAULT_KEY) => {
  return store[name];
};