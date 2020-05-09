//////////////////////////////////////////////////////////////////////////////////////
// Лабораторная работа 2 по дисциплине ЛОИС
// Выполнена студентом группы 721702 БГУИР Баскаковым Максимом Александровичем
// 05.05.2020
//
// Использованные материалы:
// https://www.w3schools.com/js/ 
// http://learn.javascript.ru/
// https://stackoverflow.com/
var RESULT;
var symbols = [];
var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var testNumber = 0;
var score = 0;
var complex = 0;

function start() {
    var formula1 = document.getElementById('panel1').value;
	var formula2 = document.getElementById('panel2').value;
    if (checkSyntax(formula1) && checkSyntax(formula2)) {
		symbols = getSymbolSet(formula1, formula2);
		symbols.sort();
		var object1 = createTruthTable(formula1);
		var object2 = createTruthTable(formula2);
		checkSimpleFormula(formula1, object1);
        checkSimpleFormula(formula2, object2);
        document.getElementById("firstTableLabel").innerHTML ="Таблица истинности для формулы 1";
		document.getElementById("secondTableLabel").innerHTML ="Таблица истинности для формулы 2";
		document.getElementById('firstTruthTable').innerHTML = drawTableAlt(object1.truthTable, formula1);
        document.getElementById('secondTruthTable').innerHTML = drawTableAlt(object2.truthTable, formula2);
        //document.getElementById('firstTruthTable').innerHTML = drawTable(object1.truthTable);
        //document.getElementById('secondTruthTable').innerHTML = drawTable(object2.truthTable);
		if(compareFormulas(object1, object2)){
        document.getElementById("result").innerHTML = "Формула 2 следует из формулы 1";
		} else {
			document.getElementById("result").innerHTML = "Формула 2 не следует из формулы 1";
		}
    } else {
		document.getElementById("firstTableLabel").innerHTML = "";
		document.getElementById("secondTableLabel").innerHTML = "";
        document.getElementById('firstTruthTable').innerHTML = "";
        document.getElementById('secondTruthTable').innerHTML = "";
        document.getElementById("result").innerHTML = "Ошибка ввода";
    }
}


function checkSyntax(formula) {
    var regFormula = /([(][!]([A-Z]|[0-1])[)])|([(]([A-Z]|[0-1])((&)|(\|)|(->)|(~))([A-Z]|[0-1])[)])/;
    var old = formula;
    formula = formula.replace(regFormula, "A");
    while (formula !== old) {
        old = formula;
        formula = formula.replace(regFormula, "A");
    }
    var arrOutput = formula.match(/([A-Z]|[0-1])/g);
    return (formula.length === 1) && (arrOutput != null) && (arrOutput.length === 1);
}

function getSymbolSet(formula1, formula2) {
    var symbol = /([A-Z])/g;
    var results1 = formula1.match(symbol) || [];
	var results2 = formula2.match(symbol) || [];
	var results = results1.concat(results2);
    return results.filter(function (symbol, index) {
        return results.indexOf(symbol) === index;
    });
}

function createTruthTable(formula){
    var tableSize = Math.pow(2, symbols.length);
    var truthTable = {};
    for (var i = 0; i < tableSize; i++) {
        var currentRow = convertToBinary(i, symbols.length);
        var tempRow = getStartValues(symbols, currentRow);
        var results = getAnswer(formula, tempRow);
        for (var key of Object.keys(results)) {
            tempRow[key] = results[key];
        }
        truthTable[i] = tempRow;
    }
    return {
        truthTable: truthTable,
		result: RESULT
    }
}

function convertToBinary(number, stringLength) {
    var binNumber = number.toString(2);
    for (var i = binNumber.length; i < stringLength; i++) {
        binNumber = "0" + binNumber;
    }
    return binNumber;
}

function getStartValues(elements, currentNumber) {
    var object = {};
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        object[element] = currentNumber[i];
    }
    return object;
}

function getAnswer(formula, tempObject) {
    var constFormula = formula;
    for (var key of Object.keys(tempObject)) {
        var val = tempObject[key];
        constFormula = constFormula.replace(new RegExp(key, 'g'), val);
    }
    return calculateRowTable(constFormula, formula);
}

