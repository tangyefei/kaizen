import React from 'react';
import './index.css';
import Note from '../../model/note';
import NoteDao from '../../database/note';
// function debounce(fn, delay) {
//   var timer
//   return function () {
//     var context = this
//     var args = arguments
//     clearTimeout(timer)
//     timer = setTimeout(function () {
//       fn.apply(context, args)
//     }, delay)
//   }
// }

const CHAR_ENTER_KEYCODE = 13;

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
      textRef: null,
      // inputRef: null,
    //   showTextarea: false,
    }
    this.handleNoteSave = this.handleNoteSave.bind(this);
    this.listen();
    // this.switchInputStyle = debounce(this.switchInputStyle.bind(this), 1200);
  }

  listen() {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey  && e.keyCode === CHAR_ENTER_KEYCODE) {
        this.handleNoteSave();
      }
    });
  }

  // updateInput(input){
  //   this.setState({ input }, this.switchInputStyle);
  // }

  // handleComposition(e) {
  //   if (e.type === 'compositionend') {
  //     // composition is end
  //     this.setState({
  //       isOnComposition: false
  //     });
  //   } else {
  //     // in composition
  //     this.setState({
  //       isOnComposition: true
  //     });
  //   }
  // }

  // switchInputStyle() {
  //   if(this.state.isOnComposition) return;

  //   const currStatus = this.state.showTextarea;
  //   const targetStatus = this.state.input.length > 50;
  //   if (targetStatus !== currStatus) {
  //     const prevRef = this[targetStatus ? 'inputRef' : 'textRef']
  //     const cursorPos = {
  //       start: prevRef.selectionStart,
  //       end: prevRef.selectionEnd,
  //     };
  //     this.setState({
  //       showTextarea: targetStatus
  //     }, () => {
  //       const currRef = this[targetStatus ? 'textRef' : 'inputRef']
  //       currRef.focus();
  //       currRef.setSelectionRange(cursorPos.start, cursorPos.end);
  //     })
  //   }
  // }

  handleInputChange(e) {
    this.setState({
      input: e.target.value
    });
  }
  // cancelEdit() {
  //   this.setState({ input: '', })
  //   this.props.cancelEdit();
  // }

  handleNoteSave() {
    const item = Note.createFromText(this.state.input);

    // if (this.state.editingNote) {
    //   const submitItem = Object.assign(this.state.editingNote, {
    //     content,
    //     category
    //   });
    //   if(createAt) {
    //     submitItem.createAt = createAt;
    //   }

    //   NoteDao.update(submitItem, () => {
    //     const listCopy = [ ...this.state.noteList ];
    //     const index = listCopy.findIndex(d => d.id === this.state.editingNote.id);
    //     listCopy.splice(index, 1, submitItem)

    //     this.setState({
    //       editingNote: null,
    //       noteList: listCopy
    //     });
    //   })
    // } else {
      // : useDefault ? [ this.state.cateActive ] : category
      // const useDefault = category.length === 0 && this.state.cateActive;
      // const item ={ createAt, content, category};
      // const { cateTextList } = this.state;

      NoteDao.add(item, (id) => {
        this.setState({
          input: '',
        }, this.props.handleNoteAdded(Object.assign(item, { id })));
        // this.setState({
        //   noteList: [Object.assign(item, { id }), ...this.state.noteList],
        //   cateTextList: cateTextList.indexOf(category[0]) > -1 ? cateTextList : [ category[0], ...cateTextList ]
        // })
      });
    // }
  }




  render() {
    return (
      <div className="editor">
        <textarea ref={(input) => { this.textRef = input; }} value={this.state.input} placeholder="请输入内容…" onChange={(e) => { this.handleInputChange(e) }} />
        <div className="btn-row">
          <button className="btn" onClick={ () => { this.handleNoteSave(); } }> 就这样 </button>
          <span>按 ⌘ Enter 发送</span>
        </div>
      </div>
    )
    // return <div className="edit-zone">
    //   {
    //   this.state.showTextarea ?
    //   : <input
    //   ref={(input) => { this.inputRef = input; }}
    //   onCompositionStart={(e) => this.handleComposition(e)}
    //   onCompositionUpdate={(e) => this.handleComposition(e)}
    //   onCompositionEnd={(e) => this.handleComposition(e)}
    //   className="editor-input" value={this.state.input}  placeholder="#主题# 写点什么吧~" onChange={(e) => { this.handleInputChange(e) }} />
    //   }

    //   {
    //     this.state.input ?
    //     <button className={this.state.showTextarea ? 'float-right primary': 'primary'} onClick={() => { this.handleNoteSave() }}>{ this.props.editingNote ? '修改' : '完成' }</button> : ''
    //   }
    //   {
    //     this.props.editingNote && this.state.input ?
    //     <button className={this.state.showTextarea ? 'float-right': ''} onClick={() => { this.cancelEdit() }}>{ '取消' }</button> : ''
    //   }
    // </div>
  }
}

export default Editor;