var container = document.getElementById('designer');

var ss = {
    "workbook": {
        "activeSheet": "工作表1",
        "sheets": [{
            "name": "工作表1",
            "selection": {"row": 0, "col": 1, "endRow": 0, "endCol": 1},
            "data": [[1, "2"], ["=A1+B1", null]],
            "rowHeights": [24, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            "colWidths": [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            "mergeCells": null,
            "cellMetas": [[{
                "row": 0,
                "col": 0,
                "isFormula": false,
                "sourceValue": 1,
                "value": 1,
                "styles": {"alignments": ["Right"]},
                "dataType": {"typeName": "numeric", "format": "0.000"}
            }, {
                "row": 0,
                "col": 1,
                "isFormula": false,
                "sourceValue": "2",
                "value": "2",
                "dataType": {"typeName": "text"}
            }], [{
                "row": 1,
                "col": 0,
                "isFormula": true,
                "sourceValue": "=A1+B1",
                "value": 3,
                "styles": {"alignments": ["Right"]},
                "dataType": {"typeName": "numeric", "format": "0.000"}
            }, {
                "row": 1,
                "col": 1,
                "isFormula": false,
                "sourceValue": null,
                "value": null,
                "dataType": {"typeName": "text"}
            }]]
        }]
    }, "id": "brick-ssd-1-7df5e27592d734e2"
}

var foo = new BrickSpreadSheet(
    container,
    ss
);

var wb = foo.getWorkbookInstance();
var sheet = wb.getActiveSheet();
var hot = sheet.handsontable;


function save() {
    sheet = wb.getActiveSheet();
    sheet.setDataFormat('date', {
        dateFormat: 'YYYY/DD/MM'
    });
    sheet.handsontable.render();
    //console.log(foo.getExchangeData())
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