function calculateRowTable(formula, symbolFormula) {
    var regFormula = /([(][!][0-1][)])|([(][0-1]((&)|(->)|(~)|(\|))[0-1][)])/;
    var regSymbolFormula = /([(][!]([A-Zzf]|[\d])[)])|([(]([A-Zzf]|[\d])((&)|(->)|(~)|(\|))([A-Zzf]|[\d])[)])/;
    var regCounter = /[!]|[~]|[&]|[|]|[>]/g;
	var counter;
	if(symbolFormula.match(regCounter)) counter = symbolFormula.match(regCounter).length;
	else counter = 0;
    var results = [];
    var operations = [];
    var i = 0;
	while(symbolFormula.includes("0") || symbolFormula.includes("1")){
		symbolFormula = symbolFormula.replace("0", "z");
		symbolFormula = symbolFormula.replace("1", "f");
	}
	RESULT = symbolFormula;
    while (regFormula.exec(formula) != null && regSymbolFormula.exec(symbolFormula) != null) {
        var subFormula = regFormula.exec(formula)[0];
        var symbolIndex = regSymbolFormula.exec(symbolFormula)[0];
        var result = chooseOperation(subFormula);
        var resultIndex = deleteDigits(symbolIndex, operations);
		while(resultIndex.includes("z") || resultIndex.includes("f")){
			resultIndex = resultIndex.replace("z", "0");
			resultIndex = resultIndex.replace("f", "1");
		}
        results[resultIndex] = result;
        formula = formula.replace(subFormula, result);
        counter--;
        if (counter === 0) {
            RESULT = resultIndex;
            results[resultIndex] = result;
        }
        operations[i] = resultIndex;
        symbolFormula = symbolFormula.replace(symbolIndex, i);
        i++;
    }
    return results;
}

function chooseOperation(inputFormula) {
    if (inputFormula.indexOf("!") > -1) {
        var value = parseInt(inputFormula[2]);
        return (!value) ? 1 : 0;
    } else if (inputFormula.indexOf("&") > -1) {
        var firstValue = parseInt(inputFormula[1]);
        var secondValue = parseInt(inputFormula[3]);
        return (firstValue && secondValue) ? 1 : 0;
    } else if (inputFormula.indexOf("~") > -1) {
        var firstValue = parseInt(inputFormula[1]);
        var secondValue = parseInt(inputFormula[3]);
        return (firstValue === secondValue) ? 1 : 0;
    } else if (inputFormula.indexOf("->") > -1) {
        var firstValue = parseInt(inputFormula[1]);
        var secondValue = parseInt(inputFormula[4]);
        return ((!firstValue) || secondValue) ? 1 : 0;
    } else if (inputFormula.indexOf("|") > -1) {
        var firstValue = parseInt(inputFormula[1]);
        var secondValue = parseInt(inputFormula[3]);
        return (firstValue || secondValue) ? 1 : 0;
    } else {
        return -1;
    }
}

function deleteDigits(formula, operations) {
    var expLeft = formula.match(/([(][!][\d]+[)])|(([(][\d]+)((&)|(->)|(~)|(\|))[A-Zzf][)])/g);
    var expRight = formula.match(/([(][!][\d]+[)])|(([(][A-Zzf])((&)|(->)|(~)|(\|))[\d]+[)])/g);
    var exp = formula.match(/([(][!][\d]+[)])|(([(][\d]+)((&)|(->)|(~)|(\|))[\d]+[)])/g);
    if (exp !== null || expLeft !== null || expRight !== null) {
        var first;
        var operation = "";
        var second;
        var wrong;
        if (expRight !== null) {
            wrong = expRight[0];
        } else if (expLeft !== null) {
            wrong = expLeft[0];
        } else if (exp !== null) {
            wrong = exp[0];
        }
        if (wrong.indexOf("!") === -1) {
            if (wrong.indexOf("->") > -1) {
                operation = "->";
                if (expRight !== null) {
                    first = wrong[1];
                    second = parseInt(wrong[4]);
                    return "(" + first + operation + operations[second] + ")";
                } else if (expLeft !== null) {
                    first = parseInt(wrong[1]);
                    second = wrong[4];
                    return "(" + operations[first] + operation + second + ")";
                } else if (exp !== null) {
                    first = parseInt(wrong[1]);
                    second = parseInt(wrong[4]);
                    return "(" + operations[first] + operation + operations[second] + ")";
                }
            } else {
                operation = wrong[2];
                if (expRight !== null) {
                    first = wrong[1];
                    second = parseInt(wrong[3]);
                    return "(" + first + operation + operations[second] + ")";
                } else if (expLeft !== null) {
                    first = parseInt(wrong[1]);
                    second = wrong[3];
                    return "(" + operations[first] + operation + second + ")";
                } else if (exp !== null) {
                    first = parseInt(wrong[1]);
                    second = parseInt(wrong[3]);
                    return "(" + operations[first] + operation + operations[second] + ")";
                }
            }
        } else {
            first = parseInt(wrong[2]);
            operation = "!";
            return "(" + operation + operations[first] + ")";
        }
    } else {
        return formula;
    }
}

