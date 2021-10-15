import { FormApi } from 'final-form';

const FormContext = React.createContext(null);

interface FormProviderProps<Values, InitialValues> {
  form: FormApi<Values, InitialValues>
  children?: ReactNode
}

export function FormProvider<Values, InitialValues>(
  { form, children }: FormProviderProps<Values, InitialValues>
) {

  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm<
  Values extends Record<string, any> = Record<string, any>,
  InitialValues extends Partial<Values> = Partial<Values>
>() {

  const form = React.useContext<FormApi<Values, InitialValues>>(FormContext);
  return form;
}
