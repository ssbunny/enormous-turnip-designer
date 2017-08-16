var container = document.getElementById('designer');

var ss = {
    "workbook": {
        "activeSheet": "工作表1",
        "sheets": [{
            "name": "工作表1",
            "selection": {"row": 1, "col": 0, "endRow": 1, "endCol": 49},
            "data": [["2", "3", null, "3"], ["1", "3", "", "3"], ["=SUM(A1:B2)", null, null, "3"]],
            "rowHeights": [83, null, null, 67, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            "colWidths": [146, 50, 50, 50, 131, 87, 97, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            "mergeCells": null,
            "cellMetas": [[{
                "row": 0,
                "col": 0,
                "isFormula": false,
                "sourceValue": "2",
                "value": "2",
                "dataType": {"typeName": "text"}
            }, {
                "row": 0,
                "col": 1,
                "isFormula": false,
                "sourceValue": "3",
                "value": "3",
                "styles": {"alignments": ["Bottom"], "fontSize": "40px"},
                "dataType": {"typeName": "text"}
            }, {
                "row": 0,
                "col": 2,
                "isFormula": false,
                "sourceValue": null,
                "value": null,
                "dataType": {"typeName": "text"}
            }, {
                "row": 0,
                "col": 3,
                "isFormula": false,
                "sourceValue": "3",
                "value": "3",
                "dataType": {"typeName": "text"}
            }], [{
                "row": 1,
                "col": 0,
                "isFormula": false,
                "sourceValue": "1",
                "value": "1",
                "dataType": {"typeName": "text"}
            }, {
                "row": 1,
                "col": 1,
                "isFormula": false,
                "sourceValue": "3",
                "value": "3",
                "dataType": {"typeName": "text"}
            }, {
                "row": 1,
                "col": 2,
                "isFormula": false,
                "sourceValue": "",
                "value": "",
                "dataType": {"typeName": "text"}
            }, {
                "row": 1,
                "col": 3,
                "isFormula": false,
                "sourceValue": "3",
                "value": "3",
                "dataType": {"typeName": "text"}
            }], [{
                "row": 2,
                "col": 0,
                "isFormula": true,
                "sourceValue": "=SUM(A1:B2)",
                "value": 9,
                "dataType": {"typeName": "text"}
            }, {
                "row": 2,
                "col": 1,
                "isFormula": false,
                "sourceValue": null,
                "value": null,
                "dataType": {"typeName": "text"}
            }, {
                "row": 2,
                "col": 2,
                "isFormula": false,
                "sourceValue": null,
                "value": null,
                "dataType": {"typeName": "text"}
            }, {
                "row": 2,
                "col": 3,
                "isFormula": false,
                "sourceValue": "3",
                "value": "3",
                "dataType": {"typeName": "text"}
            }]]
        }]
    }, "id": "brick-ssd-1-b02335e7ef7db982"
}

var foo = new BrickSpreadSheet(container, ss);

var wb = foo.getWorkbookInstance();
var sheet = wb.getActiveSheet();
var hot = sheet.handsontable;


function save() {
    console.log(foo.getExchangeData())
}

function test() {
    sheet.setFontBold(true);
    sheet.setFontItalic(true);
    sheet.setFontUnderline(true);
}


