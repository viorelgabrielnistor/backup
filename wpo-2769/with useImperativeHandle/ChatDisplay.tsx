import React, { Dispatch, FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';

import Loader from '../../shared/loader/Loader';
import ChatLeft from './ChatLeft';
import ChatRight from './ChatRight/ChatRight';

import { ITicketValues } from '../../../services/ticket';
import { chatValidationSchema } from './chatValidationSchema';
import useLoggedUserData from '../../../store/useLoggedUserData';
import { IProjectDetails } from '../../../services/projectInterface';
import { PROJECT_TYPES } from '../../../constants/project';
import { emptyFn } from '../../../helpers';

import styles from './ChatDisplay.module.scss';
import { ITicketStorageItem } from '../Chat';

interface IChatDisplayProps {
  ticketData: ITicketValues;
  refetchTicketData: () => Promise<void>;
  handleCloseTab: (ticketId: string) => void;
  disabledReply: boolean;
  setDisabledReply: Dispatch<React.SetStateAction<boolean>>;
  setIsChangingHistory: Dispatch<React.SetStateAction<boolean>>;
  handleAcknowledgeTicket: (ticketId: string, translationId?: string, isLastTranslationRejected?: boolean) => Promise<void>;
  handleRemoveNotification: (ticketId: string) => void;
<<<<<<< Updated upstream
  refresh: number;
  setDisabledXButton: Dispatch<React.SetStateAction<boolean>>;
  ticketToClose: Dispatch<React.SetStateAction<ITicketStorageItem>>;
  setUpdatedTicketToClose: Dispatch<React.SetStateAction<ITicketStorageItem>>;
  actionFromLeft: boolean;
  setActionFromLeft: Dispatch<React.SetStateAction<boolean>>;
  go: number;
  setDelay: Dispatch<React.SetStateAction<boolean>>;
=======
  innerRef: any;
  setTicketStatus: Dispatch<React.SetStateAction<string>>;
>>>>>>> Stashed changes
}

const ChatDisplay: FC<IChatDisplayProps> = ({
  ticketData,
  refetchTicketData,
  handleCloseTab,
  disabledReply,
  setDisabledReply,
  setIsChangingHistory,
  handleAcknowledgeTicket,
  handleRemoveNotification,
<<<<<<< Updated upstream
  refresh,
  setDisabledXButton,
  ticketToClose,
  setUpdatedTicketToClose,
  actionFromLeft,
  setActionFromLeft,
  go,
  setDelay
=======
  innerRef,
  setTicketStatus
>>>>>>> Stashed changes
}) => {
  const intl = useIntl();
  const { loggedUserData: { allActiveProjects } } = useLoggedUserData();
  const [project, setProject] = useState<IProjectDetails | undefined>(undefined);

  useEffect(() => {
    if (allActiveProjects && allActiveProjects[PROJECT_TYPES.CHAT]) {
      setProject(allActiveProjects[PROJECT_TYPES.CHAT].reduce((projectResult: IProjectDetails | undefined, client) => {
        const activeProject = client.projects.find(prj => prj.id === ticketData.projectId);
        if (activeProject) {
          projectResult = activeProject;
        }
        return projectResult;
      }, undefined));
    }
  }, [allActiveProjects, ticketData.projectId]);

  if (!project) {
    return <Loader center />;
  }

  return (
    <Formik
      initialValues={ ticketData }
      enableReinitialize={ true }
      onSubmit={ emptyFn }
      validationSchema={ chatValidationSchema(intl, project.languageAutodetection) }
    >
      {
        () => (
          <form className={ styles.wrapper }>
            <div className={ styles.leftColumn }>
              <ChatLeft
                project={ project }
                refetchTicketData={ refetchTicketData }
                setIsChangingHistory={ setIsChangingHistory }
                handleCloseTab={ handleCloseTab }
                handleRemoveNotification={ handleRemoveNotification }
<<<<<<< Updated upstream
                refresh={ refresh }
                setDisabledXButton={ setDisabledXButton }
                ticketToClose={ ticketToClose }
                setUpdatedTicketToClose={ setUpdatedTicketToClose }
                actionFromLeft={ actionFromLeft }
                setActionFromLeft={ setActionFromLeft }
                go={ go }
=======
                innerRef={ innerRef }
                setTicketStatus={ setTicketStatus }
>>>>>>> Stashed changes
              />
            </div>
            <div className={ styles.rightColumn }>
              <ChatRight 
                project={ project } 
                refetchTicketData={ refetchTicketData }  
                disabledReply={ disabledReply }
                setDisabledReply={ setDisabledReply }
                handleAcknowledgeTicket={ handleAcknowledgeTicket }
                setDelay={ setDelay }
              />
            </div>
          </form>
        )
      }
    </Formik>
  )
};

export default ChatDisplay;
