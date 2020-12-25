import './App.css';
import React from 'react';
import IndexedDB from './indexed-db.js';
import manba from 'manba';

function processInput(input)  {
  const splits = input.split(' ');
  let content = input, category = [];

  if(splits.length > 1 && splits[0].length < 15) {
    category = splits[0].split('/');
    content = splits[1];
  }
  return { category, content }
}

const storage = {
  getInputList: function(callback) {
    IndexedDB.openDB('kaizen', 'notes', 1);
    setTimeout(() => {
      IndexedDB.searchAll('notes', result => {
        callback(result)
      })
    }, 2000)
  },
  addInputItem: function(item) {
    IndexedDB.add('notes', item)
  },
  getSetting(name) {
    return sessionStorage.getItem('note_' + name);
  },
  setSetting(name, value) {
    return sessionStorage.setItem('note_' + name, value);
  }
}


class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      input: '',
      inputList: [],
      activeCate: null,
      categoryList: [],
      showList: !!(storage.getSetting('showList')),
      loading: true
    }

    console.log(this.state.inputList)

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.listen();

    storage.getInputList((inputList) => {
      inputList.sort((a,b) => b.createAt - a.createAt );

      let categoryList =
        Array.from(new Set(
          inputList.map(d => {
            return (Array.isArray(d.category) && d.category.length) ? d.category[0] : null
          })
        ));

      this.setState({
        loading: false,
        inputList,
        categoryList
      })
    })
  }

  listen() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey  && e.keyCode === 72) {
        this.toggleShowList()
      }
    })
  }

  toggleShowList() {
    this.setState({ showList: !this.state.showList });
    storage.setSetting('showList', this.state.showList ?  '1' : '');
  }

  handleChange(e) {
    this.setState({
      input: e.target.value
    })
  }
  handleFilter(e) {
    const category = e.target.dataset.cate;

    this.setState({activeCate: category});
  }

  handleClick(e) {
    const input = this.state.input;
    const { content, category } = processInput(input);
    const item ={ createAt:(new Date()).getTime(), content, category  };

    this.setState({
      input: '',
      inputList: [item, ...this.state.inputList]
    })

    storage.addInputItem(item);
  }
  render () {
    const handleFilter = this.handleFilter
    const count = this.state.inputList.length;
    const activeCate = this.state.activeCate;
    const list = this.state.activeCate ? this.state.inputList.filter(d => Array.isArray(d.category) && d.category[0] === this.state.activeCate) : this.state.inputList;

    const noteList = list.map(d => {
      return (
        <div className="note-item">
          <p className="desc">{d.category && d.category.join('/')}&nbsp;<span className="create-date">创建于{manba(Number(d.createAt)).format('k')}</span></p>
          <p>{d.content}</p>
        </div>
      )
    });


    const getTag = function (text) {
      const isActive = (activeCate && activeCate === text) || (!activeCate && !text);
      return <span data-cate={text} className={isActive ? 'active' : '' } onClick={handleFilter}>{text || '全部(' + count + ')'}</span>
    }
    const cateList = [getTag(), ...this.state.categoryList.map(d => {
      return d ? getTag(d) : ''
    })];

    return (
      <div className="app">
        <div className="page">
          <input className="editorInput" value={this.state.input} placeholder="请输入内容" onChange={this.handleChange} />
          <button onClick={this.handleClick}>完成</button>
          <div class="loading-banner">{ this.state.loading ? '加载中...' : ''}</div>
          <div className="category-list">{ this.state.showList ? cateList : '' }</div>
          { this.state.showList ? noteList : ''}
        </div>
      </div>
    );
  }
}

export default App;