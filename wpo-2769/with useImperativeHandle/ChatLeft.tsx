import React, { Dispatch, FC, useEffect, useMemo, useState,  useImperativeHandle  } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Field, FormikTouched, useFormikContext } from 'formik';
import { toast } from 'react-toastify';

import Loader from '../../shared/loader/Loader';
import ConfirmationModal from '../../shared/confirmationModal/confirmationModal';
import CustomSelect from '../../shared/fields/CustomSelect';
import Metadata from '../../translation/Metadata';

import useLoggedUserData from '../../../store/useLoggedUserData';
import useLanguages from '../../../store/useLanguages';
import useVerifiedTickets from '../../../store/websockets/useVerifiedTickets';
import useMetadata from '../../../hooks/useMetadata';
import useHandleErrors from '../../../hooks/useHandleErrors';
import useProjectLanguages from '../../../hooks/useProjectLanguages';
import ticketService, { ITicketValues, VALIDATION_TYPE } from '../../../services/ticket';
import { USER_ROLES } from '../../../constants';
import { TICKET_STATUS, TICKET_STORAGE, TICKET_TYPE } from '../../../constants/tickets';
import { ticketApi } from '../../../api/ticketApi';
import metadataService from '../../../services/metadata';
import translationService from '../../../services/translation';
import { IProjectDetails } from '../../../services/projectInterface';
import { getCustomSelectValue } from '../../../helpers/formatForFields';
import { hasRole } from '../../../helpers/loggedUser';
import useIsNotFirstRender from '../../../hooks/useIsNotFirstRender';
import useLocalStorage from '../../../store/useLocalStorage';
import { ITicketStorage } from '../Chat';

import styles from './ChatLeft.module.scss';

interface IChatLeft {
  project: IProjectDetails;
  refetchTicketData: () => Promise<void>;
  setIsChangingHistory: Dispatch<React.SetStateAction<boolean>>;
  handleCloseTab: (ticketId: string) => void;
  handleRemoveNotification: (ticketId: string) => void;
<<<<<<< Updated upstream
  refresh: number;
  setDisabledXButton: Dispatch<React.SetStateAction<boolean>>;
  ticketToClose: any;
  setUpdatedTicketToClose: Dispatch<React.SetStateAction<any>>;
  actionFromLeft: boolean;
  setActionFromLeft: Dispatch<React.SetStateAction<boolean>>;
  go: number;
}

const ChatLeft: FC<IChatLeft> = ({ project, refetchTicketData, setIsChangingHistory, handleCloseTab, handleRemoveNotification, refresh, setDisabledXButton, ticketToClose, setUpdatedTicketToClose, actionFromLeft, setActionFromLeft, go  }) => {
=======
  innerRef: any;
  setTicketStatus: Dispatch<React.SetStateAction<string>>;
}

const ChatLeft: FC<IChatLeft> = ({ project, refetchTicketData, setIsChangingHistory, handleCloseTab, handleRemoveNotification, innerRef, setTicketStatus } ) => {
>>>>>>> Stashed changes
  const {
    values,
    setFieldValue,
    validateForm,
    setTouched,
    errors,
    touched
  } = useFormikContext<ITicketValues>();
  const { id, status, translations, metadata, metadataValue, originalLanguage } = values;
  const { removeTicketFromCounter } = useVerifiedTickets();
  const isTicketClosed = status === TICKET_STATUS.CLOSED;
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, allMetadata, isLoadingMetadata] = useMetadata(USER_ROLES.AGENT);
  const [,,,, getLanguageName] = useLanguages();
  const [projectLanguages] = useProjectLanguages(project.clientId || '', project.id || '');
  const languagesOptions = useMemo(() => {
    if (originalLanguage && !projectLanguages.find(lang => lang.value === originalLanguage)) {
      return [
        ...projectLanguages,
        getCustomSelectValue(getLanguageName(originalLanguage), originalLanguage)
      ];
    }
    return [...projectLanguages];
  }, [projectLanguages, originalLanguage, getLanguageName]);
  const canChangeLanguage = useMemo(() => !translations.find(translation => translation.type === TICKET_TYPE.REPLY), [translations]);
  const { loggedUserData: { role, preferredLanguage } } = useLoggedUserData();
  const intl = useIntl();
  const [handleErrors] = useHandleErrors();
  const hasAccessToClients = hasRole(role, [USER_ROLES.ADMIN, USER_ROLES.TSSC_MANAGER]);
  const [storedTickets, setStoredTickets] = useLocalStorage<ITicketStorage>(TICKET_STORAGE, { activeId: '', tickets: [] });
  const isNotFirstRender = useIsNotFirstRender();
  const usedLanguages = useMemo(
    () => ticketService.getUsedLanguages(translations, getLanguageName, preferredLanguage),
    [translations, getLanguageName, preferredLanguage]
  );

  const handleCloseModal: () => void = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
