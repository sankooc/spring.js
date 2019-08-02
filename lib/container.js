
const debug = require('debug');
const LOG = debug('spring');

exports.build = async (cfgs) => {
  const arrs = cfgs.slice(0);
  const serviceMap = {};
  const hasParam = (params) => {
    return params.reduce((rs, param) => rs && param in serviceMap, true);
  };
  const defineService = async (defin) => {
    const inparam = [];
    for(const param of defin.params) {
      inparam.push(serviceMap[param]);
    }
    switch(defin.type){
      case 'ecreate': {
        const mod = module.require(defin.filename);
        const instance = await mod.create(...inparam);
        Object.defineProperty(serviceMap, defin.name, {
          value: instance,
          writable: false,
        });
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
      throw new Error('dep error');
    }
  }
  return serviceMap;
};
