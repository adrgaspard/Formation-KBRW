module.exports = function ({ types: t }) {
  return {
    visitor: {
      JSXElement(path) {
        const attributes = path.node.openingElement.attributes;
        if (path.node.openingElement.name.name === "Declaration" && attributes && attributes.length === 2) {
          const varNameAttribute = attributes.find(attribute => {
            return attribute.name.name === "var";
          });
          const varValueAttribute = attributes.find(attribute => {
            return attribute.name.name === "value";
          });
          if (varNameAttribute && varNameAttribute) {
            const varName = varNameAttribute.value.value;
            //console.log(varValueAttribute.value);
            const varValue = varValueAttribute.value.expression ? varValueAttribute.value.expression.value : varValueAttribute.value.value;
            const declaration = t.variableDeclaration("var", [
              t.variableDeclarator(t.identifier(varName), t.valueToNode(varValue))
            ]);
            path.replaceWith(declaration);
          }
        }
      }
    }
  };
};
