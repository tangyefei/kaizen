export default {
  get(name) {
    return localStorage.getItem('note_' + name);
  },
  set(name, value) {
    return localStorage.setItem('note_' + name, value);
  }
}