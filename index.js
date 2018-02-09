const path = require('path');
const debug = require('debug');

const LOG = debug('spring');

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;

const getParameterNames = (fn) => {
  const code = fn.toString()
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '');

  const result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
    .match(/([^\s,]+)/g);

  return result === null ? [] : result;
};

const store = {};
// const DEFAULT_CONFIG = {};

module.exports = function(cfg, base, alias) {
  let ctx_config = {};
  if (cfg && typeof cfg === 'object') {
    ctx_config = cfg;
  } else {
    const cfg_file = cfg || './context';
    LOG('load_cfg_file', cfg_file);
    const _path = path.resolve(cfg_file);
    console.log(_path);
    ctx_config = module.require(_path);
  }
  LOG('found_cfg_file');
  const serviceMap = Object.assign({}, base);
  const serviceNames = Object.keys(ctx_config);
  const match = (params) => {
    const args = [];
    for (const p of params) {
      if (ctx_config[p] === undefined && serviceMap[p] === undefined) {
        throw new Error(`no_such_service_${p}`);
      }
      const dep = serviceMap[p];
      if (dep !== undefined) {
        args.push(dep);
      } else {
        return false;
      }
    }
    return args;
  };
  const pick = () => {
    for (let i = 0; serviceNames.length > i;) {
      const sn = serviceNames[i];
      const spath = ctx_config[sn];
      // todo get-path
      const realpath = path.resolve(spath);
      const _service = module.require(realpath);
      // todo
      const params = getParameterNames(_service.create);
      const agz = match(params);
      if (agz) {
        serviceMap[sn] = _service.create.apply(_service, agz);
        serviceNames.splice(i, 1);
        LOG('init-service', sn);
      } else {
        i += 1;
      }
    }
  };
  const infi = true;
  while (infi) {
    const ll = serviceNames.length;
    if (ll === 0) {
      break;
    }
    pick();
    if (ll === serviceNames.length) {
      throw new Error('dependency_error');
    }
  }
  LOG('load_context_success');
  store[alias] = serviceMap;
  return serviceMap;
};
module.exports.get = name => store[name];
