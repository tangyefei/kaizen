import React from 'react';

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


class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
      textRef: null,
      inputRef: null,
      showTextarea: false,
    }

    this.switchInputStyle = debounce(this.switchInputStyle.bind(this), 1200);
  }

  updateInput(input){
    this.setState({ input });
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

  handleNoteSave() {
    this.props.handleNoteSave(this.state.input, () => {
      this.setState({
        input: '',
      });
      this.switchInputStyle()
    })
  }

  cancelEdit() {
    this.setState({ input: '', })
    this.props.cancelEdit();
  }

  render() {
    return <div className="edit-zone">
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
        <button className={this.state.showTextarea ? 'float-right primary': 'primary'} onClick={() => { this.handleNoteSave() }}>{ this.props.editingNote ? '修改' : '完成' }</button> : ''
      }
      {
        this.props.editingNote && this.state.input ?
        <button className={this.state.showTextarea ? 'float-right': ''} onClick={() => { this.cancelEdit() }}>{ '取消' }</button> : ''
      }
    </div>
  }
}

export default Editor;