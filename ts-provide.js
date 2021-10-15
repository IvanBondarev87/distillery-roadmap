const fs = require('fs');
const ts = require('typescript');
const path = require('path');

function extractProvidedVariables(src) {

  const ast = ts.createSourceFile(
    src,
    fs.readFileSync(src).toString(),
    ts.ScriptTarget.ES2015,
    true
  );

  const provided = {};

  const findTypeImports = (node) => {
  
    if (ts.isVariableDeclaration(node)) {
      
      const [identifier1,, typeImport] = node.getChildren();
  
      if (ts.isImportTypeNode(typeImport)) {

        const [,,,literal,,,identifier2] = typeImport.getChildren();

        const variableName = identifier1.text;
        let _path = literal.getChildren()[0].text;
        if (_path[0] === '.') _path = path.resolve(__dirname, 'src/' + _path.slice(1));
        provided[variableName] = [_path];
        if (identifier2) provided[variableName].push(identifier2.text);

      }
      
    }
  
    ts.forEachChild(node, findTypeImports);
  }

  findTypeImports(ast);

  return provided;
}

module.exports = extractProvidedVariables;