const babelParser = require('@babel/parser');

const parserOptions = {
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    ranges: true,
};

exports.parse =  (source, filename) => {
    try {
        return babelParser.parse(source, parserOptions);
    }
    catch (e) {
      console.trace(e);
    }
}