
const debug = require('debug');
const LOG = debug('spring');

exports.build = async (cfgs, base) => {
  const arrs = cfgs.slice(0);
  const serviceMap = base;
  const hasParam = (params) => {
    return params.reduce((rs, param) => rs && param in serviceMap, true);
  };
  const freeze = (obj, name, value) => {
    Object.defineProperty(obj, name, {
      value,
      writable: false,
    });
  };
  const defineService = async (defin) => {
    const inparam = [];
    for(const param of defin.params) {
      inparam.push(serviceMap[param]);
    }
    LOG('init', defin.name, 'with', defin.params.join(','));
    switch(defin.type){
      case 'ecreate': {
        const mod = module.require(defin.filename);
        const instance = await mod.create(...inparam);
        if(defin.resolver === 'anno') {
          mod.__anno = defin.ext;
          freeze(serviceMap, defin.name, mod);
        } else {
          freeze(serviceMap, defin.name, instance);
        }
        return true;
      }
      case 'exports': {
        const mod = module.require(defin.filename);
        const instance = await mod(...inparam);
        freeze(serviceMap, defin.name, instance);
        return true;
      }
      case 'class': {
        const mod = module.require(defin.filename);
        const instance = new mod(...inparam);
        Object.defineProperty(serviceMap, defin.name, {
          value: instance,
          writable: false,
        });
        return true;
      }
      default:
        return false;
    }
  }
  
  while (true) {
    let conti = false;
    for(let i = 0 ; i < arrs.length ;) {
      const defin = arrs[i];
      const { name, params, isAsync, filename, type } = defin;
      if(params && params.length){
        if(hasParam(params)) {
        } else {
          i += 1;
          continue;
        }
      }
      const f = await defineService(defin);
      conti = f || conti;
      
      arrs.splice(i, 1);
    }
    if(arrs.length === 0){
      break;
    }
    if(!conti && arrs.length){
      LOG('failed parse');
      for(const a of arrs){
        console.error('failed build service', a.name, 'with param', (a.params || []).join(','));
      }
      throw new Error('dep error');
    }
  }
  return serviceMap;
};
