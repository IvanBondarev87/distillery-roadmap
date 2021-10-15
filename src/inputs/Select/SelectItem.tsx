import React, { useContext } from 'react';
import { Checkbox, ListItemText } from '@material-ui/core';

import SelectContext from './SelectContext';

export interface SelectItemProps {
  value: unknown;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
}

function SelectItem({ value: optionValue, label, children }: SelectItemProps) {
  const ctx = useContext(SelectContext);
  children = children ?? <ListItemText primary={label} />;
  if (ctx.multiple) {
    const selected = (ctx.value as unknown[])?.includes(optionValue);
    return (
      <>
        <Checkbox checked={selected ?? false} />
        {children}
      </>
    );
  }
  return <>{children}</>;
}

const MemoSelectItem = React.memo(SelectItem) as typeof SelectItem;

export default MemoSelectItem;
