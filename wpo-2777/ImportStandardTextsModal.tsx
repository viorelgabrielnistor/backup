import React, { FC, useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { parse } from 'papaparse';

import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

import styles from './ImportStandardTextsModal.module.scss';
import { FormattedMessage } from 'react-intl';
import { standardTextApi } from '../../api/standardTextApi';
// import { toast } from 'react-toastify';
import useHandleErrors from '../../hooks/useHandleErrors';

interface IImportStandardTextsModal{
  show: boolean;
  handleClose: () => void;
  client: any;
  language: any;
}

export interface IImportStandardTexts{
  Category_name: string;
  Category_projects: string;
  Subject_name: string;
  Subject_projects: string;
  Label_name: string;
  Label_projects: string;
  Generic_response: string;
}

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

const ImportStandardTextsModal: FC<IImportStandardTextsModal> = ({ show, handleClose, client, language }) => {
  const [showCancelButton, setShowCancelButton] = useState(true);
  const[importedFiles, setImportedFiles] = useState<any>([])
  const [importedStandardText, setImportedStandardTexts] = useState<IImportStandardTexts[]>([])

  const [handleErrors] = useHandleErrors();
  
  const onDrop = useCallback(acceptedFiles => {
    const alreadyExist = importedFiles.indexOf(acceptedFiles) !== -1;
    !alreadyExist && setImportedFiles(prev => [...prev, ...acceptedFiles]);

    Array.from(acceptedFiles)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach(async (file: any) => {
        const text = await file.text();
        const result = parse(text, { header: true });
        importedStandardText ? setImportedStandardTexts(prev => [
          ...prev,
          ...result.data
        ]) :
          setImportedStandardTexts([...result.data])
      })
  }, [importedStandardText, importedFiles]);
    
  const maxSize = 1048576;  
  const {
    // acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject, } = useDropzone({
    disabled: importedFiles?.length ? true : false,
    onDrop,
    maxFiles: 1,
    minSize: 0,
    maxSize,
    accept: {
      'text/csv': ['.csv'],
    }
  });
  
  const style: any = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleImport = async (): Promise<void> => {
    setShowCancelButton(false);

    try {
      // const response = await standardTextApi.importStandardTexts..........
      // console.log(response)
      
      standardTextApi.importStandardTexts(client, language, importedFiles)
      // toast.success(intl.formatMessage({ id: 'label.success.status' }))

    } catch (e) {
      handleErrors(e);
    }
  }
  // importedStandardText.length > 0 && console.log('importedStandardText: ', importedStandardText);

  const groupByProperty = (importedArray, key): any => {
    return importedArray.reduce((allNames, name) => {
      (allNames[name[key]] = allNames[name[key]] || []).push(name);
      return allNames;
    }, {});
  };
  
  //Calculate the number of categories
  const groupedCategory = groupByProperty(importedStandardText, 'Category_name');
  const numberOfCaterories = (Object.keys(groupedCategory)).filter(cat => cat).length;
  
  //Calculate the number of subjects
  const groupedSubjects = groupByProperty(importedStandardText, 'Subject_name');
  const initialNumberOfSubjects = (Object.entries(groupedSubjects)).filter(item => item[0] !== 'undefined' && item[0] !== '').length;
  const auxSubjects = (Object.entries(groupedSubjects)).filter(item => item[0] !== 'undefined');
  let subjectsCorrection = 0;
  auxSubjects.forEach(subject => {
    const res = groupByProperty(subject[1], 'Category_name');
    subjectsCorrection += Object.keys(res).length - 1;
  })
  const numberOfSubjects = initialNumberOfSubjects + subjectsCorrection;
  
  //Calculate the number of labels
  const groupedLabels = groupByProperty(importedStandardText, 'Label_name');
  const initialNumberOfLabels = (Object.entries(groupedLabels)).filter(item => item[0] !== 'undefined' && item[0] !== '').length;
  const auxLabels = (Object.entries(groupedLabels)).filter(item => item[0] !== 'undefined' && item[0] !== '')
  let labelsCorrection = 0;
  auxLabels.forEach(label => {
    const resCat = groupByProperty(label[1], 'Category_name');
    labelsCorrection += Object.keys(resCat).length - 1;
    const resSubj = groupByProperty(label[1], 'Subject_name');
    labelsCorrection += Object.keys(resSubj).length - 1;
  })
  const numberOfLabels = initialNumberOfLabels + labelsCorrection;

  const handleCloseHandler = (): void => {
    handleClose();
    setImportedFiles([]);
    setImportedStandardTexts([]);
  }

  return (
    <Modal show={ show } onHide={ handleClose } dialogClassName={ styles.wrapper }>
      <Modal.Header >
        <Modal.Title className={ styles.title }><FormattedMessage id="label.standardText.import" /></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className={ styles.container }>
          <div { ...getRootProps({ style }) }>
            <input { ...getInputProps() } />
            <p>Drag and drop your .csv file here, or click to select the file</p>
            <p>Please upload only one .csv file, maximum size: 123....</p>
          </div>
          <p className={ styles.uploadMessage }>{importedFiles.length ? `Please import the uploaded file: ` + `${importedFiles[0].path}`  : null}</p>
          <aside className={ styles.status }>
            <h4 style={ { margin: '24px 48px' } }>Status:</h4>
            {
              numberOfCaterories ? <p>Upload successful</p> : null
            }
            {
              numberOfCaterories?  <p>{numberOfCaterories} categories</p> : null
            }
            {
              numberOfSubjects ? <p>{numberOfSubjects} subjects</p> : null
            }
            {
              numberOfLabels ? <p>{numberOfLabels} labels</p> : null
            }
            {/* <ul>
              { importedStandardText.map((text, index) =>
                text.Category_name !== '' ? <li key={ index } > { text.Category_name } { text.Category_projects } { text.Subject_name } { text.Subject_projects }  {text.Label_name } { text.Label_projects } { text.Generic_response }</li> : null)
              } 
            </ul> */}
          </aside>
        </section>
      </Modal.Body>
      <Modal.Footer >
        <div className={ ` ${showCancelButton ? styles.modalFooterWithCancel : styles.modalFooterWithoutCancel} ` }> 
          {
            showCancelButton &&
            <Button variant="secondary" onClick={ handleCloseHandler } className={ styles.cancelBtn }>
              <FormattedMessage id="label.cancel" />
            </Button>
          }
          <Button variant="primary" onClick={ handleImport }  className={ styles.importDoneBtn }>
            <FormattedMessage id="label.import" />
          </Button>
        </div>
    
      </Modal.Footer>
    </Modal>
  )
}

export default ImportStandardTextsModal
