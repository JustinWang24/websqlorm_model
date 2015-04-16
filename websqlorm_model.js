var isPrimaryKeySet = false;

function JW_Model(){
	var js_model = {
		properties:new Array(),
		dbName:'example_db',
		tableName:'',			//设置属性,表示数据库表的名字
		lastSqlStatement:'',    //设置属性,表示最后一个执行的手动查询语句
		_resultSet:{},			//设置属性,表示最后一个执行的查询的返回结果
		_database:null,
		_lastInsertId:null,
		_where:null,
		_order_by:" ORDER BY id DESC",
		_limit:'',

		init: function(columns,table_name,database_name){
			this.tableName = table_name;
			//给属性添加名称
			$.each(columns, function(index, columnName) {
				 js_model.properties[columnName] = "";
				 if(columnName=='id'){
				 	isPrimaryKeySet = true;
				 }
			});
			//检查是否主键已经设置好
			if (!isPrimaryKeySet) {
				this.properties['id'] = new Date().getTime();
			};
			//取得数据库对象
			if ( typeof(database_name) == "undefined") {
				//没有指定数据库名,则给一个默认的
				database_name = 'db_example';
			};
			this._database = window.openDatabase(database_name,"1.0",database_name,100000);

			if (typeof(this._database) == 'undefined') {
				console.log("Code:000 - 浏览器不支持 websql");
			}else{
				this._database.transaction(function(transaction_object){
					//如果数据库表不存在则创建它
					var sqlstmt = "CREATE TABLE IF NOT EXISTS "+js_model.tableName + "(";
					$.each(Object.keys(js_model.properties), function(index, val) {
						 /* iterate through array or object */
						 if (val=="id") {
						 	sqlstmt += "id unique,";
						 }else{
						 	sqlstmt += val + ",";
						 }
					});
					sqlstmt = sqlstmt.substring( 0, sqlstmt.length-1 ) + ")";
					transaction_object.executeSql(sqlstmt);
				}, function(err){
					console.log("Code:001 - 初始化时数据库错误: "+err.message);
				}, function(){
					console.log("初始化数据库成功");
				});
			}
		},
		//Setter 和 Getter方法
		set: function (field_name,field_value) {
			this.properties[field_name] = field_value;
		},
		get: function (field_name) {
			return this.properties[field_name];
		},
		/* Getter 和 Setter 结束*/

		/* 删除数据库表 */
		drop_table : function(tb_name){
			this._database.transaction(function(transaction_object){
				transaction_object.executeSql('DROP TABLE IF EXISTS DROP'+this.tableName);
			},function(err){
				console.log("Code:002 - 删除数据库表错误: "+err.message);
			},function(){
				console.log("删除数据库表成功");
			});
		},

		/* 删除数据库 */
		drop_database : function(db_name){
			this._database.transaction(function(transaction_object){
				transaction_object.executeSql('drop database if exists '+db_name,[],function(){});
			},function(err){
				console.log("Code:002 - 删除数据库错误: "+err.message);
			},function(){
				console.log("删除数据库成功");
			});
		},

		/* 执行一个查询语句 */
		query: function(stmt){
			this.lastSqlStatement = stmt;
			this._database.transaction(function(transaction_object){
				transaction_object.executeSql(this.lastSqlStatementm,[],function(tx, rs){
					this._resultSet = rs;
				});
			},function(err){
				console.log("Code:003 - 执行一个查询语句失败 - "+this.lastSqlStatement+" - : "+err.message);
			},function(){
				console.log("执行一个查询语句成功");
			});
		},

		/* 保存记录 */
		insert: function(data,callback){
			var _bean = data;
			if (typeof(_bean) == "undefined") {
				_bean = this.properties;
			}

			var sqlstmt = "INSERT INTO "+this.tableName+" (";
			$.each(Object.keys(_bean), function(index, val) {
				/* iterate through array or object */
				sqlstmt += val + ",";
			});
			sqlstmt = sqlstmt.substring( 0, sqlstmt.length-1 ) + ") VALUES(";

			$.each(Object.keys(_bean), function(index, val) {
				/* iterate through array or object */
				sqlstmt += '"'+_bean[val]+'",';
			});
			sqlstmt = sqlstmt.substring( 0, sqlstmt.length-1 ) + ")";

			this._database.transaction(
				function(transaction_object){
					transaction_object.executeSql(sqlstmt,[],function(tx,rs){
						js_model._lastInsertId = rs.insertId;
						if (typeof(callback)=='function') {
							callback(rs);
						};
					});
				},
				function(err){
					console.log("Code:004 - 执行一个插入语句失败 - "+this.lastSqlStatement+" - : "+err.message);
				},
				function(){
					console.log("执行一个插入语句成功");
				}
			);
			return this._lastInsertId;
		},

		/* 更新记录,key 是条件, data 是要更新的数据 */
		update: function(key,data,callback){
			var sqlstmt = "UPDATE " + this.tableName+" SET ";
			$.each(Object.keys(data), function(index, val) {
				 /* iterate through array or object */
				 sqlstmt += val + "='" + data[val]+"',"
			});
			sqlstmt = sqlstmt.substring( 0, sqlstmt.length-1 ) + " WHERE id='"+key+"'";
			this._database.transaction(
				function(transaction_object){
					transaction_object.executeSql(sqlstmt,[],function(tx,rs){
						if (typeof(callback)=='function') {
							callback(rs);
						};
					});
				},
				function(err){
					console.log("Code:004 - 执行一个更新语句失败 - "+this.lastSqlStatement+" - : "+err.message);
				},
				function(){
					console.log("执行一个更新语句成功");
				}
			);
		},

		/* 删除记录 */
		remove: function(id){
			var sqlstmt = "DELETE FROM " + this.tableName+" WHERE id='"+id+"'";
			this._database.transaction(
				function(transaction_object){
					transaction_object.executeSql(sqlstmt,[],function(tx,rs){
						console.log(rs);
					});
				},
				function(err){
					console.log("Code:004 - 执行一个删除语句失败 - "+sqlstmt+" - : "+err.message);
				},
				function(){
					console.log("执行一个删除语句成功");
				}
			);
		},

		/* 提取记录 */
		retrieve: function(id,callback){
			var sqlstmt = "SELECT * FROM " + this.tableName+" WHERE id='"+id+"'";
			this._database.transaction(
					function(transaction_object){
						transaction_object.executeSql(sqlstmt,[],function(tx,rs){
							if (typeof(callback)=='function') {
								callback(rs);
							};
						});
					},
					function(err){
						console.log("Code:010 - 执行一个查询语句失败 - "+sqlstmt+" - : "+err.message);
					},
					function(){
						console.log("执行一个查询语句成功");
					}
			);
		},

		/* 提取数据库中所有记录的条数 */
		count_all: function(){

		},

		/* 设置提取查询条件 */
		where: function(field_name,value){
			if (this._where == null) {
				this._where = " WHERE "+field_name + "='" +value+"'";
			} else{
				this._where += " AND "+field_name + "='" +value+"'";
			};
			return this._where;
		},

		/* 设置提取查询条件 like */
		like: function(field_name,value){
			
		},

		/* 设置提取查询条件 in */
		where_in: function(field_name,value){
			
		},

		/* 设置查询条件 or */
		or_where: function(field_name,value){
			
		},

		/* 设置 order by 条件 */
		order_by: function(field_name,value){
			return this._order_by = " ORDER BY "+field_name+" "+value+"";
		},

		/* 设置 limit 条件 */
		limit: function(size,start){
			if (typeof(start)=="undefined") {
				//没事指定从哪里开始
				this._limit = " LIMIT 0,"+size+"";
			} else{
				this._limit = " LIMIT "+start+","+size+"";
			};
			return this._limit;
		},

		/* 根据条件提取记录 */
		retrieve_by: function(field_name,value,callback){
			if(typeof(field_name) !== "undefined" && typeof(value) !== "undefined"){
				this._database.transaction(
					function(transaction_object){
						var sqlstmt = "SELECT * FROM "+js_model.tableName+" "+js_model.where(field_name,value);
						transaction_object.executeSql(sqlstmt,[],function(tx,rs){
							js_model._resultSet = rs;
							if (typeof(callback)=='function') {
								callback(rs);
							};
						});
					},
					function(err){
						console.log("Code:005 - 执行一个查询语句失败 - "+js_model.lastSqlStatement+" - : "+err.message);
					},
					function(){
						console.log("执行一个查询语句成功");
					}
				);
			}
		}
	};
	return js_model;
}