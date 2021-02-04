import React from 'react';
import './index.css';

class AppBody extends React.Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <div className="app-body">
        {this.props.children}
      </div>
    );
  }
}

export default AppBody;