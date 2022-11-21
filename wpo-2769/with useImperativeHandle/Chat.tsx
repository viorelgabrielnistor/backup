import React, { FC, useEffect, useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useLocation, useParams } from 'react-router';
import { toast } from 'react-toastify';

import SearchTicketBar from './SearchTicketBar';
import ChatDisplay from './chatDisplay/ChatDisplay';
import ChatTabs from './ChatTabs';
import { ReactComponent as Bee } from '../../assets/images/Bee.svg';
import Loader from '../shared/loader/Loader';
import ConfirmationModal from '../shared/confirmationModal/confirmationModal';

import useLocalStorage from '../../store/useLocalStorage';
import useLoggedUserData from '../../store/useLoggedUserData';
import useTicket from '../../hooks/useTicket';
import useMaxOpenTicketsWarning from './useMaxOpenTicketsWarning';
import { ACKNOWLEDGE_TYPE, NO_STORAGE_REFRESH, TICKET_STATUS, TICKET_STORAGE } from '../../constants/tickets';
import { getLastActiveTicket, isMaxOpenTicketsReached, isTicketActive } from '../../helpers/tickets';
import { toPath } from '../../helpers';
import routePaths from '../../routes/routePaths';
import { INTERNAL_REDIRECT } from '../../constants/translation';
import { PROJECT_TYPES } from '../../constants/project';
import { ITranslationLocationState } from '../TranslationFlow';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useVerifiedTickets from '../../store/websockets/useVerifiedTickets';
import useVerifiedTicketsList from '../../hooks/useVerifiedTicketsList';
import useIsNotFirstRender from '../../hooks/useIsNotFirstRender';
import useHandleErrors from '../../hooks/useHandleErrors';
import { ticketApi } from '../../api/ticketApi';

import styles from './Chat.module.scss';

export interface ITicketStorageItem {
  id: string;
  number: string;
  clientId: string;
  projectId: string;
  isActive: boolean;
  lastTimeActive: number;
  status: TICKET_STATUS;
}

export interface ITicketStorage {
  activeId: string;
  tickets: ITicketStorageItem[];
}

export interface INotificationTickets {
  id: string;
  status: TICKET_STATUS;
}

const Chat: FC<{}> = () => {
  const { ticketId } = useParams<{ticketId: string}>();
  const [storedTickets, setStoredTickets] = useLocalStorage<ITicketStorage>(TICKET_STORAGE, { activeId: '', tickets: [] });
  const { loggedUserData: { allActiveProjects } } = useLoggedUserData();
  const [,ticketData, isLoadingTicket, refetchTicketData] = useTicket(storedTickets.activeId ? storedTickets.activeId : ticketId || '');
  const [isChangingHistory, setIsChangingHistory] = useState(false);
  const { maxOpenTicketsReachedWarning } = useMaxOpenTicketsWarning();
  const [disabledReply, setDisabledReply] = useState(false);
  const { removeTicketFromCounter, abandonedTicket, verifiedTicket, rejectedTicket } = useVerifiedTickets();
  const [abandonedTickets, setAbandonedTickets] = useState<string[]>([]);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ , verifiedTicketsList ] = useVerifiedTicketsList(true);
  const [notificationTickets, setNotificationTickets] = useState<INotificationTickets[]>([]);
  const history = useHistory();
  const location = useLocation<ITranslationLocationState>();
  const intl = useIntl();
  const [handleErrors] = useHandleErrors();
  const isNotFirstRender = useIsNotFirstRender();
  useDocumentTitle(intl.formatMessage({ id: 'label.page.chat' }));
<<<<<<< Updated upstream
  const [refresh, setRefresh] = useState(0);
  const [disabledXButton, setDisabledXButton] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<any>();
  const [updatedTicketToClose, setUpdatedTicketToClose] = useState<any>();
  const [actionFromLeft, setActionFromLeft] = useState(false);
  const [go, setGo] = useState(0);
  const [delay, setDelay] = useState(false);
=======
  const innerRef = useRef<any>();
  const [ticketStatus, setTicketStatus] = useState('');
>>>>>>> Stashed changes

  const handleSetNewActiveTicket = (nextStoredTickets: ITicketStorageItem[]): void => {
    const activeId = getLastActiveTicket(nextStoredTickets);

    setStoredTickets({
      activeId,
      tickets: nextStoredTickets
    });

    history.push(
      toPath(routePaths.agent.chat, { ticketId: activeId }),
      [INTERNAL_REDIRECT, NO_STORAGE_REFRESH]
    ); // INTERNAL_REDIRECT bypasses additional checks in TranslationFlow
  };

