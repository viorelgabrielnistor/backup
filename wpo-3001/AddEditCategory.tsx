import React, { FC, useEffect, useState, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Field, FieldArray, Formik } from 'formik';
import { useParams, useHistory } from 'react-router-dom';

import ToggleButton from '../../shared/fields/ToggleButton';
import InputField from '../../shared/fields/InputField';
import CustomSelect from '../../shared/fields/CustomSelect';
import { standardTextCategoryService } from '../../../services/standardText/allStandardText';
import CategorySubject from './CategorySubject';
import routePaths from '../../../routes/routePaths';
import ConfirmationModal, { IConfirmationModalProps } from '../../shared/confirmationModal/confirmationModal';
import { ICustomSelectOption } from '../../shared/fields/CustomSelectInterface';
import { standardTextApi } from '../../../api/standardTextApi';
import useHandleErrors from '../../../hooks/useHandleErrors';
import addEditCategoryValidationSchema from './addEditCategoryValidationSchema';
import useAvailableLanguages from '../../../hooks/useAvailableLanguages';
import useClients from '../../../hooks/useClients';
import useFocus from '../../../hooks/useFocus';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useGenericFetch from '../../../hooks/useGenericFetch';
import { getCustomSelectValue } from '../../../helpers/formatForFields';
import { ICategorySubject } from '../../../services/standardText/standardTextInterface';

import styles from './AddEditCategory.module.scss';
import { ReactComponent as Delete } from '../../../assets/images/Delete.svg';

