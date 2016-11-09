var container = document.getElementById('designer');
var a = `{"workbook":{"activeSheet":"工作表sfss1","sheets":[{"name":"test1","selection":{"row":4,"col":3,"endRow":7,"endCol":6},"data":[["1",null,null,"1",null],["2",null,null,null,null],["ef",null,"efs",null,null],[null,null,null,null,null],[null,null,"dfsdf",null,null],[null,null,null,null,"fsdf"]],"rowHeights":[null,null,null,null,null,null],"colWidths":[50,50,50,50,50]}]}}`;


var foo = new BrickSpreadSheet(container, {
    persistent: {
        key: 'foooooooooooobar'
    }
});
var wb = foo.getWorkbookInstance();

var hot = wb.getActiveSheet().handsontable;

function save() {
    foo.saveState();
}
