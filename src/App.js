import './App.css';
import React from 'react';

const storage = {
  getInputList: function() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('note_'));
    const list = keys.map(d => ({
      createAt: d.substr(5), content: localStorage.getItem(d)
    }))
    list.sort((a,b) => b.createAt - a.createAt );
    return list;
  },
  addInputItem: function(item) {
    return localStorage.setItem('note_' + item.createAt, item.content)
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      input: '',
      inputList: storage.getInputList()
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e) {
    this.setState({
      input: e.target.value
    })
  }

  handleClick(e) {
    const content = this.state.input;
    const item ={ createAt:(new Date()).getTime(), content };

    this.setState({
      input: '',
      inputList: [item, ...this.state.inputList]
    })

    storage.addInputItem(item);
  }
  render () {
    const noteList = this.state.inputList.map(d => {
      return (
        <div>
          <p className="desc">创建于{d.createAt}</p>
          <p>{d.content}</p>
        </div>
      )
    })
    return (
      <div className="app">
        <div className="page">
          <input className="editorInput" value={this.state.input} placeholder="请输入内容" onChange={this.handleChange} />
          <button onClick={this.handleClick}>完成</button>
          { noteList }
          {/* {
            this.state.inputList.forEach(
          } */}
        </div>
      </div>
    );
  }
}

export default App;
