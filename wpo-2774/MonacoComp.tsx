import React, { FC, useEffect, useState } from 'react';

import Editor from '@monaco-editor/react';

import styles from './ChatRight.module.scss';

export interface IMonacoComp{
  value: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  disabled: boolean;
}

const MonacoComp: FC<IMonacoComp> = ({ value, setFieldValue, disabled }) => {
  
  const handleEditorDidMount = (editor: any, monaco: any): void => {
    monaco.languages.register({ id:'myLang' });
    monaco.languages.setMonarchTokensProvider('myLang', {
      tokenizer: {
        root: [
          [/\[\s?insert\s?:.*?\]/, 'myObj']
        ]
      }
    });

    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'myObj', foreground: '#ff0000', fontStyle: 'bold' },
      ],
      colors: {
        'editor.foreground': '#007380',
        'scrollbarSlider.activeBackground': '#51dbca', 
        'scrollbarSlider.hoverBackground': '#51dbca', 
        'scrollbarSlider.background': '#51dbca',
      }
    });
    monaco.editor.setTheme('myTheme');
  }

  const handleEditorChange = (value: any): void => {
    setFieldValue( `agentReply`, value)
  }

  const options = {
    lineNumbers: 'off',
    minimap: {
      enabled: false
    },
    fontFamily: 'Roboto',
    renderLineHighlight: 'none',
    lineHeight: '1.1rem',
    fontSize: 20,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
    },
    wordWrap: 'wordWrapColumn',
    wordWrapColumn: 140,
    glyphMargin: false,
    wrappingIndent: 'same',
    quickSuggestions: false,
    automaticLayout: true,
    readOnly: disabled,
  }

  const element = document.querySelectorAll('.view-line span span')[0] as HTMLElement;  
  const  setAttributes = (el: any, attrs: any): any =>{
    for(const key in attrs) {
      el && el.setAttribute(key, attrs[key]);
    }
  }
  setAttributes(element, { 'contentEditable': 'true', 'data-text': 'type here your reply' });

  return (
    <div className={ styles.monacoContainer }>
      <Editor
        width="99%"
        className={ styles.monaco }
        defaultLanguage="myLang"
        theme="myTheme"
        value={ value }
        onMount={ handleEditorDidMount }
        onChange={ handleEditorChange }
        options={ options }
      />
    </div>
  );
}

export default MonacoComp;