<<<<<<< Updated upstream
    setDisabledXButton(isChangingStatus || [TICKET_STATUS.VERIFICATION_IN_PROGRESS, TICKET_STATUS.VERIFICATION_PENDING].includes(status));
  },[status, isChangingStatus, setDisabledXButton])
=======
    setTicketStatus(status)
  }, [status]);
>>>>>>> Stashed changes

  useEffect(() => {
    if (allMetadata) {
      setFieldValue('metadataValue', metadataService.setMetadataValues(metadata, allMetadata))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMetadata, metadata]);

  const handleCloseTicket = async (closeTab: boolean, id: string): Promise<void> => {
    try {
      setFieldValue('validationType', VALIDATION_TYPE.CLOSE);
      const validation = await validateForm({
        ...values,
        validationType: VALIDATION_TYPE.CLOSE
      });
      if (Object.keys(validation).length === 0 ) {
        setIsChangingStatus(true);
        await ticketApi.closeTicket(id, translationService.toTicketSave({
          ...values,
          metadata: metadataValue,
          id,
        }, allMetadata));

        handleRemoveNotification(id);
        removeTicketFromCounter(id);
<<<<<<< Updated upstream
        (actionFromLeft || storedTickets.tickets.length === 1) && setFieldValue('status', TICKET_STATUS.CLOSED);
=======
        setFieldValue('status', TICKET_STATUS.CLOSED);
>>>>>>> Stashed changes
        closeTab && handleCloseTab(id);
        toast.success(intl.formatMessage({ id: 'label.chat.ticketClosed' }));
      } else {
        setTouched(validation as FormikTouched<ITicketValues>, false);
      }
    } catch (e) {
      handleErrors(e);
      refetchTicketData();
    } finally {
      setIsChangingStatus(false);
    }
  };
  useEffect(() => {
    isNotFirstRender && handleCloseTicket(false, ticketToClose?.id);
    // eslint-disable-next-line
  },[go])

  const updatedTicketToClose1 = {
    ...ticketToClose,
    status: status
  };
  useEffect(() => {
    setUpdatedTicketToClose({
      ...ticketToClose,
      status: status
    });
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    if (actionFromLeft) {
      if (
        isNotFirstRender
      && !(
        updatedTicketToClose1?.status === TICKET_STATUS.CLOSED ||
        updatedTicketToClose1?.status === 'verificationPending' ||
        updatedTicketToClose1?.status === 'verificationInProgress'
      )
      )
      {
        handleCloseTicket(false, updatedTicketToClose1?.id);
        setUpdatedTicketToClose(updatedTicketToClose1)
      }
    } else {
      isNotFirstRender && handleCloseTicket(false, updatedTicketToClose1?.id);
      isNotFirstRender && setUpdatedTicketToClose(updatedTicketToClose1);
    }
    // eslint-disable-next-line
  }, [refresh]);

  useImperativeHandle(innerRef, () => ({
    handleCloseTicket(closeTab: boolean, ticketId: string) {
      status === TICKET_STATUS.OPEN && handleCloseTicket(closeTab, ticketId);
    }
  }));

  const handleReopenTicket = async (): Promise<void> => {
    handleCloseModal();
    try {
      setIsChangingStatus(true);
      await ticketApi.reopenTicket(id);
      setFieldValue('status', TICKET_STATUS.OPEN);
      const clonedStoredTickets = { ...storedTickets };
      const element = storedTickets.tickets.filter(item => item.id === id);
      const index = storedTickets.tickets.indexOf(element[0]);
      clonedStoredTickets.tickets[index] = {
        ...storedTickets.tickets[index],
        status: TICKET_STATUS.OPEN
      }
      refetchTicketData();
      setStoredTickets(clonedStoredTickets);
    } catch (e) {
      handleErrors(e);
      refetchTicketData();
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleStatusChange = (): void => {
    setActionFromLeft(true)
    switch (status) {
      case TICKET_STATUS.CLOSED:
        setIsModalOpen(true);
        break;
      case TICKET_STATUS.OPEN:
      case TICKET_STATUS.VERIFIED:
      case TICKET_STATUS.REJECTED:
      case TICKET_STATUS.INACTIVE:
        handleCloseTicket(true, id);
        break;
    }
  };

  const handleLanguageChange = async (selectedLanguage): Promise<void> => {
    setIsChangingHistory(true);
    try {
      for (const { id: translationId, text, targetLanguage,type, status } of translations) {
        await ticketApi.deleteTranslation(id, translationId || '');
        await ticketApi.setTranslation(id, translationService.toTranslation({
          id: null,
          sourceLanguage: selectedLanguage,
          targetLanguage,
          text,
          type,
          status
        }));
      }
      refetchTicketData();
    } catch (e) {
      handleErrors(e);
    } finally {
      setIsChangingHistory(false);
    }
  }

  return (
    <>
      <div className={ `${ styles.ticketDetails } ${ styles.containerBoxed }` }>
        {
          usedLanguages.length > 0 &&
          <div className={ styles.warning }>
            <FormattedMessage
              id={ `label.chat.otherLanguage${ usedLanguages.length > 1 ? 's' : '' }` }
              values={ { languages: <b>{ usedLanguages.join(', ') }</b> } }
            />
          </div>
        }
        {
          hasAccessToClients &&
          <>
            <label className={ styles.label }><FormattedMessage id="label.table.client" /></label>
            <h6 className="text-uppercase mb-3">{ project.clientName }</h6>
          </>
        }
        <label className={ styles.label }><FormattedMessage id="label.project" /></label>
        <h6 className="text-uppercase mb-3">{ project.name }</h6>
        <label className={ styles.label }>
          <FormattedMessage id={ `label.translation.${ project.languageAutodetection ? 'selectLanguage' : 'selectOriginalLanguage' }` } />
        </label>
        <Field
          className={ `${ styles.selectedLanguage } smallSize` }
          name="originalLanguage"
          options={ languagesOptions }
          component={ CustomSelect }
          placeholder={ intl.formatMessage({ id: 'label.language' }) }
          isMulti={ false }
          handleOnChange={ handleLanguageChange }
          disabled={ isTicketClosed || !canChangeLanguage }
          isInvalid={ !!touched.originalLanguage && !!errors.originalLanguage }
        />
      </div>
      <div className={ `${ styles.containerBoxed }` }>
        <h4 className={ styles.status }><FormattedMessage id="label.chat.ticketStatus" /></h4>
        <div className={ styles.ticketDetails }>
          <label className={ `${ styles.label } mb-3` }>
            <FormattedMessage id="label.chat.ticketStatusText" />
          </label>
          <Metadata
            metadata={ allMetadata }
            isLoading={ isLoadingMetadata }
            touched={ touched }
            errors={ errors }
            className="mb-1"
            smallSize
            isDisabled={ isTicketClosed || [TICKET_STATUS.VERIFICATION_IN_PROGRESS, TICKET_STATUS.VERIFICATION_PENDING].includes(status) }
            fieldName="metadataValue"
          />
          <button
            className={ `${ styles.buttonSubmit } ${ styles.buttonStatus } mt-2` }
            type="button"
            disabled={ isChangingStatus || [TICKET_STATUS.VERIFICATION_IN_PROGRESS, TICKET_STATUS.VERIFICATION_PENDING].includes(status) }
            data-qa="ticketStatus"
            onClick={ handleStatusChange }
          >
            <FormattedMessage id={ `label.chat.${ status === TICKET_STATUS.CLOSED ? 'ticketOpen' : 'ticketClose' }` } />
            { isChangingStatus && <Loader small /> }
          </button>
        </div>
      </div>
      <ConfirmationModal
        show={ isModalOpen }
        handleClose={ handleCloseModal }
        handleYes={ handleReopenTicket }
        yesButtonText={ intl.formatMessage({ id: 'label.yes' }) }
        title={ intl.formatMessage({ id: 'label.confirm.openTicket' }) }
      />
    </>
  )
};

ChatLeft.displayName = 'ChatLeft';

export default ChatLeft;
