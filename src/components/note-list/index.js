import React from 'react';
import './index.css';
import NoteItem from '../note-item';

class NoteList extends React.Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <div className="note-list">
        { this.props.datas.map(d => (<NoteItem handleNoteDeleted={this.props.handleNoteDeleted} data={d} key={d.createAt}></NoteItem>)) }
      </div>
    );
  }
}

export default NoteList;