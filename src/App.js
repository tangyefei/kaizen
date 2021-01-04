import manba from 'manba';
import React from 'react';

import Note from './model/note';
import NoteDao from './database/note';
import Setting from './setting/index';
import Tag from './components/tag';

import './App.css';

function debounce(fn, delay) {
  var timer
  return function () {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

const CHAR_H_KEYCODE = 72;
const CHAR_M_KEYCODE = 77;
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
      gatherMode: false,
      textRef: null,
      inputRef: null,
      showTextarea: false,
      cateSelected: null,
      dateActive: null,
    };
    this.switchInputStyle = debounce(this.switchInputStyle.bind(this), 1200);
    this.handleCateClick = this.handleCateClick.bind(this);
    this.listen();
    this.getAllNotes();
  }

  handleCateChange(e) {
    this.setState({
      cateSelected: e.target.value
    })
  }

  handleComposition(e) {
    if (e.type === 'compositionend') {
      // composition is end
      this.setState({
        isOnComposition: false
      });
    } else {
      // in composition
      this.setState({
        isOnComposition: true
      });
    }
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
      const dateActive = dates[0];

      // const noteList = this.state.noteList;
      this.setState({
        loading: false,
        noteList,
        cateTextList,
        dates,
        dateActive,
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

  switchInputStyle() {
    if(this.state.isOnComposition) return;

    const currStatus = this.state.showTextarea;
    const targetStatus = this.state.input.length > 50;
      if (targetStatus !== currStatus) {
        const prevRef = this[targetStatus ? 'inputRef' : 'textRef']
        const cursorPos = {
          start: prevRef.selectionStart,
          end: prevRef.selectionEnd,
        };
        this.setState({
          showTextarea: targetStatus
        }, () => {
          const currRef = this[targetStatus ? 'textRef' : 'inputRef']
          currRef.focus();
          currRef.setSelectionRange(cursorPos.start, cursorPos.end);
        })
      }
  }

  handleInputChange(e) {
    this.setState({
      input: e.target.value
    }, this.switchInputStyle);
  }
  handleCateClick(text) {
    this.setState({
      cateActive: text,
      cateSelected: text
    });
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
        }, this.switchInputStyle);
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
        }, this.switchInputStyle)
      });
    }
  }

  editNote(note) {
    this.setState({
      editingNote: note,
      input: `#${note.category[0]}# ${note.content}`,
      cateSelected: note.category
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

  handleDateClick(e) {
    const date = e.target.dataset.date;
    this.setState({
      dateActive: date
    })

  }

  generateOverviewPage() {
    const { cateActive, dateActive, cateTextList, noteList, dates } = this.state;
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

    const generateCateSection = (noteList) => {
      return noteList.map(d => {
        return <div className="note-item">
          <p className={d.done ? 'content-row deleted' : 'content-row'}>{this.generateContent(d.content)}</p>
        </div>
      })
    }
    // const editZone = this.generateEditZone();
    //   { editZone }
      // const noteList = dailyList.filter(input => input.category[0] === this.state.cateActive);
      {/* { dateEls } */}
    return <div className={cateActive ? 'page gather-mode' : 'page gather-mode  all-cates'}>
      { renderCateList() }
      {
        cateActive ?
        <div className="nodate-section">
          <div className="cate-note-list">
            { generateCateSection(dailyList.filter(input => input.category[0] === cateActive)) }
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

      // return {
      //   noteList.length > 0 ?
      //   (<div>
      //     <h4>{ cate }</h4>
      //     {
      //       noteList.map(input => {
      //         return <div className="note-item">
      //           <p className="content-row">{ this.generateContent(input.content) }</p>
      //         </div>
      //       })
      //     }
      //   </div>) : ''
      // }
  }

  generateEditZone() {
    const { input, editingNote, cateActive, noteList } = this.state;
    return (
      <div className="edit-zone">
        {/* <select value={this.state.cateSelected} onChange={(e) => { this.handleCateChange(e) }}>
          {['未分类', ...this.state.cateTextList.filter(d => !!d)].map((option) => (
            <option value={option}>{option}</option>
          ))}
        </select> */}
        {
        this.state.showTextarea ?
          <textarea ref={(input) => { this.textRef = input; }} className="editor-textarea" value={this.state.input} placeholder="请输入内容" onChange={(e) => { this.handleInputChange(e) }} />
        : <input
        ref={(input) => { this.inputRef = input; }}
        onCompositionStart={(e) => this.handleComposition(e)}
        onCompositionUpdate={(e) => this.handleComposition(e)}
        onCompositionEnd={(e) => this.handleComposition(e)}
        className="editor-input" value={this.state.input}  placeholder="#主题# 写点什么吧~" onChange={(e) => { this.handleInputChange(e) }} />
        }

        {
          this.state.input ?
          <button className={this.state.showTextarea ? 'float-right primary': 'primary'} onClick={() => { this.handleNoteSave() }}>{ editingNote ? '修改' : '完成' }</button> : ''
        }
        {
          this.state.editingNote && this.state.input ?
          <button className={this.state.showTextarea ? 'float-right': ''} onClick={() => { this.cancelEdit() }}>{ '取消' }</button> : ''
        }
      </div>
    )
  }

  generateWritePage() {
    const editZone = this.generateEditZone();
    const { input, editingNote, cateActive, noteList } = this.state;
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

    // value={this.state.input}
    return <div className="page write-mode">
      { editZone }
      {
        this.state.loading ?
        <div className="loading-banner"><div className="notice">加载中...</div></div> : <div className="page-main">
          {/* <div className="category-list">
            { this.state.noteVisible ? renderCateList() : <span className="notice">隐藏模式中，ctrl+h切换为“可见模式”</span> }
          </div> */}
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
        { this.state.gatherMode ? this.generateOverviewPage() : this.generateWritePage() }
      </div>
    );
  }
}

export default App;