/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { StateType, initialState } from './state';
import { DispatchType, reducer } from './reducer';
import axios from 'axios';

export interface ContextType {
  children: React.ReactNode;
}

const Context = React.createContext<StateType | undefined>(undefined);
const Dispatch = React.createContext<DispatchType | undefined>(undefined);

function ContextProvider({ children }: ContextType) {
  const [state, dispatch] = React.useReducer(reducer, initialState());  
  const [interval, setInt] = React.useState<NodeJS.Timeout | undefined>(undefined);

  const getLatestElrondData = async () => {
    await axios.get('https://data.elrond.com/latest/quotes/egld/price').then(res => {
      dispatch({ type: 'setUSD', USD: res.data });
    });
  };

  React.useEffect(() => {
    const fetch = async () => {
      await getLatestElrondData();
    };
    setInt(
      setInterval(async () => {
        await fetch();
      }, 20000)
    );
    fetch();
    return () => {
      clearInterval(interval as NodeJS.Timeout);
    };
  }, []);

  return (
    <Context.Provider value={state}>
      <Dispatch.Provider value={dispatch}>{children}</Dispatch.Provider>
    </Context.Provider>
  );
}

function useContext() {
  const context = React.useContext(Context);
  if (context === undefined) {
    throw new Error('useState must be used within a Context.Provider');
  }
  return context;
}

function useDispatch() {
  const context = React.useContext(Dispatch);
  if (context === undefined) {
    throw new Error('useDispatch must be used within a Dispatch.Provider');
  }
  return context;
}

export { ContextProvider, useContext, useDispatch };