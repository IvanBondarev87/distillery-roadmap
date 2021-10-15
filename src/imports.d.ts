// react
declare const React: typeof import('react');
declare const useState: typeof import('react').useState;
declare const useMemo: typeof import('react').useMemo;
declare const useCallback: typeof import('react').useCallback;
declare const useEffect: typeof import('react').useEffect;
declare const useLayoutEffect: typeof import('react').useLayoutEffect;
declare const useRef: typeof import('react').useRef;

type ReactNode = import('react').ReactNode;
type ReactChild = import('react').ReactChild;
type ReactElement<
  P = any,
  T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>
> = import('react').ReactElement<P, T>;
type FunctionComponent<P = {}> = import('react').FunctionComponent<P>;

// react-query
declare const useQuery: typeof import('react-query').useQuery;
declare const useMutation: typeof import('react-query').useMutation;

// react-router
declare const usePathParams: typeof import('react-router').useParams;

// form
declare const FORM_ERROR: typeof import('final-form').FORM_ERROR;
declare const ARRAY_ERROR: typeof import('final-form').ARRAY_ERROR;

declare const Form: typeof import('form').Form;
declare const Field: typeof import('form').Field;
declare const FieldArray: typeof import('form').FieldArray;
declare const FieldError: typeof import('form').FieldError;
declare const FormError: typeof import('form').FormError;

declare const SubmitButton: typeof import('inputs').SubmitButton;
declare const ResetButton: typeof import('inputs').ResetButton;
declare const TextField: typeof import('inputs').TextField;
declare const Radio: typeof import('inputs').Radio;
declare const Checkbox: typeof import('inputs').Checkbox;

// UI
declare const P: typeof import('@material-ui/core/Typography').default;
declare const Grid: typeof import('@material-ui/core/Grid').default;
declare const Box: typeof import('@material-ui/core/Box').default;
declare const Button: typeof import('@material-ui/core/Button').default;

declare const FlexBox: typeof import('UI').FlexBox;