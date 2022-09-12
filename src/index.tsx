import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { createContext, ReactElement, useState } from 'react';
import { message } from 'antd';
import Schema, { Language, SchemaTypeItem } from './types/Schema';
import SchemaDescription from './types/SchemaDescription';
import Editor from './components/editor';

/**
 * @title JsonSchemaEditor
 */
export interface JsonSchemaEditorProps {
  /**
   * @zh 是否开启 mock
   */
  mock?: boolean;
  /**
   * @zh 是否展示 json 编辑器
   */
  jsonEditor?: boolean;
  /**
   * @zh Schema 变更的回调
   */
  onChange?: (schema: Schema) => void;
  /**
   * @zh 初始化 Schema
   */
  data?: Schema | string;
  /**
   * @zh 国际化
   */
  language?: Language;
  /**
   * @zh 是否显示description
   */
  description?: boolean;
  /**
   * @zh 是否显示description
   */
  schemaType?: Array<SchemaTypeItem>;
  /**
   * @zh 所有节点disabled
   */
  disabled?: boolean;
}

export const SchemaMobxContext = createContext<SchemaDescription>(new SchemaDescription());

const JsonSchemaObserverEditor = observer((props: JsonSchemaEditorProps) => {
  let defaultSchema;
  if (props.data) {
    if (typeof props.data === 'string') {
      try {
        defaultSchema = JSON.parse(props.data);
      } catch (e) {
        message.error('传入的字符串非 json 格式!');
      }
    } else if (Object.prototype.toString.call(props.data) === '[object Object]') {
      // fixdata是空对象首行没有加号的bug
      if (!Object.keys(props.data).length) {
        defaultSchema = { type: 'object' };
      } else {
        defaultSchema = props.data;
      }
    } else {
      message.error('json数据只支持字符串和对象');
    }
  }

  const [contextVal] = useState<SchemaDescription>(new SchemaDescription(defaultSchema));

  reaction(
    () => contextVal.schema,
    (schema) => {
      if (props.onChange) {
        props.onChange(JSON.parse(JSON.stringify(schema)));
      }
    }
  );

  // reaction(
  //   () => contextVal.open,
  //   (open) => {
  //     // eslint-disable-next-line no-console
  //     console.log(JSON.parse(JSON.stringify(open)));
  //   }
  // );

  return (
    <div>
      <SchemaMobxContext.Provider value={contextVal}>
        <Editor
          jsonEditor={props.jsonEditor}
          mock={props.mock}
          language={props.language}
          description={props.description === undefined ? true : props.description}
          schemaType={props.schemaType}
          disabled={!!props.disabled}
        />
      </SchemaMobxContext.Provider>
    </div>
  );
});

const JsonSchemaEditor = (props: JsonSchemaEditorProps): ReactElement => {
  return (
    <>
      <JsonSchemaObserverEditor {...props} />
    </>
  );
};

export default JsonSchemaEditor;
