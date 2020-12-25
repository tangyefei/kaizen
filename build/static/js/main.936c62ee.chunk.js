(this["webpackJsonpkaizen-web"]=this["webpackJsonpkaizen-web"]||[]).push([[0],{16:function(t,e,n){},17:function(t,e,n){},18:function(t,e,n){"use strict";n.r(e);var o=n(0),a=n(1),s=n.n(a),i=n(5),c=n.n(i),r=(n(16),n(4)),l=n(6),u=n(7),d=n(2),h=n(10),g=n(9),f=(n(17),null),j={indexedDB:window.indexedDB||window.webkitindexedDB||window.msIndexedDB||window.mozIndexedDB,openDB:function(t,e,n,o){n=n||1;var a=this.indexedDB.open(t,n);return a.onerror=function(t){console.log("IndexedDB\u6570\u636e\u5e93\u6253\u5f00\u9519\u8bef")},a.onsuccess=function(t,e){f=t.target.result,e&&"function"===typeof e&&e(f),null!=f&&console.log("\u6570\u636e\u5e93\u6253\u5f00\u6210\u529f")},a.onupgradeneeded=function(n){if(console.log("\u6570\u636e\u5e93\u7248\u672c\u53d8\u5316"),console.log("\u521b\u5efa\u6570\u636e\u5e93"+t),!(f=n.target.result).objectStoreNames.contains(e)){var o=f.createObjectStore(e,{keyPath:"id",autoIncrement:!0});o.createIndex("createAt","createAt",{unique:!0}),o.createIndex("category","category",{unique:!1})}},a},add:function(t,e){if(null!=f){console.log(f,e);var n=f.transaction([t],"readwrite").objectStore(t).add(e);n.onsuccess=function(t){console.log("\u6570\u636e\u5199\u5165\u6210\u529f")},n.onerror=function(t){console.log("\u6570\u636e\u5199\u5165\u5931\u8d25")}}},foreach:function(t){if(null!=f){console.log(f);var e=f.transaction([t],"readwrite").objectStore(t).openCursor();e.onerror=function(t){console.log("\u4e8b\u52a1\u5931\u8d25")},e.onsuccess=function(t){var n=e.result;n?(console.log(n),console.log(n.key),console.log(n.value),n.continue()):console.log("\u672a\u83b7\u5f97\u6570\u636e\u8bb0\u5f55")}}},searchAll:function(t,e){if(null!=f){console.log(f);var n=f.transaction([t],"readonly").objectStore(t).getAll();n.onerror=function(t){console.log("\u4e8b\u52a1\u5931\u8d25")},n.onsuccess=function(t){n.result?(console.log(n.result),console.log("callback, result:",n.result),e(n.result)):console.log("\u672a\u83b7\u5f97\u6570\u636e\u8bb0\u5f55")}}}},b=n(8),p=n.n(b);var v=function(t){j.openDB("kaizen","notes",1),setTimeout((function(){j.searchAll("notes",(function(e){t(e)}))}),2e3)},y=function(t){j.add("notes",t)},w=function(t){return sessionStorage.getItem("note_"+t)},m=function(t,e){return sessionStorage.setItem("note_"+t,e)},k=function(t){Object(h.a)(n,t);var e=Object(g.a)(n);function n(t){var o;return Object(l.a)(this,n),(o=e.call(this,t)).state={input:"",inputList:[],activeCate:null,categoryList:[],showList:!!w("showList"),loading:!0},console.log(o.state.inputList),o.handleChange=o.handleChange.bind(Object(d.a)(o)),o.handleClick=o.handleClick.bind(Object(d.a)(o)),o.handleFilter=o.handleFilter.bind(Object(d.a)(o)),o.listen(),v((function(t){t.sort((function(t,e){return e.createAt-t.createAt}));var e=Array.from(new Set(t.map((function(t){return Array.isArray(t.category)&&t.category.length?t.category[0]:null}))));o.setState({loading:!1,inputList:t,categoryList:e})})),o}return Object(u.a)(n,[{key:"listen",value:function(){var t=this;document.addEventListener("keydown",(function(e){e.ctrlKey&&72===e.keyCode&&t.toggleShowList()}))}},{key:"toggleShowList",value:function(){this.setState({showList:!this.state.showList}),m("showList",this.state.showList?"1":"")}},{key:"handleChange",value:function(t){this.setState({input:t.target.value})}},{key:"handleFilter",value:function(t){var e=t.target.dataset.cate;this.setState({activeCate:e})}},{key:"handleClick",value:function(t){var e=function(t){var e=t.split(" "),n=t,o=[];return e.length>1&&e[0].length<15&&(o=e[0].split("/"),n=e[1]),{category:o,content:n}}(this.state.input),n=e.content,o=e.category,a={createAt:(new Date).getTime(),content:n,category:o};this.setState({input:"",inputList:[a].concat(Object(r.a)(this.state.inputList))}),y(a)}},{key:"render",value:function(){var t=this,e=this.handleFilter,n=this.state.inputList.length,a=this.state.activeCate,s=(this.state.activeCate?this.state.inputList.filter((function(e){return Array.isArray(e.category)&&e.category[0]===t.state.activeCate})):this.state.inputList).map((function(t){return Object(o.jsxs)("div",{className:"note-item",children:[Object(o.jsxs)("p",{className:"desc",children:[t.category&&t.category.join("/"),"\xa0",Object(o.jsxs)("span",{className:"create-date",children:["\u521b\u5efa\u4e8e",p()(Number(t.createAt)).format("k")]})]}),Object(o.jsx)("p",{children:t.content})]})})),i=function(t){var s=a&&a===t||!a&&!t;return Object(o.jsx)("span",{"data-cate":t,className:s?"active":"",onClick:e,children:t||"\u5168\u90e8("+n+")"})},c=[i()].concat(Object(r.a)(this.state.categoryList.map((function(t){return t?i(t):""}))));return Object(o.jsx)("div",{className:"app",children:Object(o.jsxs)("div",{className:"page",children:[Object(o.jsx)("input",{className:"editorInput",value:this.state.input,placeholder:"\u8bf7\u8f93\u5165\u5185\u5bb9",onChange:this.handleChange}),Object(o.jsx)("button",{onClick:this.handleClick,children:"\u5b8c\u6210"}),Object(o.jsx)("div",{class:"loading-banner",children:this.state.loading?"\u52a0\u8f7d\u4e2d...":""}),Object(o.jsx)("div",{className:"category-list",children:this.state.showList?c:""}),this.state.showList?s:""]})})}}]),n}(s.a.Component),L=function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,19)).then((function(e){var n=e.getCLS,o=e.getFID,a=e.getFCP,s=e.getLCP,i=e.getTTFB;n(t),o(t),a(t),s(t),i(t)}))};c.a.render(Object(o.jsx)(s.a.StrictMode,{children:Object(o.jsx)(k,{})}),document.getElementById("root")),L()}},[[18,1,2]]]);
//# sourceMappingURL=main.936c62ee.chunk.js.map