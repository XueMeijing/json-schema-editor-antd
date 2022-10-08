import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Input } from 'antd';

interface FieldInputProp {
  value: string;
  addonAfter?: ReactNode;
  onChange: (value: string) => boolean;
  disabled: boolean;
}

const FieldInput = (props: FieldInputProp): ReactElement => {
  const [fieldValue, setFieldValue] = useState<string>(props.value);

  useEffect(() => {
    setFieldValue(props.value);
  }, [props.value]);

  const handleChange = (value) => {
    if (props.onChange(value) && value) {
      setFieldValue(value);
    }
  };

  return (
    <Input
      addonAfter={props.addonAfter}
      value={fieldValue}
      onChange={(ele) => handleChange(ele.target.value)}
      disabled={props.disabled}
    />
  );
};

export default FieldInput;
