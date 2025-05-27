import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { GlobalModal } from './components/GlobalModal';
import { GlobalLoader } from './components/GlobalLoader';
import { rehydrateSession } from './utils/sesionStorage';
import { injectStore } from './services/axios';

injectStore(store);

function MainApp() {
  const dispatch = useDispatch();

  useEffect(() => {
    rehydrateSession(dispatch);
  }, []);

  return (
    <>
      <AppNavigator />
      <GlobalModal />
      <GlobalLoader />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
