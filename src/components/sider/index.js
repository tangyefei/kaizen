import React from 'react';
import './index.css';

class AppSider extends React.Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <sider className="app-sider">
        <div class="title">
          Yefei's kaizen
        </div>
        <ul>
          <li>小记</li>
          <li>我的空间</li>
        </ul>
      </sider>
    );
  }
}

export default AppSider;