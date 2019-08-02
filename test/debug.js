const babelParser = require('@babel/parser');
const fs = require('fs');
const _ = require('lodash');
const debug = require('debug');
const LOG = debug('spring');

const container = require('../lib/container');

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
    return (exp1 === 'exports' && exp2 === 'create');
}

const filterExport = (s) => {
    if (s.type !== 'ExpressionStatement') {
        return false;
    }
    const exp1 = _.get(s, 'expression.left.object.name');
    const exp2 = _.get(s, 'expression.left.property.name');
    const exp3 = _.get(s, 'expression.right.type')
    return (exp1 === 'module' && exp2 === 'exports' && exp3 === 'Identifier');
}
const filterClass = (clz) => {
    return (s) => {
        if (s.type !== 'ClassDeclaration') {
            return false;
        }
        return _.get(s, 'id.name') === clz
    }
}
const getParams = (s) => {
    return _.get(s, 'expression.right.params').map(p => p.name);
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
const parse1 = (filename, serviceName) => {
    if (fs.existsSync(filename)) {
        const ast = parse(filename);
        // console.log(JSON.stringify(ast));
        const statements = _.get(ast, 'program.body');
        for (let i = 0; i < statements.length; i += 1) {
            const state1 = statements[i];
            if (filterCreate(state1)) {
                return { type: 'ecreate', name: serviceName, filename, params: getParams(state1) };
            }
            if (filterExport(state1)) {
                const clz = _.get(state1, 'expression.right.name');
                const className = _.find(statements, filterClass(clz));
                return { type: 'class', className: _.get(className, 'id.name'), name: serviceName, filename, params: classParam(className) };
            }
        }
    } else {
        LOG('file:', filename, 'is not exists');
    }
};

const load = (cfg) => {
    const arrs = Object.keys(cfg).map(c => parse1(cfg[c], c));
    LOG(arrs)
};


const cfg = {
    s1: __dirname + '/demo.js',
    s2: __dirname + '/demo2.js',
};

// load(cfg)

const parsed = [{
    type: 'ecreate',
    name: 's1',
    filename: '/Users/yj431/work/spring.js/test/demo.js',
    isAsync: true,
    params: []
},
{
    type: 'class',
    className: 'Amap',
    name: 's2',
    filename: '/Users/yj431/work/spring.js/test/demo2.js',
    params: ['s1']
}];


(container.build.bind(container, parsed))();
// const pm = parse1(__dirname + '/demo.js', 'demo');
// console.log(pm);