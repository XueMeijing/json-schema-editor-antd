/**
 * 因为monaco暂未找到使用本地库的解决办法，cdn的js加载慢，所以暂时使用react-ace编辑器
 */

import React, { ReactElement } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-min-noconflict/ext-language_tools';

interface QuietEditorProp {
  width?: string;
  height?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

const QuietEditor = (props: QuietEditorProp): ReactElement => {
  const { width, height, value, onChange } = props;

  return (
    <AceEditor
      height={height}
      width={width}
      mode="json"
      theme="xcode"
      name="blah2"
      value={value}
      onChange={onChange}
      fontSize={14}
      showPrintMargin
      showGutter
      highlightActiveLine
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
};

export default QuietEditor;
