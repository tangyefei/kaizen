import manba from 'manba';

export default class Note {
  /*
    category: Array
    content: String
    createAt: Number
    done: Boolean
  */
  constructor(category, content, createAt) {
    this.category = category;
    this.content = content;
    this.createAt = createAt;
    this.done = false;
  }
}

Note.createFromText = function(input) {
  let category = 'n/a';
  let text = input;
  let match = input.match(/^\#(.+)\#\s{1,}(.+)$/)
  if(match) {
    category = match[1];
    text = match[2];
  }
  return new Note([category], text, (new Date()).getTime());
}