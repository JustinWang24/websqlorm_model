# websqlorm_model
Basic model for WebSQL inspired by CodeIgniter Model

Important Notice:
	Please load jQuery lib before this one because most of function must use jquery utils.

Version 0.0.1
/*
	使用说明:
	1: 创建对象   
		- 设定表格需要的列名,必须包含 id 字段作为主键  
			var columns = ['name','phone','active'];
		- 设定数据库表名
			var table_name = 'customers';
		- 设定数据库名,如果不指定,则默认为 example_db
			var database_name = 'example_db';
		- 创建对象
			var customer = new JW_Model();
		- 初始化工作
			customer.init(columns,table_name,database_name);
	2: 使用对象
		- 给字段属性赋值
			customer.set('name','Justin Wang');
		- 取字段当前值
			customer.get('name');
		- 保存到数据库,如果没有给定参数,则将对象当前的属性值保存到数据库
			customer.insert({name:"Justin",phone:"18510209803",active:"1",id:"11"});
			或者: 
			customer.set('name','Justin Wang');
			customer.set('phone','13299990098');
			customer.set('active',1);
			customer.insert(); //将属性的当前值保存到数据库
		- 提取数据库的记录
			//根据 id 提取记录
			customer.retrieve(id,function(result_set){
				//处理查询结果的代码在回调函数中
			});
			//根据制定的字段值查询记录
			customer.retrieve_by(field_name,field_value,function(result_set){
				//处理查询结果的代码在回调函数中
			});
		- 更新数据库记录
			customer.update(id,data);  //根据指定的 id 来更新记录,新的值在 data 中,对象或者数组的形式
		- 删除数据库记录
			customer.remove(id);       //根据指定的 id 来删除记录
*/


/* 以下为一些示例代码 */
// var columns = ['name','phone','active'];
// var table_name = 'customers';
// var database_name = 'example_db';
// var customer = new JW_Model();
// customer.init(columns,table_name,database_name);
// customer.set('name','Justin Wang');
// customer.set('phone','13299990098');
// customer.set('active',1);
//customer.insert({name:"Justin",phone:"18510209803",active:"1",id:"11"});
// customer.insert();

//返回的结果集的处理示例
// customer.retrieve(11,function(resultSet){
// 	var len = resultSet.rows.length;
// 	if (len>0) {
// 		var tempRow = resultSet.rows.item(0);
// 		console.log(tempRow);
// 	}
// });

// customer.retrieve_by('phone','13299990098',function(resultSet){
// 	var len = resultSet.rows.length;
// 	console.log(len);
// 	console.log(typeof(len));
// 	if (len>0) {
// 		var tempRow = resultSet.rows.item(0);
// 		console.log(tempRow);
// 	}
// });

// customer.set('name','Justin Wang');
// customer.set('phone','13299990099');
// customer.set('active',1);