var db = null;

export default {
  indexedDB: window.indexedDB || window.webkitindexedDB || window.msIndexedDB || window.mozIndexedDB,

  openDB(dbname, objectStoreName, version, onSuccess) {
    var version = version || 1

    var request = this.indexedDB.open(dbname, version)

    request.onerror = function(event) {
        console.log('IndexedDB数据库打开错误')
    }

    request.onsuccess = function(event, callback) {
        db = event.target.result;
        if (callback && (typeof callback === 'function')) {
            callback(db)
        }
        if (db != null) {
            console.log('数据库打开成功')
        }
    }

    request.onupgradeneeded = function(event) {
        console.log('数据库版本变化')
        console.log('创建数据库' + dbname)
        db = event.target.result;

        if (!db.objectStoreNames.contains(objectStoreName)) {
            // 创建对象仓库，并设置主键自增
            var objectStore = db.createObjectStore(objectStoreName, {
                keyPath: 'id',
                autoIncrement: true
            })

            // 创建索引（根据需要创建）
            objectStore.createIndex('createAt', 'createAt', {
                unique: true
            })
            objectStore.createIndex('category', 'category', {
                unique: false
            })
        }
    }

    return request;
  },

  add(objectStoreName, argument, callback) {
    if (db != null) {
        console.log(db, argument)

        // 执行事务，添加数据到对象仓库（表）
        var request = db.transaction([objectStoreName], 'readwrite')
            .objectStore(objectStoreName)
            .add(argument);

        request.onsuccess = function(event) {
            console.log('数据写入成功', event);
            callback(event.target.result);
        };

        request.onerror = function(event) {
            console.log('数据写入失败');
        }
    }
  },
  foreach: function(objectStoreName) {
    if (db != null){
        console.log(db)

        // 执行事务，从对象仓库（表）中获取所有数据
        var request = db.transaction([objectStoreName], 'readwrite')
            .objectStore(objectStoreName).openCursor()

        // 数据获取失败
        request.onerror = function(event) {
            console.log('事务失败')
        }

        //数据获取成功
        request.onsuccess = function(event) {
            let cursor = request.result
            if (cursor) {
                // 遍历打印所有数据
                console.log(cursor)
                console.log(cursor.key)
                console.log(cursor.value)
                cursor.continue()
            } else {
                console.log('未获得数据记录')
            }
        };
    }
  },

  searchAll: function(objectStoreName, callback/*, index, data*/) {
    if (db != null){
        console.log(db)

        // 执行事务，从对象仓库（表）中获取所有数据
        var request = db.transaction([objectStoreName], 'readonly')
            .objectStore(objectStoreName).getAll()//.index(index).getAll(data)

        // 数据获取失败
        request.onerror = function(event) {
            console.log('事务失败')
        }

        //数据获取成功
        request.onsuccess = function(event) {
            if (request.result) {
                // 遍历打印所有数据
                // console.log(request.result)
                // console.log("callback, result:", request.result)
                callback(request.result);
            } else {
                console.log('未获得数据记录')
            }
        };
    }
  },

  delete(objectStoreName, id, callback = ()=>{}) {
    if (db != null){
        console.log(db)

        // 执行事务，从对象仓库（表）中获取所有数据
        var request = db.transaction([objectStoreName], 'readwrite')
            .objectStore(objectStoreName).delete(id)

        // 数据获取失败
        request.onerror = function(event) {
            console.log('事务失败')
        }

        //数据获取成功
        request.onsuccess = function(event) {
            callback();
            if (request.result) {
                // 遍历打印所有数据
                console.log(request.result)
            } else {
                console.log('未获得数据记录')
            }
        };
    }

  },

  update: function(objectStoreName, argument, callback) {
    if (db != null) {
        console.log(db)

        // 执行事务，添加数据到对象仓库（表）
        var request = db.transaction([objectStoreName], 'readwrite')
            .objectStore(objectStoreName)
            .put(argument);

        request.onsuccess = function(event) {
            callback()
            console.log('数据更新成功');
        };

        request.onerror = function(event) {
            console.log('数据更新失败');
        }
    }
  },


}