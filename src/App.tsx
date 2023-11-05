import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import WorkSearch from './WorkSearch';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <WorkSearch />
      </div>
    </ApolloProvider>
  );
};

export default App;