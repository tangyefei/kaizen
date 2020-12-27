import IndexedDB from './indexed-db.js';

export default {
  getAll: function(callback) {
    IndexedDB.openDB('kaizen', 'notes', 1);
    setTimeout(() => {
      IndexedDB.searchAll('notes', result => {
        callback(result)
      })
    }, 2000)
  },

  add(item, callback) {
    IndexedDB.add('notes', item, callback);
  },
  update(item, callback) {
    IndexedDB.update('notes', item, callback);
  },
  delete(id, callback) {
    IndexedDB.delete('notes', id, callback);
  },
}
