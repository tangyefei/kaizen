import React from 'react';
import './index.css';
import utils from '../../utils';
import NoteDao from '../../database/note';

class NoteItem extends React.Component {
  constructor(props){
    super(props);
  }

  delNote(note) {
    const id = note.id;
    NoteDao.delete(id, this.props.handleNoteDeleted(id))
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

  render () {
    // TODO
    // 1. 为什么hover会导致日期都懂
    // 2. 如何解决删除后的震动问题
    const { data:d } = this.props;
    return (
      <div className="note-item">
        <p className="desc-row">
          <span className="create-date">创建于 {utils.formatDate(Number(d.createAt))}</span>
          <span className="operation">
            <a href="#" className="btn del" onClick={() => { this.delNote(d)}}>❌ </a>
          </span>
        </p>
        <p className={d.done ? 'content-row deleted' : 'content-row'}>
          {d.category == 'n/a' ? '' : <span className="tag">{d.category}</span>}
          {this.generateContent(d.content)}
        </p>
      </div>
    );
  }
}

export default NoteItem;