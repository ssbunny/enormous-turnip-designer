var container = document.getElementById('designer');
var a = `{"workbook":{"activeSheet":"工作表sfss1","sheets":[{"name":"test1","selection":{"row":4,"col":3,"endRow":7,"endCol":6},"data":[["1",null,null,"1",null],["2",null,null,null,null],["ef",null,"efs",null,null],[null,null,null,null,null],[null,null,"dfsdf",null,null],[null,null,null,null,"fsdf"]],"rowHeights":[null,null,null,null,null,null],"colWidths":[50,50,50,50,50]}]}}`;


var foo = new BrickSpreadSheet(container, `{"workbook":{"activeSheet":"工作表1","sheets":[{"name":"工作表1","selection":{"row":4,"col":2,"endRow":4,"endCol":2},"data":[["e",null,null],["e","g",null],["aa",null,null],[null,"e","aaa"],[null,"eef",null]],"rowHeights":[24,null,null,null,null],"colWidths":[50,50,50],"mergeCells":false,"cellMetas":[[{"row":0,"col":0,"isFormula":false,"sourceValue":"e","value":"e"},{"row":0,"col":1,"isFormula":false,"sourceValue":null,"value":null},{"row":0,"col":2,"isFormula":false,"sourceValue":null,"value":null}],[{"row":1,"col":0,"isFormula":false,"sourceValue":"e","value":"e"},{"row":1,"col":1,"isFormula":false,"sourceValue":"g","value":"g"},{"row":1,"col":2,"isFormula":false,"sourceValue":null,"value":null}],[{"row":2,"col":0,"isFormula":false,"sourceValue":"aa","value":"aa"},{"row":2,"col":1,"isFormula":false,"sourceValue":null,"value":null},{"row":2,"col":2,"isFormula":false,"sourceValue":null,"value":null}],[{"row":3,"col":0,"isFormula":false,"sourceValue":null,"value":null},{"row":3,"col":1,"isFormula":false,"sourceValue":"e","value":"e"},{"row":3,"col":2,"isFormula":false,"sourceValue":"aaa","value":"aaa"}],[{"row":4,"col":0,"isFormula":false,"sourceValue":null,"value":null},{"row":4,"col":1,"isFormula":false,"sourceValue":"eef","value":"eef"},{"row":4,"col":2,"isFormula":false,"sourceValue":null,"value":null}]]}]},"id":"brick-ssd-1-efb0205b24f441a4"}`);
var wb = foo.getWorkbookInstance();

var hot = wb.getActiveSheet().handsontable;

function save() {
    foo.saveState();
}
