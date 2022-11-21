import React, { FC, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useSound from 'use-sound';

import useVerificationQueue from '../../store/websockets/useVerificationQueue';
import Spinner from 'react-bootstrap/Spinner';
import { ReactComponent as BellIcon } from '../../assets/images/Bell.svg';
import styles from './HeaderLanguageExpert.module.scss';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const alarm = require('../../assets/sounds/boop.mp3');

const HeaderLanguageExpert: FC<{}> = () => {
  const { verifyTicketsCount } = useVerificationQueue();
  const [volume, setVolume] = useState(0.3)
  const [play] = useSound <{volume: number }>(alarm, { volume });
  const [totalNumberOfTickets, setTotalNumberOfTickets] = useState(0);
  const [shake, setShake] = useState(false);
<<<<<<< Updated upstream
  const [senseOfChange, setSenseOfChange] = useState('onIncrease');
=======
  const[senseOfChange, setSenseOfChange] = useState('onIncrease')
>>>>>>> Stashed changes
  const target = useRef(null);

  const animate = (): void => {
    setShake(true);
<<<<<<< Updated upstream
    setTimeout(() => setShake(false), 1000);
  };

  const changeVolumeHandler = (): void => {
    volume !== 0 ? setVolume(0) : setVolume(0.3);
  };

  const blinkTab = (): void => {
    const message = `${verifyTicketsCount} New Tickets!`;
    document.title = message; 
=======
    setTimeout(() => setShake(false), 2000);
  }

  const changeVolumeHandler = (): void => {
    volume ? setVolume(0) : setVolume(0.3);
  }

  const blinkTab = (): void => {
    const message = 'You have a new message!'
    const oldTitle: string = document.title;
    let timeoutId: ReturnType<typeof setTimeout>  | null = null;
    const blink = (): void => {
      document.title = document.title === message ? oldTitle : message;
    }; 
    const clear = (): any =>  { 
      for (let i = 0; i < 99999; i++) {
        window.clearInterval(i);
      }
      document.title = oldTitle;
      window.onmousemove = null;
      timeoutId = null;
    };
    if (!timeoutId) {
      timeoutId = setInterval(blink, 1000);
      window.onmousemove = clear;                                                           
    }
>>>>>>> Stashed changes
  };

  useEffect(() => {
    if (verifyTicketsCount !== null && totalNumberOfTickets && verifyTicketsCount < totalNumberOfTickets) { setSenseOfChange('onDecrease') }
    if (verifyTicketsCount !== null && totalNumberOfTickets && verifyTicketsCount > totalNumberOfTickets) { setSenseOfChange('onIncrease') }
    if (verifyTicketsCount === 0 && totalNumberOfTickets) { setSenseOfChange('onIncrease') }
    
    if (totalNumberOfTickets > 0 && (verifyTicketsCount && verifyTicketsCount > 0 ) && senseOfChange === 'onIncrease' && verifyTicketsCount >= totalNumberOfTickets) {
      blinkTab();
      play();
      animate();
    }
    verifyTicketsCount && setTotalNumberOfTickets(verifyTicketsCount);
<<<<<<< Updated upstream
  }, [verifyTicketsCount, senseOfChange, totalNumberOfTickets]);
=======
  }, [verifyTicketsCount, senseOfChange, totalNumberOfTickets, play]);
>>>>>>> Stashed changes

  return (
    <div className={ styles.requestsWrapper }>
      <div className={ styles.casesWrapper }>
        <p className={ styles.queue }>
          <FormattedMessage id="label.header.verificationQueue"/>
        </p>
        <span className={ styles.cases }>
          <FormattedMessage id="label.header.casesPending"/>
        </span>
      </div>
      {
        verifyTicketsCount !== null ?
          <b className={ styles.ticketNr }>{ verifyTicketsCount }</b>
          :
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="ml-2"
          />
      }
      <OverlayTrigger
        trigger="hover"
<<<<<<< Updated upstream
=======
        delay={ { show: 0, hide: 500 } }
>>>>>>> Stashed changes
        placement="right"
        overlay={ <Tooltip id="sound-switch-button">
          <FormattedMessage id={ volume ? 'label.button.soundSwitchOn' : 'label.button.soundSwitchOff' } /> 
        </Tooltip> }
      >
        <button className={ styles.bell } ref={ target } type="button" onClick={ changeVolumeHandler }>
          < BellIcon className = { shake  ?  `${styles.shake}` : ''  }/>
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default HeaderLanguageExpert;
