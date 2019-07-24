const babelParser = require('@babel/parser');

const parserOptions = {
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    plugins: [
        'asyncGenerators',
        'bigInt',
        'classPrivateMethods',
        'classPrivateProperties',
        'classProperties',
        ['decorators', {
            decoratorsBeforeExport: true
        }],
        'doExpressions',
        'dynamicImport',
        'estree',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'functionSent',
        'importMeta',
        'jsx',
        'logicalAssignment',
        'nullishCoalescingOperator',
        'numericSeparator',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        ['pipelineOperator', {
            proposal: 'minimal'
        }],
        'throwExpressions'
    ],
    ranges: true,
    sourceType: env.conf.sourceType
};

exports.parse =  (source, filename) => {
    try {
        return babelParser.parse(source, parserOptions);
    }
    catch (e) {
      console.trace(e);
    }
}