<<<<<<< Updated upstream
  const onBackButtonEvent = (e): any => {
    e.preventDefault();
    history.push({
      pathname: routePaths.agent.selectProject,
    });
=======
  const handleCloseTab = (ticketId: string): void => {
    const nextStoredTickets = storedTickets.tickets.filter(ticket => ticket.id !== ticketId);
    handleSetNewActiveTicket(nextStoredTickets);
    innerRef?.current?.handleCloseTicket(false, ticketId);
    setIsModalOpen(false);
  };

  const handleCloseModal: () => void = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
>>>>>>> Stashed changes
  };

  useEffect(() => {
    window.addEventListener('popstate', onBackButtonEvent);
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent);
    };
    // eslint-disable-next-line
  }, []);

  const handleClickTab = (ticketId: string): void => {
    !delay && history.push(
      toPath(routePaths.agent.chat, { ticketId }),
      INTERNAL_REDIRECT
    );
  };

  const handleCloseTab = (ticketId: string): void => {
    if (storedTickets.tickets.length === 1 && !actionFromLeft  && ticketToClose?.status !== 'closed') {
      setGo(prev => prev + 1);
      setTimeout(() => {
        const nextStoredTickets = storedTickets.tickets.filter(ticket => ticket.id !== ticketId);
        handleSetNewActiveTicket(nextStoredTickets);
        setIsModalOpen(false);
      }, 2000)
   
    } else {
      if (ticketToClose?.status === 'verificationPending' || ticketToClose?.status === 'verificationInProgress' || ticketToClose?.status === 'closed') {
        handleClickTab(ticketId);
      } else {
        setRefresh( prev => prev + 1);
      }
      const nextStoredTickets = storedTickets.tickets.filter(ticket => ticket.id !== ticketId);
      handleSetNewActiveTicket(nextStoredTickets);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal: () => void = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleRemoveNotification = (ticketId: string): void => {
    setNotificationTickets(notificationTickets => notificationTickets.filter(ticket => ticket.id !== ticketId));
  };

  const handleAcknowledgeTicket = async(ticketId: string, translationId = '', isLastTranslationRejected = false): Promise<void> => {
    try {
      const { data } = await ticketApi.acknowledgeTicket(ticketId, translationId);

      handleRemoveNotification(ticketId);

      if (data.result === ACKNOWLEDGE_TYPE.ACKNOWLEDGED) {
        removeTicketFromCounter(ticketId, TICKET_STATUS.VERIFIED);
        if (!isLastTranslationRejected) {
          removeTicketFromCounter(ticketId, TICKET_STATUS.REJECTED);
        }
      }
    } catch (e) {
      handleErrors(e);
    }
  };

  useEffect(() => {
    if (!abandonedTicket) {
      return;
    }

    setAbandonedTickets(abandonedTickets => [ ...abandonedTickets, abandonedTicket]);
    handleRemoveNotification(abandonedTicket);

    if (storedTickets.tickets.find(ticket => ticket.id === abandonedTicket)) {
      handleCloseTab(abandonedTicket);
      toast.warn(intl.formatMessage({ id: 'label.abandonedTicket' }));
    }

    // eslint-disable-next-line
  }, [abandonedTicket]);

  useEffect(() => {
    if (!ticketId && storedTickets.tickets.length) {
      const activeStoredTickets = storedTickets.tickets.filter(ticket => isTicketActive(ticket, allActiveProjects));
      handleSetNewActiveTicket(activeStoredTickets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotificationTickets(verifiedTicketsList.map(ticket => ({ id: ticket.id, status: ticket.status })));
    // eslint-disable-next-line
  }, [verifiedTicketsList]);

  useEffect(() => {
    if (verifiedTicket && isNotFirstRender) {
      setNotificationTickets(notificationTickets => [
        ...notificationTickets.filter(ticket => ticket.id !== verifiedTicket.ticketId),
        { id: verifiedTicket.ticketId, status: verifiedTicket.ticketStatus }
      ])
    }
    // eslint-disable-next-line
  }, [verifiedTicket]);

  useEffect(() => {
    if (rejectedTicket && isNotFirstRender) {
      setNotificationTickets(notificationTickets => [
        ...notificationTickets.filter(ticket => ticket.id !== rejectedTicket.ticketId),
        { id: rejectedTicket.ticketId, status: rejectedTicket.ticketStatus }
      ])
    }
    // eslint-disable-next-line
  }, [rejectedTicket]);

  useEffect(() => {
    if (ticketId && !(location.state && location.state.includes(NO_STORAGE_REFRESH))) {
      if (isMaxOpenTicketsReached(storedTickets.tickets, ticketId)) {
        handleSetNewActiveTicket(storedTickets.tickets);
        setTimeout(() => maxOpenTicketsReachedWarning(), 100);
        return;
      }
      setStoredTickets(prevStorage => ({ ...prevStorage, activeId: ticketId }));
    }

    if (!ticketId && !isLoadingTicket) {
      setAbandonedTickets([]);
    }

    setDisabledReply(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    if (!ticketData) {
      return;
    }

    if (ticketData.projectType !== PROJECT_TYPES.CHAT) {
      history.push(routePaths.agent.selectProject);
      return;
    }

    if (abandonedTickets.includes(ticketData.id)) {
      handleCloseTab(ticketData.id);
      return;
    } else if (abandonedTickets.length) {
      setAbandonedTickets([]);
      return;
    }

    if (!isTicketActive(ticketData, allActiveProjects)){
      handleCloseTab(ticketData.id);
      toast.warn(intl.formatMessage({ id: 'label.chat.itemNotAvailable' }, { value: ticketData.ticketNumber }));
      return;
    }

    let isTicketStored = false;
    const newTicketStorageItems = storedTickets.tickets.map(ticket => {
      if (ticket.id === ticketData.id) {
        isTicketStored = true;
        return {
          ...ticket,
          lastTimeActive: Date.now(),
          isActive: true,
          status: ticketData.status
        }
      }
      return { ...ticket, isActive: false };
    });

    if (!isTicketStored) {
      newTicketStorageItems.push({
        id: ticketData.id,
        number: ticketData.ticketNumber,
        clientId: ticketData.clientId,
        projectId: ticketData.projectId,
        isActive: true,
        lastTimeActive: Date.now(),
        status: ticketData.status
      })
    }

    setStoredTickets(prevStorage => ({ ...prevStorage, tickets: newTicketStorageItems }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketData]);

  useEffect(() => {
    if (!ticketData && !isLoadingTicket && ticketId) {
      handleCloseTab(ticketId);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingTicket]);

  if (!ticketId && storedTickets.tickets.length) {
    return <Loader center />;
  }

  const modalTitle = (
    (ticketToClose?.status === TICKET_STATUS.VERIFICATION_PENDING || ticketToClose?.status === TICKET_STATUS.VERIFICATION_IN_PROGRESS)
      ? intl.formatMessage({ id: 'label.confirm.closeTab' })
      : intl.formatMessage({ id: 'label.confirm.closeTicket' })
  );
  const displayWorning = notificationTickets.find(ticket => (ticket.id === ticketToClose?.id && ticket.status !== TICKET_STATUS.REJECTED));

  return (
    <>
      <SearchTicketBar
        openTickets={ storedTickets.tickets }
        maxOpenTicketsReachedWarning={ maxOpenTicketsReachedWarning }
      >
        <ChatTabs
          ticketId={ ticketId }
          openTickets={ storedTickets.tickets }
          notificationTickets={ notificationTickets }
          handleClickTab={ handleClickTab }
<<<<<<< Updated upstream
          handleCloseTab={ handleOpenModal }
          disabledXButton={ disabledXButton }
          setTicketToClose={ setTicketToClose }
          updatedTicketToClose={ updatedTicketToClose }
          setActionFromLeft={ setActionFromLeft }
=======
          handleCloseTab={ ticketStatus === TICKET_STATUS.OPEN ? handleOpenModal : handleCloseTab }
>>>>>>> Stashed changes
        />
      </SearchTicketBar>
      <div className={ styles.chatWrapper }>
        { (isLoadingTicket || isChangingHistory) && <Loader center withOverlay /> }
        {
          ticketId && ticketData ?
            <ChatDisplay
              ticketData={ ticketData }
              refetchTicketData={ refetchTicketData }
              handleCloseTab={ handleCloseTab }
              disabledReply={ disabledReply }
              setDisabledReply={ setDisabledReply }
              setIsChangingHistory={ setIsChangingHistory }
              handleAcknowledgeTicket={ handleAcknowledgeTicket }
              handleRemoveNotification={ handleRemoveNotification }
<<<<<<< Updated upstream
              refresh={ refresh }
              setDisabledXButton={ setDisabledXButton }
              ticketToClose={ ticketToClose }
              setUpdatedTicketToClose={ setUpdatedTicketToClose }
              actionFromLeft={ actionFromLeft }
              setActionFromLeft={ setActionFromLeft }
              go={ go }
              setDelay={ setDelay }
=======
              innerRef={ innerRef }
              setTicketStatus={ setTicketStatus }
>>>>>>> Stashed changes
            />
            : !isLoadingTicket &&
            <div className={ styles.beeWrapper }>
              <Bee className={ styles.bee }/>
              <div className={ `font-weight-bold ${ styles.emptyText }` }><FormattedMessage id="label.chat.busyBee" /></div>
              <div className={ styles.emptyText }><FormattedMessage id="label.chat.search" /></div>
            </div>
        }
      </div>
      <ConfirmationModal
        show={ isModalOpen }
        handleClose={ handleCloseModal }
<<<<<<< Updated upstream
        handleYes={ () => handleCloseTab(ticketToClose?.id) }
        yesButtonText={ intl.formatMessage({ id: 'label.yes' }) }
        title={ modalTitle }
        text={ displayWorning ? intl.formatMessage({ id: 'label.warning.closeTab' }) : '' }
=======
        handleYes={ () => handleCloseTab(ticketId) }
        yesButtonText={ intl.formatMessage({ id: 'label.yes' }) }
        title={ intl.formatMessage({ id: 'label.confirm.closeTicket' }) }
>>>>>>> Stashed changes
      />
    </>
  )
};

export default Chat;
