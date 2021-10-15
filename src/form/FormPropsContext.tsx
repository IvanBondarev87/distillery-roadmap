interface FormProps {
  disabled?: boolean
  readOnly?: boolean
}

const FormPropsContext = React.createContext<FormProps>(null);

export function FormPropsProvider(
  { disabled, readOnly, children }: FormProps & { children?: ReactNode }
) {

  const formProps = useMemo<FormProps>(
    () => ({ readOnly, disabled }),
    [disabled, readOnly]
  );

  return (
    <FormPropsContext.Provider value={formProps}>
      {children}
    </FormPropsContext.Provider>
  );
}

export function useFormProps() {
  const formProps = React.useContext(FormPropsContext);
  return formProps;
}
