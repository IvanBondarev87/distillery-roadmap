import { FormApi as FF_FormApi, createForm, FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';

import deepEqual from 'utils/deepEqual';
import clone from 'utils/clone';
import { FormProvider } from './FormContext';
import { FormPropsProvider } from './FormPropsContext';

interface FormApi<Values, InitialValues> extends Omit<FF_FormApi<Values, InitialValues>, 'change'> {
  change: (name: keyof Values | '', value?: Values[keyof Values] | Values) => void
}

declare global {

  type FormErrors<Values> = {
    [K in keyof Values]: string
  } & {
    [FORM_ERROR]?: string
  };

  interface SubmitData<
    Values extends Object = Record<string, any>,
    InitialValues extends Partial<Values> = Partial<Values>
  > {
    values: Values
    initialValues: InitialValues
  }

}

export interface FormProps<Values, InitialValues> {
  children?: ReactNode
  onSubmit?: (
    submitData: SubmitData<Values, InitialValues>
  ) => void | FormErrors<Values> | Promise<FormErrors<Values>>
  initialValues?: InitialValues
  enableReinitialize?: boolean
  values?: Values
  validate?: ((values: Values) => FormErrors<Values> | Promise<FormErrors<Values>>) // | YupShema<Record<string, any>>
  disabled?: boolean
  readOnly?: boolean
  onChange?: (values: Values) => void
}

type FormMutableState<Values, InitialValues> = {
  form: FormApi<Values, InitialValues>
  preventChangeCallback: boolean
} & Pick<
  FormProps<Values, InitialValues>,
  'onSubmit' | 'initialValues' | 'values' | 'validate' | 'onChange' | 'enableReinitialize'
>

const mutators = {
  ...arrayMutators,
};

function Form<
  Values extends Object = Record<string, any>,
  InitialValues extends Partial<Values> = Partial<Values>
>({
  children,
  onSubmit,
  initialValues,
  enableReinitialize,
  values,
  validate,
  disabled,
  readOnly,
  onChange,
}: FormProps<Values, InitialValues>) {

  const current = useRef<FormMutableState<Values, InitialValues>>(Object()).current;

  if (current.form === undefined) {
    current.form = createForm<Values, InitialValues>({
      mutators,
      initialValues,
      onSubmit: values => current.onSubmit?.({ values, initialValues: current.initialValues }),
    });
    if (values) current.form.change('', values);
    current.form.subscribe(({ values }) => {
      if (!current.preventChangeCallback) current.onChange?.(values);
    }, { values: true });
  }

  current.onSubmit = onSubmit;
  current.onChange = onChange;
  current.enableReinitialize = enableReinitialize;

  const { form } = current;

  useEffect(() => {
    current.preventChangeCallback = true;
    // form.pauseValidation();

    if (current.enableReinitialize !== false && !deepEqual(current.initialValues, initialValues)) {
      form.setConfig('initialValues', clone(initialValues));
      current.initialValues = initialValues;
    }

    if (!deepEqual(current.values, values)) {
      form.change('', clone(values));
      current.values = values;
    }

    if (current.validate !== validate) {
      const validateFn =
        validate instanceof Function
          ? validate
          : undefined;
      form.setConfig('validate', validateFn);
      current.validate = validate;
    }

    current.preventChangeCallback = false;
    // form.resumeValidation();
  });

  return (
    <FormPropsProvider {...{ disabled, readOnly }}>
      <FormProvider form={form}>
        <span className="contents" onReset={() => form.reset()}>
          {children}
        </span>
      </FormProvider>
    </FormPropsProvider>
  );
}

export default Form;
