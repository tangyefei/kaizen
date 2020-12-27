import manba from 'manba';
import React from 'react';

import Note from './model/note';
import NoteDao from './database/note';
import Setting from './setting/index';

import './App.css';

const CHAR_H_KEYCODE = 72;
class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      input: '',
      noteList: [],
      cateActive: null,
      cateTextList: [],
      noteVisible: !!(Setting.get('noteVisible')),
      loading: true,
      editingNote: null,
      gatherMode: false
    }

    this.listen();
    this.getAllNotes();
  }


  listen() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey  && e.keyCode === CHAR_H_KEYCODE) {
        this.toggleNoteVisible()
      }
    })
  }

  getAllNotes() {
    NoteDao.getAll((noteList) => {
      noteList.sort((a,b) => b.createAt - a.createAt );
      this.setState({
        loading: false,
        noteList,
        cateTextList: Array.from(new Set( noteList.map(d => d.category[0]) ))
      })
    })
  }

  switchMode() {
    this.setState({
      gatherMode: !this.state.gatherMode
    })
  }

  toggleNoteVisible() {
    this.setState({ noteVisible: !this.state.noteVisible });

    Setting.set('noteVisible', this.state.noteVisible ?  '1' : '');
  }

  handleInputChange(e) {
    this.setState({
      input: e.target.value
    })
  }
  handleCateClick(e) {
    const category = e.target.dataset.cate;

    this.setState({cateActive: category});
  }

  handleNoteSave() {
    const input = this.state.input;
    const { content, category, createAt } = Note.createFromText(input);

    if (this.state.editingNote) {
      const submitItem = Object.assign(this.state.editingNote, {
        content,
        category
      });
      NoteDao.update(submitItem, () => {
        const listCopy = [ ...this.state.noteList ];
        const index = listCopy.findIndex(d => d.id === this.state.editingNote.id);
        listCopy.splice(index, 1, submitItem)

        this.setState({
          input: '',
          editingNote: null,
          noteList: listCopy
        });
      })
    } else {
      const useDefault = category.length === 0 && this.state.cateActive;
      const item ={ createAt, content, category: useDefault ? [ this.state.cateActive ] : category };
      const { cateTextList } = this.state;

      NoteDao.add(item, (id) => {
        this.setState({
          input: '',
          noteList: [Object.assign(item, { id }), ...this.state.noteList],
          cateTextList: cateTextList.indexOf(category[0]) > -1 ? cateTextList : [ category[0], ...cateTextList ]
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
    NoteDao.delete(id, () => {
      this.setState({
        noteList: this.state.noteList.filter(d => d.id !== id),
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

  generateOverviewPage() {
    return <div className="page gather-mode">
      {
        this.state.cateTextList.map(cate => {
          const noteList = this.state.noteList
            .filter(input => input.category[0] === cate)
            .sort((a,b) => a.createAt - b.createAt );
          return <div>
            <h4>{ cate }</h4>
            {
              noteList.map(input => {
                return <div className="note-item">
                  <p class="content-row">{ input.content }</p>
                </div>
              })
            }
          </div>
        })
      }
    </div>
  }

  generateWritePage() {
    const { editingNote, cateActive, noteList } = this.state;
    const count = noteList.length;
    const list = cateActive ? noteList.filter(d => d.category[0] === this.state.cateActive) : this.state.noteList;

    const renderCateTags = () => {
      return list.map(d => {
        return (
          <div className="note-item">
            <p className="desc-row">
              <span>{ cateActive ? '' :  <span>{ d.category && d.category.join('/') }&nbsp;</span> }</span>
              <span className="id-place">#{ d.id }&nbsp;</span>
              <span className="create-date">创建于{manba(Number(d.createAt)).format('k')}</span>
              <span class="operation">
                <a href="#" className="btn" onClick={() => { this.editNote(d)}}>编辑</a>
                <span style={{ display: 'inline-block', width:'12px' }}></span>
                <a href="#" className="btn del" onClick={() => { this.delNote(d)}}>删除</a>
              </span>
            </p>
            <p className="content-row">{d.content}</p>
          </div>
        )
      });
    }

    const renderTag = (text) => {
      const isActive = (cateActive && cateActive === text) || (!cateActive && !text);
      return <span data-cate={text} className={isActive ? 'tag active' : 'tag' } onClick={(e) => {this.handleCateClick(e) }}>{text || '全部(' + count + ')'}</span>
    }

    const renderCateList = () => {
      return [renderTag(), ...this.state.cateTextList.map(d => {
        return d ? renderTag(d) : ''
      })];
    }

    return <div className="page write-mode">
      <div className="edit-zone">
        <input className="editor-input" value={this.state.input} placeholder="请输入内容" onChange={(e) => { this.handleInputChange(e) }} />
        {
          this.state.input ?
          <button onClick={() => { this.handleNoteSave() }}>{ editingNote ? '保存' : '新建' }</button> : ''
        }
        {
          this.state.input ?
          <button onClick={() => { this.cancelEdit() }}>{ '取消' }</button> : ''
        }
      </div>

      {
        this.state.loading ?
        <div className="loading-banner"><span className="notice">加载中...</span></div> : <div className="page-main">
          <div className="category-list">
            { this.state.noteVisible ? renderCateList() : <span className="notice">隐藏模式中，ctrl+h切换为“可见模式”</span> }
          </div>
          <div className="note-list">
            { this.state.noteVisible ? renderCateTags() : ''}
          </div>
        </div>
      }
    </div>;
  }

  generateSettingPanel() {
    return <div className="setting">
      <input name="mode" type="checkbox" onChange={() => { this.switchMode() }}/>🔨🔨🔨🔨
    </div>
  }

  render () {
    const settingPanel = this.generateSettingPanel();
    return (
      <div className="app">
        { this.state.gatherMode ? this.generateOverviewPage() : this.generateWritePage() }
        { settingPanel }
      </div>
    );
  }
}

export default App;