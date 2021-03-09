import React from 'react';
import { Redirect } from 'react-router-dom';
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Logo } from '../../assets/images/logo.svg';
import State from 'components/State';
import { useContext } from 'context';
import WalletLogin from './Login/Wallet';
import Views from 'components/Overview/Cards';
import { Calculator } from 'components/Calculator';

const Home = () => {
  const { loading, error, loggedIn, egldLabel, aprPercentageAfterFee} = useContext();

  const ref = React.useRef(null);

  return (
    <div ref={ref} className="home d-row flex-fill align-items-center">
      <Calculator />
      {error ? (
        <State
          icon={faBan}
          iconClass="text-primary"
          title="Something went wrong"
          description="If the problem persists please contact support."
        />
      ) : loggedIn ? (
        <Redirect to="/dashboard" />
      ) : loading ? (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
      ) : (
        <div className="m-auto login-container">
          <div className="card text-center">
            <div className="card-body p-spacer mx-lg-spacer">
              <Logo className="logo" />
              <hr className="divider"/>
              <h4 className="title">Delegation Manager</h4>
              <hr className="divider"/>
              <div>
                <WalletLogin />
              </div>
            </div>
          </div>
        </div>
      )}
      <Views />
    </div>
  );
};

export default Home;
