import manba from 'manba';
import React from 'react';
import Note from './model/note';

import NoteDao from './database/note';
import Setting from './setting/index';
import Tag from './components/tag';
import Editor from './components/editor';

import './App.css';

const CHAR_H_KEYCODE = 72;
const CHAR_M_KEYCODE = 77;

const WRITE_MODE = Symbol('WRITE_MODE');
const GATHER_MODE = Symbol('GATHER_MODE');
class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      cateTextList: [],
      cateActive: null,
      dates: [],
      noteList: [],
      editingNote: null,
      currMode: WRITE_MODE,
      noteVisible: !!(Setting.get('noteVisible')),
    };

    this.editorRef = React.createRef();
    this.handleNoteSave = this.handleNoteSave.bind(this);
    this.handleCateClick = this.handleCateClick.bind(this);

    this.listen();
    this.getAllNotes();
  }

  listen() {
    document.addEventListener('keydown', (e) => {
      console.log(e.keyCode)
      if (e.ctrlKey  && e.keyCode === CHAR_H_KEYCODE) {
        this.toggleNoteVisible()
      }
      else if (e.ctrlKey  && e.keyCode === CHAR_M_KEYCODE) {
        this.switchMode()
      }
    })
  }

  getAllNotes() {
    NoteDao.getAll((noteList) => {
      noteList.sort((a,b) => b.createAt - a.createAt );

      const cateTextList = Array.from(new Set( noteList.map(d => d.category[0]) ));
      const dates = Array.from(new Set(noteList.map(d => manba(Number(d.createAt)).format()))).sort((a,b) => b - a);

      this.setState({
        loading: false,
        noteList,
        cateTextList,
        dates,
      })
    })
  }

  switchMode() {
    this.setState({
      cateActive: null,
      currMode: this.state.currMode === WRITE_MODE ? GATHER_MODE : WRITE_MODE
    })
  }

  toggleNoteVisible() {
    this.setState({ noteVisible: !this.state.noteVisible });

    Setting.set('noteVisible', this.state.noteVisible ?  '1' : '');
  }

  handleCateClick(text) {
    this.setState({
      cateActive: text
    });
  }

  handleNoteSave(input, callback) {
    const { content, category, createAt } = Note.createFromText(input);

    if (this.state.editingNote) {
      const submitItem = Object.assign(this.state.editingNote, {
        content,
        category
      });
      if(createAt) {
        submitItem.createAt = createAt;
      }
      NoteDao.update(submitItem, () => {
        const listCopy = [ ...this.state.noteList ];
        const index = listCopy.findIndex(d => d.id === this.state.editingNote.id);
        listCopy.splice(index, 1, submitItem)

        this.setState({
          editingNote: null,
          noteList: listCopy
        }, callback);
      })
    } else {
      const useDefault = category.length === 0 && this.state.cateActive;
      const item ={ createAt, content, category: useDefault ? [ this.state.cateActive ] : category };
      const { cateTextList } = this.state;

      NoteDao.add(item, (id) => {
        this.setState({
          noteList: [Object.assign(item, { id }), ...this.state.noteList],
          cateTextList: cateTextList.indexOf(category[0]) > -1 ? cateTextList : [ category[0], ...cateTextList ]
        }, callback)
      });
    }
  }

  editNote(note) {
    this.editorRef.current.updateInput(`#${note.category[0]}# ${note.content}`)
    this.setState({
      editingNote: note
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

  cancelEdit() {
    this.setState({
      editingNote: null,
    })
  }

  toggleDone(note) {
    const submitItem = Object.assign(note, {
      done: !note.done
    });

    NoteDao.update(submitItem, () => {
      const listCopy = [ ...this.state.noteList ];
      const index = listCopy.findIndex(d => d.id === note.id);
      const matched = listCopy[index];
      matched.done  = submitItem.done;

      this.setState({
        noteList: listCopy
      })
    })

  }

  generateContent(str) {
    const reg = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?/g;
    const res = [];
    let match;
    let pos = 0;

    while(match = reg.exec(str)) {
      let url = match[0];
      let index = match.index;
      if(index > pos) {
        res.push(<span>{str.substring(pos, index)}</span>)
      }
      res.push(<a target="_blank" href={url}>{url}</a>)
      pos = index + url.length;
    }
    if(pos<str.length) res.push(<span>{str.substring(pos, str.length)}</span>);
    return res
  }


  generateOverviewPage() {
    const { cateActive, cateTextList, noteList, dates } = this.state;
    const copyList = [ ...noteList ];
    const dailyList = copyList.sort((a,b) => a.createAt - b.createAt );
    const renderTag = (text) => {
      const isActive = (cateActive && cateActive === text) || (!cateActive && !text);
      return <Tag key={text} text={text} defaultText="全部" isActive={isActive} handleClick={this.handleCateClick} />
    }

    const renderCateList = () => {
      let tagList = [renderTag(), ...cateTextList.map(d => {
        return d ? renderTag(d) : ''
      })];
      return <div className='cate-list'>{ tagList }</div>;
    }

    const generateCateSection = (noteList, showDate) => {
      return noteList.map(d => {
        return <div className="note-item">
          <p className={d.done ? 'content-row deleted' : 'content-row'}>{showDate ? manba(d.createAt).format('MM-DD') : ''} {this.generateContent(d.content)}</p>
        </div>
      })
    }
    return <div className={cateActive ? 'page gather-mode' : 'page gather-mode  all-cates'}>
      { renderCateList() }
      {
        cateActive ?
        <div className="nodate-section">
          <div className="cate-note-list">
            { generateCateSection(dailyList.filter(input => input.category[0] === cateActive), true) }
          </div>
        </div>
         :
        dates.map(date => {
          return <div className="date-section">
            <h5 class="date-title">{manba(date).format('nn')}</h5>
            {
              cateTextList.map(cate => {
              const noteList = dailyList.filter(input => input.category[0] === cate && manba(Number(input.createAt)).format() === date);
              if(noteList.length > 0) {
                return <div className="cate-note-list">
                  <h5>📁 { cate }</h5>
                  {
                    generateCateSection(noteList)
                  }
                </div>
              } else {
                return '';
              }
            })
            }
          </div>
        })
      }
    </div>
  }

  generateWritePage() {
    const { cateActive, noteList } = this.state;
    const list = cateActive ? noteList.filter(d => d.category[0] === this.state.cateActive) : this.state.noteList;

    const renderCateTags = () => {
      return list.map(d => {
        return (
          <div className="note-item">
            <p className="desc-row">
              <span>{ cateActive ? '' :  <span>{ d.category && d.category.join('/') }&nbsp;</span> }</span>
              <span className="id-place">#{ d.id }&nbsp;</span>
              <span className="create-date">创建于{manba(Number(d.createAt)).format('k')}</span>
              {/* {cateActive + '_' + d.category.join('')} */}
              <span className="operation">
                {
                  d.category.join('') === '备忘' ?
                  <span>
                    <a href="#" className="btn" onClick={() => { this.toggleDone(d)}}>{d.done ? '未完' : '完成'}</a>
                    <span style={{ display: 'inline-block', width:'12px' }}></span>
                  </span> : ''
                }

                <a href="#" className="btn" onClick={() => { this.editNote(d)}}>编辑</a>
                <span style={{ display: 'inline-block', width:'12px' }}></span>
                <a href="#" className="btn del" onClick={() => { this.delNote(d)}}>删除</a>
              </span>
            </p>
            <p className={d.done ? 'content-row deleted' : 'content-row'}>{this.generateContent(d.content)}</p>
          </div>
        )
      });
    }

    return <div className="page write-mode">
      <Editor ref={this.editorRef} editingNote={this.state.editingNote} handleNoteSave={(a, b) => { this.handleNoteSave(a, b); }} cancelEdit={() => { this.cancelEdit(); }} />
      {
        this.state.loading ?
        <div className="loading-banner"><div className="notice">加载中...</div></div> : <div className="page-main">
          <div className="note-list">
            { this.state.noteVisible ? renderCateTags() : <div className="note-item"><div className="notice">隐藏模式中，ctrl+h切换为“可见模式”</div></div>}
          </div>
        </div>
      }
    </div>;
  }

  render () {
    return (
      <div className="app">
        { this.state.currMode === WRITE_MODE ? this.generateWritePage() : this.generateOverviewPage() }
      </div>
    );
  }
}

export default App;