function isReactElement(node: ReactNode): node is ReactElement {
  return node instanceof Object;
}

export default isReactElement;
