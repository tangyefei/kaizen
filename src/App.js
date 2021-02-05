import './App.css';
import React from 'react';
import AppHeader from './components/header';
import AppBody from './components/body';
import AppSider from './components/sider';
import Editor from './components/editor/index';
// import IndexedDB from './database/indexed-db';

import NoteDao from './database/note';
import NoteList from './components/note-list';
// import NoteList from './components/note-list';
class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      noteList: [],
    }
    this.getAllNotes = this.getAllNotes.bind(this);
  }
  componentDidMount() {
    this.getAllNotes();
  }


  // openDataBase() {
  //   IndexedDB.openDB('kaizen', 'notes', 1);
  // }

  getAllNotes() {
    NoteDao.getAll((noteList) => {
      noteList.sort((a,b) => b.createAt - a.createAt );

      // const cateTextList = Array.from(new Set( noteList.ma0p(d => d.category[0]) ));
      // const dates = Array.from(new Set(noteList.map(d => manba(Number(d.createAt)).format()))).sort((a,b) => b - a);
      this.setState({
        loading: false,
        noteList,
      })
    });
  }

  handleNoteAdded(note) {
    this.setState({
      noteList: [note, ...this.state.noteList],
    });
  }


  handleNoteDeleted(id) {
    this.setState({
      noteList: this.state.noteList.filter(d => d.id !== id),
    });
  }

  render () {
    const { noteList } = this.state;

    return (
      <div className="app">
        <AppSider/>
        <AppBody>
          <AppHeader/>
          <div className="app-body__main">
            <Editor handleNoteAdded={(note) => { this.handleNoteAdded(note) }}/>

            <NoteList handleNoteDeleted={(id) => { this.handleNoteDeleted(id) }} datas={noteList}></NoteList>
          </div>
        </AppBody>
      </div>
    );
  }
}

export default App;