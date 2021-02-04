import './App.css';
import React from 'react';
import AppHeader from './components/header';
import AppBody from './components/body';
import AppSider from './components/sider';
class App extends React.Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <div className="app">
        <AppSider/>
        <AppBody>
          <AppHeader/>
        </AppBody>
      </div>
    );
  }
}

export default App;