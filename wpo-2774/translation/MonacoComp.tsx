import React, { Dispatch, FC } from 'react';

import Editor from '@monaco-editor/react';

import styles from './Translation.module.scss';

export interface IMonacoComp{
  value: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  setOriginalReply: Dispatch<React.SetStateAction<string>>;
}

const MonacoComp: FC<IMonacoComp> = ({ value, setFieldValue, setOriginalReply }) => {
  
  // const [zoom, setZoom] = useState(123);
  // const [myVal, setMyVal] = useState(90);
 
  // const myResolutionW = window.innerWidth;
  // const myDeviceResolutionW = window.screen.availWidth;
  // console.log('myResolutionW: ', myResolutionW)
  // console.log('myDeviceResolutionW: ', myDeviceResolutionW)
  
  // const aux = 60;

  // switch (true) {
  //   case (myResolutionW < 1400) : aux = 140; break;
  //   case (myResolutionW >= 1400 && myResolutionW < 1600) : aux = 170; break;
  //   case (myResolutionW >= 1600 && myResolutionW < 1680) : aux = 180; break;
  //   case (myResolutionW >= 1680 && myResolutionW < 1920) : aux = 180; break;
  //   case (myResolutionW >= 1920): aux = 200; break;
  //   default: aux = 180;
  // }

  // let pxRatio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
  // const isZooming = (): any => {
  //   const newPxRatio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
  //   if(newPxRatio !== pxRatio){
  //     pxRatio = newPxRatio;
  //     // console.log('zooming');
  //     setZoom((window.outerWidth - 10) / window.innerWidth * 100);
  //     setMyVal(aux * 100 / zoom);
  //     return true;
  //   }else{
  //     console.log('just resizing');
  //     return false;
  //   }
  // }
  // window.onresize = (function () { isZooming(); });

  // console.log('zoom out: ', zoom)

  // useEffect(() => {
  //   console.log('vio test zoom');
  //   setMyVal(prev => prev * 100 / zoom);
  // },[zoom])

  // console.log('myVal:', myVal)

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
    console.log('value: ', value);
    setFieldValue('originalReply', value);
    setOriginalReply(value);

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
    wordWrapColumn: 90,
    glyphMargin: false,
    wrappingIndent: 'same',
    quickSuggestions: false,
    automaticLayout: true,
  }

  return (
    <div className={ styles.monacoContainer }>
      <Editor
        className={ styles.monaco }
        defaultLanguage= "myLang"
        theme= "myTheme"
        value= { value }
        onMount= { handleEditorDidMount }
        onChange={ handleEditorChange }
        options={ options }
      />
    </div>
  );
}

export default MonacoComp;
