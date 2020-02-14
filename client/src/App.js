import React from 'react';
import './App.css';

import { HashRouter as Router, Route } from 'react-router-dom';
import SessionManager from "./authentication/SessionManager";
import ReceiptsIndex from './views/ReceiptsIndex'

function App() {
  return (
      <Router>
          <div className="App-header">

              <Route exact path={'/'} component={SessionManager} />
              <Route exact path={'/receipts'} component={ReceiptsIndex}/>


          </div>
      </Router>
  );
}

export default App;
