var container = document.getElementById('designer');
var a = `{"workbook":{"activeSheet":"工作表sfss1","sheets":[{"name":"test1","selection":{"row":4,"col":3,"endRow":7,"endCol":6},"data":[["1",null,null,"1",null],["2",null,null,null,null],["ef",null,"efs",null,null],[null,null,null,null,null],[null,null,"dfsdf",null,null],[null,null,null,null,"fsdf"]],"rowHeights":[null,null,null,null,null,null],"colWidths":[50,50,50,50,50]}]}}`;

var foo = new SpreadSheet(container, `{"workbook":{"activeSheet":"工作ee表1","sheets":[{"name":"工作ee表1","selection":{"row":1,"col":2,"endRow":1,"endCol":2},"data":[["",null,"=B2+B3",null,null,null],["","1",null,"se",null,null],[null,"2",null,null,"ef",null],[null,"3",null,null,null,null],[null,null,null,"3",null,"ef"],[null,null,null,null,null,null],[null,null,null,null,null,null],[null,null,null,null,null,"sdf"]],"rowHeights":[24,null,null,null,null,null,null,null],"colWidths":[50,50,50,50,50,50],"mergeCells":[{"row":1,"col":4,"rowspan":2,"colspan":3}]}]}}`);
var wb = foo.getWorkbookInstance();

console.log(foo.getExchange());
