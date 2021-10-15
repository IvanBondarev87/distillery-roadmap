interface SelectContextValue {
  multiple: boolean;
  value: unknown;
}

const SelectContext = React.createContext<SelectContextValue>({ multiple: false, value: null });

export default SelectContext;
