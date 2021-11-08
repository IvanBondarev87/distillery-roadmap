type OptionValue = string | number;
type SelectItemValue = string | number | boolean;
type SelectValue<Multiple extends boolean> = Multiple extends true
  ? SelectItemValue[]
  : SelectItemValue;

type SelectOption = string | number | Record<string, any>;

type QueryParams = import('query-string').ParsedQuery<string | number | boolean>;

interface Window {
  isPrerendered: boolean
}

declare var renderAppToHTML: (html: string, location: string) => string;
declare var isServerRendering: boolean;