const AddEditCategory: FC<{}> = () => {
  const intl = useIntl();
  const history = useHistory();
  const { language = '', client = '', categoryId, status } = useParams<{ language: string; client: string; categoryId: string; status: string }>();
  const maxOrder = (history?.location?.state as { maxOrder: number })?.maxOrder;
  useDocumentTitle(intl.formatMessage({ id: `label.page.${ categoryId? 'standardReplyEdit' : 'standardReplyAdd' }` }));
  const [ handleErrors ] = useHandleErrors();
  const [ addSubjectRef,, removeAddSubjectFocus ] = useFocus();

  const [availableLanguages, isLoadingLanguage] = useAvailableLanguages();
  const { clients: allClients, isLoading: isLoadingClients } = useClients();
  const [languageName, setLanguageName] = useState('');
  const [clientName, setClientName] = useState('');
  const [categoryProjectsOptions, setCategoryProjectsOptions] = useState<ICustomSelectOption[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false)
  const standardTextParams = useMemo(() => ({ client, language, categoryId }), [client, language, categoryId]);
  const [ fetchCategory, isLoading ] = useGenericFetch(
    standardTextApi.getStandardTextById.bind(standardTextApi),
    standardTextCategoryService.mapCategoryForEdit.bind(standardTextCategoryService),
    standardTextCategoryService.getNewCategory(client, language, categoryProjectsOptions, maxOrder),
    standardTextParams,
    !!(categoryId && categoryProjectsOptions)
  );
  const category = useMemo(() => {
    if (fetchCategory && !isLoading && categoryProjectsOptions.length ) {
      return fetchCategory.id ? fetchCategory : standardTextCategoryService.getNewCategory(client, language, categoryProjectsOptions, maxOrder);
    }
    return fetchCategory;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategory, categoryProjectsOptions]);
  const hasFormChanged = (values): boolean => JSON.stringify(category) !== JSON.stringify(values);

  useEffect(() => {
    if (availableLanguages) {
      const selectedLang = availableLanguages.find(({ value }) => value === language);
      setLanguageName(selectedLang ? selectedLang.label : '');
    }
    // eslint-disable-next-line
  }, [isLoadingLanguage]);

  useEffect(() => {
    if (allClients) {
      const selectedClient = allClients.find(({ id }) => id === client);
      if (selectedClient) {
        setClientName(selectedClient.name);
        setCategoryProjectsOptions(selectedClient.projects.map(({ id, name }) => getCustomSelectValue(name, id || '')));
      }
    }
    // eslint-disable-next-line
  }, [isLoadingClients]);
  
  const [ modalOptions, setModalOptions ] = useState<IConfirmationModalProps>({
    show: false,
    handleClose: () => {
      setModalOptions({ ...modalOptions, show: false });
    },
    handleYes: () => {
      history.push(routePaths.admin.standardRepliesListing, { client, language, status });
    },
    title: intl.formatMessage({ id: 'label.confirmationTitle' }),
    text: intl.formatMessage({ id: 'label.confirmationText' })
  });

  const showModal = (): void => {
    setModalOptions({ ...modalOptions, show: true });
  };

  const navigateAway = (values): void => {
    if (JSON.stringify(values) === JSON.stringify(category)) {
      history.goBack();
    } else {
      showModal();
    }
  };

  const toggleCategory = async (values): Promise<void> => {
    // if toggling and we're in edit mode patch directly
    const formattedCategory = standardTextCategoryService.to(values);
    try {
      if (categoryId) {
        category.active = category.active ? 0 : 1;
        await standardTextApi.putStandardText(client, language, categoryId, formattedCategory);
        toast.success(intl.formatMessage({ id: 'label.success.status' }))
      }
    } catch (e) {
      handleErrors(e);
    }
  };

  const handleCloseModal: any = () => {
    setIsDeleteModalOpen(false);
  };

  const clickHandler = (): void => {
    setDeleteModal(true)
    setIsDeleteModalOpen(true);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleDeleteMessageConfirmation =  async ():  Promise<void> => {
    setIsDeleteModalOpen(false)
    try {
      setIsDeleting(true);
      if (categoryId) {
        standardTextApi.deleteStandardTextByCategoryId({ client, language, categoryId });
        history.push(routePaths.admin.standardRepliesListing, { client, language, status })
      }
    } catch (e) {
      handleErrors(e);
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  }

  const renderLoader = (): any => {
    return (
      <div className="text-center">
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="mx-auto"
        />
      </div>
    )
  };
  
  const handleSubmit = async (values: any): Promise<void> => {
    const formattedCategory = standardTextCategoryService.to(values);
    try {
      if (categoryId) {
        await standardTextApi.putStandardText(client, language, categoryId, formattedCategory);
      } else {
        await standardTextApi.postStandardText(client, language, formattedCategory);
      }
      history.push(routePaths.admin.standardRepliesListing, { client, language, status })
    } catch (e) {
      handleErrors(e);
    }
  };

  const handleCategoryProjectChange = (subjects: ICategorySubject[], setFieldValue, setFieldTouched) => (projects): void => {
    subjects.forEach((subject, subjectIndex) => {
      const subjectName = `subjects[${ subjectIndex }].projectOptions`;
      const removeSubject = subject.projectOptions.filter((projectOption) => {
        return projects.some(project => project === projectOption.value);
      });
      setFieldValue(subjectName, removeSubject);
      setFieldTouched(subjectName, removeSubject, true);

      subject.labels.forEach((label, index) => {
        const labelName = `subjects[${ subjectIndex }].labels[${ index }].projectOptions`;
        const removeLabel = label.projectOptions.filter((projectOption) => {
          return projects.some(project => project === projectOption.value);
        });
        setFieldValue(labelName, removeLabel);
        setFieldTouched(labelName, removeLabel, true);
      });
    });
  };

  // The form itself is needed for both add and edit flows thus I separated it into a helper function
  const renderForm = (): any => {
    return (
      <Formik
        initialValues={ category }
        validationSchema={ addEditCategoryValidationSchema(intl) }
        enableReinitialize
        onSubmit={ handleSubmit }>
        {
          ({ values, handleSubmit, handleChange, touched, errors, setFieldValue, isSubmitting, setFieldTouched }) => (
            <Form onSubmit={ handleSubmit }>
              <FieldArray name="subjects" render={ (arrayHelpers) => (
                <>
                  <Row className={ `align-items-center ${ styles.categoryRow }` }>
                    <div className={ styles.labelField }>
                      <FormattedMessage id={ 'label.standardText.add.category' } />
                    </div>
                    <Field
                      type="text"
                      placeholder={ intl.formatMessage({ id: 'label.placeholder' }) }
                      name="name"
                      onChange={ handleChange }
                      component={ InputField }
                      isInvalid={ !!touched.name && !!errors.name }
                    />
                    <div className={ `${ styles.labelField } ml-5` }>
                      <FormattedMessage id={ 'label.status' } />
                    </div>
                    <div className={ styles.inputWrapper }>
                      <Field
                        name="active"
                        component={ ToggleButton }
                        handleChange={ () => toggleCategory(values) }
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
                      {
                        categoryId && <Delete onClick={ () => clickHandler() } className={ styles.deleteIcon } />
                      }
                    </div>
                    <OverlayTrigger
                      trigger="focus"
                      delay={ { show: 0, hide: 3000 } }
                      placement="left"
                      overlay={ <Tooltip id="add-new-subject-scroll-down">
                        <FormattedMessage id={ 'label.standardText.add.newSubjectScrollDown' } /> 
                      </Tooltip> }
                    >
                      <button
                        ref={ addSubjectRef }
                        type="button"
                        className={ ` ${ styles.buttonSave } ml-auto` }
                        onClick={ () => {
                          arrayHelpers.push(standardTextCategoryService.getNewSubject(values.projectOptions));
                          removeAddSubjectFocus();
                        } }>
                        <FormattedMessage id={ 'label.standardText.add.newSubject' } />
                      </button>
                    </OverlayTrigger>
                  </Row>
                  <Row className={ `${ styles.categoryRow } align-items-center mb-4` }>
                    <div className={ styles.labelField }>
                      <FormattedMessage id={ 'label.standardText.add.project' } />
                    </div>
                    <div className={ styles.selectProject }>
                      <Field
                        name="projectOptions"
                        component={ CustomSelect }
                        valueAsObject
                        options={ categoryProjectsOptions }
                        placeholder={ intl.formatMessage({ id: 'label.select' }) }
                        isMulti={ true }
                        handleOnChange={ handleCategoryProjectChange(values.subjects, setFieldValue, setFieldTouched) }
                        isInvalid={ !!touched.projectOptions && !!errors.projectOptions }
                      />
                    </div>
                  </Row>
                  {
                    values.subjects && values.subjects.length > 0 && values.subjects.map((subject, subjectIndex) => (
                      <CategorySubject
                        key={ subjectIndex + '_subject' }
                        subject={ subject }
                        subjectIndex={ subjectIndex }
                        errors={ errors }
                        touched={ touched }
                        setFieldValue={ setFieldValue }
                        setFieldTouched={ setFieldTouched }
                        handleChange={ handleChange }
                        values={ values }
                        language={ language }
                        client={ client }
                        categoryId={ categoryId ? categoryId : '' }
                      />
                    ))
                  }
                </>
              ) } />
              <Row>
                <Col md={ 6 }>
                  <button
                    type="button"
                    className={ styles.buttonCancel }
                    onClick={ () => navigateAway(values) }
                  >
                    <FormattedMessage id={ hasFormChanged(values) ? 'label.cancel' : 'label.back' } />
                  </button>
                </Col>
                <Col md={ 6 } className="text-right">
                  <button
                    type="submit"
                    className={ styles.buttonSave }
                    disabled={ isSubmitting }
                  >
                    <FormattedMessage id={ 'label.saveChanges' } />
                    {
                      isSubmitting &&
                      <div className="spinner-border spinner-border-sm ml-2" role="status" />
                    }
                  </button>
                </Col>
              </Row>
            </Form>
          )
        }
      </Formik>
    )
  };

  return (
    <>
      {
        client && language && (
          isLoading ?
            renderLoader()
            :
            <>
              <h1 className="mb-4">
                <FormattedMessage id={ `label.standardText.add.${ categoryId ? 'editCategory' : 'newCategory'}` } />
              </h1>
              <div className="d-flex mb-4">
                <div>
                  <span className={ `${ styles.labelField } mr-2` }><FormattedMessage id="label.language" /></span>
                  <span className={ `${ styles.labelDetails } mr-5` }>{ languageName }</span>
                </div>
                <div>
                  <span className={ `${ styles.labelField } mr-2` }><FormattedMessage id="label.table.client" /></span>
                  <span className={ `${ styles.labelDetails }` }>{ clientName }</span>
                </div>
              </div>
              {
                renderForm()
              }
            </>
        )
      }
      {
        deleteModal ? 
          <ConfirmationModal
            show={ isDeleteModalOpen }
            handleClose={ handleCloseModal }
            handleYes={ handleDeleteMessageConfirmation }
            yesButtonText={ intl.formatMessage({ id: 'label.yes' }) }
            title={ intl.formatMessage({ id: 'label.confirmationDeleteStandardReplyCategory' }) }
            isLoading={ isDeleting }
          />
          :
          <ConfirmationModal { ...modalOptions } />
      }
    </>
  );
};

export default AddEditCategory;
