const NameContext = React.createContext<string>(null);

export const NameProvider = NameContext.Provider;

export function useName(name?: string) {
  const providedName = React.useContext(NameContext);
  return providedName && name
    ? providedName + '.' + name
    : providedName || name;
}
