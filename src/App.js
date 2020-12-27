import './App.css';
import React from 'react';
import IndexedDB from './indexed-db.js';
import manba from 'manba';

function processInput(input)  {
  const splits = input.split(' ');
  let content = input, category = [];

  if(splits.length > 1 && splits[0].length < 15) {
    category = splits[0].split('/');
    content = splits.slice(1).join(' ');
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
  addInputItem: function(item, callback) {
    IndexedDB.add('notes', item, callback)
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
      loading: true,
      editingNote: null,
      dailyMode: true
    }

    console.log(this.state.inputList)

    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.editNote = this.editNote.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.delNote = this.delNote.bind(this);
    this.switchMode = this.switchMode.bind(this);

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

  switchMode() {
    this.setState({
      dailyMode: !this.state.dailyMode
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

  handleSave(e) {
    const input = this.state.input;
    const { content, category } = processInput(input);

    if (this.state.editingNote) {
      const submitItem = Object.assign(this.state.editingNote, {
        content,
        category
      });
      IndexedDB.update('notes', submitItem, () => {
        const listCopy = [ ...this.state.inputList ];
        const index = listCopy.findIndex(d => d.id === this.state.editingNote.id);
        listCopy.splice(index, 1, submitItem)

        this.setState({
          input: '',
          editingNote: null,
          inputList: listCopy
        });
      })
    } else {
      const useDefault = category.length === 0 && this.state.activeCate;
      const item ={ createAt:(new Date()).getTime(), content, category: useDefault ? [ this.state.activeCate ] : category };
      const { categoryList } = this.state;
      IndexedDB.add('notes', item, (id) => {
        this.setState({
          input: '',
          inputList: [Object.assign(item, { id }), ...this.state.inputList],
          categoryList: categoryList.indexOf(category[0]) > -1 ? categoryList : [ category[0], ...categoryList ]
        })
      });
    }
  }

  editNote(note) {
    this.setState({
      editingNote: note,
      input: `${note.category} ${note.content}`
    });
  }

  delNote(note) {
    const id = note.id;
    IndexedDB.delete('notes', id, () => {
      this.setState({
        inputList: this.state.inputList.filter(d => d.id !== id),
        editingNote: this.state.editingNote && this.state.editingNote.id == id ? null : this.state.editingNote
      })
    })
  }

  cancelEdit(note) {
    this.setState({
      input: '',
      editingNote: null
    })
  }

  generateDailyPage() {
    const sectionList = this.state.categoryList.map(cate => {
      const inputList = this.state.inputList.filter(input => Array.isArray(input.category) && input.category[0] === cate);
      const contentList = inputList.map(input => {
        return <p>{ input.content }</p>
      });
      return <div>
        <h3>{ cate }</h3>
        {contentList}
      </div>
    })
    return <div className="page daily-mode">
      { sectionList }
    </div>
  }

  render () {
    const { editingNote, activeCate } = this.state;
    const handleFilter = this.handleFilter
    const count = this.state.inputList.length;
    const list = this.state.activeCate ? this.state.inputList.filter(d => Array.isArray(d.category) && d.category[0] === this.state.activeCate) : this.state.inputList;

    const noteList = list.map(d => {
      return (
        <div className="note-item">
          <p className="desc">
          {
            activeCate ? '' :  d.category && d.category.join('/')
          }
          {
            activeCate ? '' : (<span>&nbsp;</span>)
          }
          #{ d.id }&nbsp;
          <span className="create-date">创建于{manba(Number(d.createAt)).format('k')}</span>
          <span class="operation">
            <a href="#" className="btn" onClick={() => { this.editNote(d)}}>编辑</a>
            <span style={{ display: 'inline-block', width:'12px' }}></span>
            <a href="#" className="btn del" onClick={() => { this.delNote(d)}}>删除</a>
          </span>
          </p>
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

    const writeModePage = <div className="page">
      <input className="editorInput" value={this.state.input} placeholder="请输入内容" onChange={this.handleChange} />
      {
      this.state.input ?
      <button onClick={this.handleSave}>{ editingNote ? '保存' : '新建' }</button> : ''
      }
      {
      this.state.input ?
      <button onClick={this.cancelEdit}>{ '取消' }</button> : ''
      }

      <div className="loading-banner">{ this.state.loading ? '加载中...' : ''}</div>
      <div className="category-list">{ this.state.showList ? cateList : '' }</div>
      { this.state.showList ? noteList : ''}
    </div>;

    const dailyModePage = this.generateDailyPage()

    return (
      <div className="app">
        {this.state.dailyMode ? (writeModePage) : (dailyModePage) }
        <div className="setting">
        {/* value={this.state.dailyMode} */}
        {/* defaultChecked */}
        日报模式：&nbsp;<input name="mode" type="checkbox" onChange={this.switchMode}/>
        </div>
      </div>
    );
  }
}

export default App;