function checkSimpleFormula(formula, object){
	if (formula === "0" || formula === "1") {
		for (var i = 0; i < Object.keys(object.truthTable).length; i++) {
			var result = object.truthTable[i];
			result[(formula + " ")] = parseInt(formula);
			object.truthTable[i] = result;
		}
		object.result = formula + " ";
	}
	else return;
}
/*
function drawTable(truthTable) {
    var tableSize = Math.pow(2, symbols.length);
    var innerHTML = "";
    var tr = "<tr>";
    for (var key of Object.keys(truthTable[0])) {
        tr += "<th>" + key + "</th>"
    }
    tr += "</tr>";
    innerHTML += tr;
    for (var i = 0; i < tableSize; i++) {
        var object = truthTable[i];
        tr = "<tr>";
        for (var key of Object.keys(object)) {
            var val = object[key];
            tr += "<td>" + val + "</td>"
        }
        tr += "</tr>";
        innerHTML += tr;
    }
    return innerHTML;
}
*/
function drawTableAlt(truthTable, formula) {
    var symbol = /([A-Z])/g;
    var length = (formula.match(symbol) || []);
    length = length.filter(function (symbol, index) {
        return length.indexOf(symbol) === index;
    });
    var tableSize = Math.pow(2, length.length);
    var innerHTML = "";
    var tr = "<tr>";
    for (var key of Object.keys(truthTable[0])) {
        if (formula.includes(key)){
            tr += "<th>" + key + "</th>";
        }
    }
    tr += "</tr>";
    innerHTML += tr;
    var unique = [];
    var i = 0;
    var j = 0;
    while ( i < tableSize) {
        var object = truthTable[j];
        var uniqueCombo = "";
        for (var key of Object.keys(object)) {
            if (formula.includes(key)){
                uniqueCombo += object[key].toString();
            }
        }
        if (!(unique.includes(uniqueCombo))){
            unique.push(uniqueCombo);
            tr = "<tr>";
            for (var key of Object.keys(object)) {
                if (formula.includes(key)){
                    var val = object[key];
                    tr += "<td>" + val + "</td>"
                }
            }
            tr += "</tr>";
            innerHTML += tr;
            i++;                 
        }
        j++
    }
    return innerHTML;
}

function compareFormulas(object1, object2){
	for (var i = 0; i < Object.keys(object1.truthTable).length; i++) {
		var result1 = object1.truthTable[i];
		var result2 = object2.truthTable[i];
		if (parseInt(result1[object1.result]) === 1 && parseInt(result2[object2.result]) !== 1) {
			return false;
		}
    }
	return true;
}

function newFormula() {
    if (complex > 5) return characters.charAt(Math.floor(Math.random() * characters.length));
    var type = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    var Formula = "";
    switch (type) {
        case 1:
            var answer = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
            if (answer == 1) Formula = "1";
            else Formula = "0";
            break

        case 2:
            Formula = characters.charAt(Math.floor(Math.random() * characters.length));
            break

        case 3:
            complex++;
            Formula = newFormula();
            Formula = "(" + "!" + Formula + ")";
            break

        case 4:
            var relation = "";
            var type = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
            switch (type) {
                case 1:
                    relation = "&"
                    break

                case 2:
                    relation = "|"
                    break

                case 3:
                    relation = "->"
                    break

                case 4:
                    relation = "~"
                    break
            }
            complex++;
            var leftFormula = newFormula();
            complex++;
            var rightFormula = newFormula();
            Formula = "(" + leftFormula + relation + rightFormula + ")";
            break
    }
    return Formula;
}

function test(){
    if (testNumber<5){
        start();
        var choice;
        var inp = document.getElementsByName('radio');
        for (var j = 0; j < inp.length; j++) {
            if (inp[j].type == "radio" && inp[j].checked) {
                choice =  inp[j].value;
            }
        }
        if ((document.getElementById("result").innerHTML === "Формула 2 следует из формулы 1" && choice === "true") || (document.getElementById("result").innerHTML === "Формула 2 не следует из формулы 1" && choice ==="false")){
            score++;
        }
        testNumber++;
        if (testNumber===5){
            document.getElementById("panel1").value = "";
            document.getElementById("panel2").value = "";
            document.getElementById("score").innerHTML ="Правильных ответов - "+score+" из 5";
        }
        else{
            document.getElementById("panel1").value = newFormula();
            complex = 0;
            document.getElementById("panel2").value = newFormula();
            complex = 0;
        }
    }
}