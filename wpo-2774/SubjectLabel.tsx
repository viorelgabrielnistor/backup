import React, { ChangeEvent, FC, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FormattedMessage, useIntl } from 'react-intl';
import { Field, FormikErrors, FormikTouched, getIn } from 'formik';

import CustomSelect from '../../shared/fields/CustomSelect';
import InputField from '../../shared/fields/InputField';
import ToggleButton from '../../shared/fields/ToggleButton';
import CustomTextArea from '../../shared/fields/CustomTextArea';
import { IStandardTextCategory } from '../../../services/standardText/standardTextInterface';
import { standardTextApi } from '../../../api/standardTextApi';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../shared/confirmationModal/confirmationModal';

import styles from './AddEditCategory.module.scss';
import { ReactComponent as Delete } from '../../../assets/images/Delete.svg';
import { standardTextCategoryService } from '../../../services/standardText/allStandardText';

interface ISubjectLabelProps {
  subjectIndex: number;
  labelIndex: number;
  handleChange: { (e: ChangeEvent<any>): void; <T = string | ChangeEvent<any>>(field: T): T extends ChangeEvent<any> ? void : (e: string | ChangeEvent<any>) => void };
  touched: FormikTouched<IStandardTextCategory>;
  errors: FormikErrors<IStandardTextCategory>;
  values: IStandardTextCategory;
  language: string;
  client: string;
  categoryId: string;
  subjectId: string;
  labelId: string;
  labelText: any;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
}

const SubjectLabel: FC<ISubjectLabelProps> = ({
  subjectIndex,
  labelIndex,
  handleChange,
  touched,
  errors,
  values,
  language,
  client,
  categoryId,
  subjectId,
  labelId,
  labelText,
  setFieldValue
}) => {
  const intl = useIntl();
  const [ handleErrors ] = useHandleErrors();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleLabel = async (): Promise<void> => {
    const formattedCategory = standardTextCategoryService.to(values);
    try {
      const label = values.subjects[ subjectIndex ].labels[ labelIndex ];
      if (!!label.id && !!label.id.length) {
        label.active = label.active ? 0 : 1;
        await standardTextApi.putStandardText(client, language, values.id, formattedCategory);
        toast.success(intl.formatMessage({ id: 'label.success.status' }))
      }
    } catch (e) {
      handleErrors(e);
    }
  };

  const clickHandler: (labelIndex) => void = () => {
    setIsDeleteModalOpen(true);
  }
  
  const handleCloseModal: () => void = () => {
    setIsDeleteModalOpen(false);
  };

  const subject = values.subjects[subjectIndex].labels;
  const handleDeleteMessageConfirmation =  async ():  Promise<void> => {
    setIsDeleteModalOpen(false)
    try {
      setIsDeleting(true);

      if (categoryId && subjectId && labelId) {
        await standardTextApi.deleteStandardTextByLabelId({ client, language, categoryId, subjectId, labelId })

        const labelToDelete: any = subject && subject.find((item) => item.id === labelId);
        const indexOfLabelToDelete: any = subject && subject.indexOf(labelToDelete);
        subject.splice(indexOfLabelToDelete, 1)
        setFieldValue('subjects', values.subjects);
      }
    } catch (e) {
      handleErrors(e);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Row className="align-items-center justify-content-between">
        <Col className="d-flex flex-nowrap align-items-center">
          <div className={ styles.labelField }>
            <FormattedMessage id={ 'label.standardText.add.label' } />
          </div>
          <div className={ ` ${ styles.inputWrapper } d-inline-block align-top` }>
            <Field
              type="text"
              placeholder={ intl.formatMessage({ id: 'label.placeholder' }) }
              name={ `subjects[${ subjectIndex }].labels[${ labelIndex }].title` }
              onChange={ handleChange }
              component={ InputField }
              isInvalid={ !!touched && !!errors && getIn(touched, `subjects[${ subjectIndex }].labels[${ labelIndex }].title`) && getIn(errors, `subjects[${ subjectIndex }].labels[${ labelIndex }].title`) }
            />
          </div>
        </Col>
        <Col md={ 6 } className="px-0 d-flex align-items-center">
          <div className={ styles.labelField }>
            <FormattedMessage id={ 'label.standardText.add.project' } />
          </div>
          <div className={ `${styles.selectProjectLabel}` }>
            <Field
              name={ `subjects[${ subjectIndex }].labels[${ labelIndex }].projectOptions` }
              component={ CustomSelect }
              options={ values.subjects[subjectIndex].projectOptions }
              valueAsObject
              placeholder={ intl.formatMessage({ id: 'label.select' }) }
              isMulti={ true }
              isInvalid={ !!touched && !!errors && getIn(touched, `subjects[${ subjectIndex }].labels[${ labelIndex }].projectOptions`) && getIn(errors, `subjects[${ subjectIndex }].labels[${ labelIndex }].projectOptions`) }
            />
          </div>
        </Col>
        <Col className="text-right pl-0">
          <div className={ `${styles.labelField} d-inline-block` }>
            <FormattedMessage id={ 'label.status' } />
          </div>
          <div className="d-inline-block">
            <Field
              name={ `subjects[${ subjectIndex }].labels[${ labelIndex }].active` }
              component={ ToggleButton }
              handleChange={ () => toggleLabel() }
              buttonValues={ [
                {
                  label: intl.formatMessage({ id: 'label.active' }),
                  value: 1
                },
                {
                  label: intl.formatMessage({ id: 'label.inactive' }),
                  value: 0
                }
              ] }
            />
          </div>
          { 
            subjectId && labelId &&
            <Delete onClick={ () => clickHandler(labelIndex) } className={ styles.deleteIcon } />
          }
        </Col>
      </Row>
      <div className="mb-3 mt-4">
        <Field
          name={ `subjects[${ subjectIndex }].labels[${ labelIndex }].text` }
          onChange={ handleChange }
          rows={ 5 }
          placeholder={ intl.formatMessage({ id: 'label.placeholder.textarea' }) }
          component={ CustomTextArea }
          isInvalid={ !!touched && !!errors && getIn(touched, `subjects[${ subjectIndex }].labels[${ labelIndex }].text`) && getIn(errors, `subjects[${ subjectIndex }].labels[${ labelIndex }].text`) }
        />
      </div>

      <div className={ `${styles.border} mb-4` } />
      <ConfirmationModal
        show={ isDeleteModalOpen }
        handleClose={ handleCloseModal }
        handleYes={ handleDeleteMessageConfirmation }
        yesButtonText={ intl.formatMessage({ id: 'label.yes' }) }
        title={ intl.formatMessage({ id: 'label.confirmationDeleteStandardReplyLabel' }) }
        isLoading={ isDeleting }
      />
    </>
  )
};

export default SubjectLabel;
