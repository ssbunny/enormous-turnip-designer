var container = document.getElementById('designer');

var foo = new BrickSpreadSheet(
    container,
    `{"workbook":{"activeSheet":"工作表1","sheets":[{"name":"工作表1","selection":{"row":3,"col":0,"endRow":3,"endCol":0},"data":[["1",null],["2","磨煤机单耗"],["3","=130/112"],["=A1+A3",null],["=262","=112"],["=371",null],["=A5+A6",null]],"rowHeights":[24,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"colWidths":[153,291,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"mergeCells":null,"cellMetas":[[{"row":0,"col":0,"isFormula":false,"sourceValue":"1","value":"1","styles":{"alignments":["Left"],"fontWeight":"bold","color":"red"}},{"row":0,"col":1,"isFormula":false,"sourceValue":null,"value":null,"styles":{"alignments":["Center"]}}],[{"row":1,"col":0,"isFormula":false,"sourceValue":"2","value":"2","styles":{"fontWeight":"bold","color":"red","backgroundColor":"#EEE"}},{"row":1,"col":1,"isFormula":false,"sourceValue":"磨煤机单耗","value":"磨煤机单耗","styles":{"alignments":["Right","Bottom"],"fontStyle":"italic","fontWeight":"bold","textDecoration":"underline","color":"red","backgroundColor":"#EEE"}}],[{"row":2,"col":0,"isFormula":false,"sourceValue":"3","value":"3","styles":{"fontFamily":"黑体","color":"red"}},{"row":2,"col":1,"isFormula":true,"sourceValue":"=130/112","value":1.1607142857142858}],[{"row":3,"col":0,"isFormula":true,"sourceValue":"=A1+A3","value":4},{"row":3,"col":1,"isFormula":false,"sourceValue":null,"value":null}],[{"row":4,"col":0,"isFormula":true,"sourceValue":"=262","value":262,"styles":{"fontFamily":"黑体","color":"red"}},{"row":4,"col":1,"isFormula":true,"sourceValue":"=112","value":112}],[{"row":5,"col":0,"isFormula":true,"sourceValue":"=371","value":371},{"row":5,"col":1,"isFormula":false,"sourceValue":null,"value":null}],[{"row":6,"col":0,"isFormula":true,"sourceValue":"=A5+A6","value":633},{"row":6,"col":1,"isFormula":false,"sourceValue":null,"value":null}]]},{"name":"工作表2","selection":{"row":0,"col":0,"endRow":5,"endCol":3},"data":[["顶起"]],"rowHeights":[24,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"colWidths":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"mergeCells":[{"row":0,"col":0,"rowspan":6,"colspan":4}],"cellMetas":[[{"row":0,"col":0,"isFormula":false,"sourceValue":"顶起","value":"顶起","styles":{"alignments":["Center","Middle"],"fontFamily":"黑体","fontStyle":"italic","fontWeight":"bold","textDecoration":"underline","color":"red"}}]]}]},"id":"brick-ssd-1-523c94d39fc229f5"}`
);

var wb = foo.getWorkbookInstance();
var sheet = wb.getActiveSheet();
var hot = sheet.handsontable;


function save() {
    console.log(foo.getExchangeData())
}

var isBold = false;
function bold() {
    sheet = wb.getActiveSheet();
    isBold = !isBold;
    sheet.setFontBold(isBold)
    sheet.setBackgroundColor('')
}

var isItalic = false;
function italic() {
    sheet = wb.getActiveSheet();
    var selection = sheet.getSelection();
    isItalic = !isItalic;
    sheet.setFontItalic(isItalic, selection)
}

var isUnderline = false;
function underline() {
    sheet = wb.getActiveSheet();
    var selection = sheet.getSelection();
    isUnderline = !isUnderline;
    sheet.setFontUnderline(isUnderline, selection)
}


