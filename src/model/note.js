export default class Note {
  /*
    category: Array
    content: String
    createAt: Number
  */
  constructor(category, content, createAt) {
    this.category = category;
    this.content = content;
    this.createAt = createAt;
  }
}

Note.createFromText = function(text, category = '未分类') {
  // const splits = text.split(' ');
  // let content = text, category = [];

  // if(splits.length > 1) {
  //   // 定义维数组结构，为了以后支持多级分类进行兼容
  //   category = [ splits[0] ];
  //   content = splits.slice(1).join(' ');
  // }
  return new Note([category], text, (new Date()).getTime() );
}