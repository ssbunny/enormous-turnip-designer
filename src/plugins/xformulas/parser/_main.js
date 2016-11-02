var fs = require("fs");
var jison = require("jison");

var bnf = fs.readFileSync("grammar.jison", "utf8");
var parser = new jison.Parser(bnf);

//var parser = require("./grammar.js").parser;

parser.yy = {
    toNumber(){
        console.log('toNumber------------>', arguments)
    },
    trimEdges(){
        console.log('trimEdges----------->', arguments)
    },
    invertNumber(){
        console.log('invertNumber-------->', arguments)
    },
    cellValue(){
        console.log('cellValue----------->', arguments)
        return arguments;
    },
    rangeValue(){
        console.log('rangeValue---------->', arguments)
    },
    throwError(){
        console.log('throwError---------->', arguments)
    },
    callVariable(){
        console.log('callVariable-------->', arguments)
    },
    evaluateByOperator(){
        console.log('evaluateByOperator-->', arguments)
    },
    callFunction(){
        console.log('callFunction-------->', arguments)
    },
    cellValueInSheet(sheetName, label){
        console.log('cellValueInSheet---->', {sheetName, label})
        return sheetName + label;
    },
    rangeValueInSheet(v){
        console.log('rangeValueInSheet---->', arguments)
        return v;
    },
    parseError() {
        console.log('parseError---->', arguments)
    }
};

// [^\\/\?\*\[\]]+

try {
    parser.parse("SUM('SUM(A1)'!A1 + '工作表2'!A2:A5, A3, AVG('test3'!B3:B$2))");
/*    parser.parse("SUM(test1!A1)");
    parser.parse("SUM(SUM!A1)");*/
/*    console.log('');
    parser.parse("A1+B2");
    console.log('');
    parser.parse("SUM(A1, B2)");
    console.log('');
    parser.parse("AVG(test2!A1:B5, C4)");*/
} catch (error) {
    console.log(error)
}
