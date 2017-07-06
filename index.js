var container = document.getElementById('designer');

var ss = {}

var foo = new BrickSpreadSheet(
    container,
);

var wb = foo.getWorkbookInstance();
var sheet = wb.getActiveSheet();
var hot = sheet.handsontable;


function save() {
    console.log(foo.getExchangeData())
}

function test() {
}


