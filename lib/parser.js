const babelParser = require('@babel/parser');
const fs = require('fs');
const _ = require('lodash');
const debug = require('debug');
const LOG = debug('spring');

const parserOptions = {
  allowAwaitOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  ranges: true,
};

const parse = (filename) => {
  const content = fs.readFileSync(filename).toString('utf-8');
  try {
    return babelParser.parse(content, parserOptions);
  } catch (e) {
    console.trace(e);
  }
}
const filterCreate = (s) => {
  if (s.type !== 'ExpressionStatement') {
    return false;
  }
  const exp1 = _.get(s, 'expression.left.object.name');
  const exp2 = _.get(s, 'expression.left.property.name');
  return (exp1 === 'exports' && exp2 === 'create' && isFunction(_.get(s, 'expression.right')));
}
const filterExport = (s) => {
  if (s.type !== 'ExpressionStatement') {
    return false;
  }
  const exp1 = _.get(s, 'expression.left.object.name');
  const exp2 = _.get(s, 'expression.left.property.name');
  return (exp1 === 'module' && exp2 === 'exports' && isFunction(_.get(s, 'expression.right')));
}

const parseAnno = (body, field='exports') => {
  const expresses = _.filter(body, (exp) => {
    return exp.type === 'ExpressionStatement' && _.get(exp, 'expression.left.object.name') === field;
  })
  const map = {};
  for(const exp of expresses) {
    const { leadingComments } = exp;
    const name = _.get(exp, 'expression.left.property.name');
    if(leadingComments && leadingComments.length) {
      for(let i = leadingComments.length - 1; i >= 0; i -= 1){
        const coment = leadingComments[i];
        if((coment.value || '').indexOf('@path') > 0) {
          map[name] = map[name] || {};
          const r = map[name];
          const attr = coment.value.split('*')
          for(const at of attr){
            const m = at.match(/(@(\w+)\s+(\S+)\s?)/)
            if(m && m.length >= 4){
              const annoName = m[2];
              const annoValue = m[3].split(',');
              LOG('route', name, 'match', m[2], m[3]);
              if(annoValue.length) {
                r[annoName] = r[annoName] || [];
                r[annoName].push(...annoValue);
              }
            }
          }
          break;
        }
      }
    }
  }
  for(const n in map){
    const attrs = map[n];
    for(const att in attrs){
      const arr = attrs[att];
      if(arr.length === 1) attrs[att] = arr[0];
    }
  }
  return map;
}
const resolvAssign = (s, name = 'exports') => {
  if (s.type !== 'ExpressionStatement') {
    return false;
  }
  const exp1 = _.get(s, 'expression.left.object.name');
  if(exp1 === name){

  }
}
const isFunction = (statement) => {
  switch (statement.type) {
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return true;
    default:
      return false;
  }
};

const filterClass = (clz) => {
  return (s) => {
    if (s.type !== 'ClassDeclaration') {
      return false;
    }
    return _.get(s, 'id.name') === clz
  }
}
const getParams = (s) => {
  return (_.get(s, 'expression.right.params') || []).map(p => p.name);
};

const classParam = (s) => {
  const bodies = _.get(s, 'body.body');
  const constructor = _.find(bodies, (b) => {
    return b.kind === 'constructor';
  })
  if (constructor) {
    return _.get(constructor, 'params').map(p => p.name);
  }
  return [];
}
const extension = (resolver, statement) => {
  switch(resolver){
    case 'anno':
      const states = _.get(statement, 'expression.right.body.body');
      return parseAnno(states);
    default:
      return {};
  }
};
exports.service = (filename, serviceName='none', resolver='service') => {
  LOG('start resolve', serviceName, 'at', filename, 'as', resolver);
  if (fs.existsSync(filename)) {
    const ast = parse(filename);
    const statements = _.get(ast, 'program.body');
    for (let i = 0; i < statements.length; i += 1) {
      const state1 = statements[i];
      if (filterExport(state1)) {
        return { type: 'exports', name: serviceName, filename, params: getParams(state1), ext: extension(resolver, state1), resolver };
      }
      if (filterCreate(state1)) {
        return { type: 'ecreate', name: serviceName, filename, params: getParams(state1), ext: extension(resolver, state1), resolver };
      }
      // if (filterExport(state1)) {
      //     const clz = _.get(state1, 'expression.right.name');
      //     const className = _.find(statements, filterClass(clz));
      //     return { type: 'class', className: _.get(className, 'id.name'), name: serviceName, filename, params: classParam(className) };
      // }
    }
  } else {
    LOG('file:', filename, 'is not exists');
  }
};

exports.route = (filename, name) => {
  LOG('start resolve route', name, 'at', filename);
  if (fs.existsSync(filename)) {
    const ast = parse(filename);
    const body = _.get(ast, 'program.body');
    return parseAnno(body);
  }
  LOG('file:', filename, 'is not exists');
};