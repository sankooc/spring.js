const babelParser = require('@babel/parser');
const fs = require('fs');

const parserOptions = {
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    ranges: true,
};

const parse =  (filename) => {
    const content = fs.readFileSync(filename).toString('utf-8');

    try {
        return babelParser.parse(content, parserOptions);
    }
    catch (e) {
      console.trace(e);
    }
}


console.log(babelParser);
const ast = parse(__dirname + '/demo.js');
console.log(JSON.stringify(ast));