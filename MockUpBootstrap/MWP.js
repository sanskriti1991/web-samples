var data = '{"data": [{ "NAME" : "Pay period: 7/29 - 7/29","VALUE":[{ "NAME": "NET PAY", "VALUE" : { "VALUE1":"$2,982.53" , "VALUE2":"" }}, {"NAME" :"TYPE", "VALUE" : { "VALUE1":"THIS PAYSTUB" , "VALUE2":"YTD" }}, {"NAME": "EARNINGS", "VALUE" : { "VALUE1":"$3,750.00" , "VALUE2":"$14,325.00" }},{ "NAME": "TAXES", "VALUE" : { "VALUE1":"$767.47" , "VALUE2":"$3,540.26" }},{ "NAME" : "DEDUCTIONS" ,"VALUE": { "VALUE1":"$0.00" , "VALUE2":"$0.00" }}]},{"NAME":"Earnings Breakdown", "VALUE" :""},{"NAME" : "Taxes Breakdown","VALUE":[{"NAME":"TOTAL", "VALUE" : { "VALUE1":"$767.47" , "VALUE2":"$3,540.26" }},{ "NAME":"TYPE","VALUE" : { "VALUE1":"THIS PAYSTUB" , "VALUE2":"YTD" }},{ "NAME":"FEDERAL", "VALUE": { "VALUE1":"$187.50" , "VALUE2":"$1,460.10" }},{ "NAME":"FICA","VALUE" : { "VALUE1":"$232.50" , "VALUE2":"$888.15" }},{"NAME": "MEDICARE","VALUE" : { "VALUE1":"$54.38" , "VALUE2":"$207.73" }},{"NAME": "CS-SDI","VALUE" : { "VALUE1":"$37.50" , "VALUE2":"$143.25" }},{"NAME": "STATE (CA)", "VALUE" : { "VALUE1":"$255.59" , "VALUE2":"841.03" }}]}, {"NAME":"Deduction Breakdown", "VALUE" :""}]}';

var jsonData = JSON.parse(data);
var htmlData = "";
for (i = 0; i < jsonData.data.length; i++) {
    htmlData += '<div class ="mainContainer"><div class="row" id="' + i + '"><div class="rowheader">' + jsonData.data[i].NAME + '<a onclick="changeColor(' + i + ')" data-toggle="collapse" href="#collapse' + i + '" aria-expanded="false" aria-controls="collapse' + i + '"><img src="images/plus.gif" alt="plus" class="collapseBtn" id="collapseBtn' + i + '"></a></div></div><div class="collapse subContainer" id="collapse' + i + '"><table>';

    for (j = 0; j < jsonData.data[i].VALUE.length; j++) {
        if (j == 0) {
            htmlData += '<tr class="row1"><td class="col1">' + jsonData.data[i].VALUE[j].NAME + '</td><td><strong>' + jsonData.data[i].VALUE[j].VALUE.VALUE1 + '</strong></td><td><strong>' + jsonData.data[i].VALUE[j].VALUE.VALUE2 + '</strong></td></tr>'
        }
        else if (j == 1) {
            htmlData += '<tr class="row2"><td class="col1">' + jsonData.data[i].VALUE[j].NAME + '</td><td>' + jsonData.data[i].VALUE[j].VALUE.VALUE1 + '</td><td>' + jsonData.data[i].VALUE[j].VALUE.VALUE2 + '</td></tr>'
        }
        else {
            htmlData += '<tr><td class="col1">' + jsonData.data[i].VALUE[j].NAME + '</td><td>' + jsonData.data[i].VALUE[j].VALUE.VALUE1 + '</td><td>' + jsonData.data[i].VALUE[j].VALUE.VALUE2 + '</td></tr>'
        }
    }
    htmlData += '</table></div></div>'
}
$("#content").append(htmlData);

function closeWin() {
    alert("Closing Window");
    //window.open('', '_self', '');
    window.close();
};
function changeColor(id) {
    $('#collapse' + id).on('show.bs.collapse', function () {
        $("#" + id).css("background-color", "rgb(110, 176, 224)");

        $("#" + id).css("color", "white"); $("#collapseBtn" + id).attr("src", "images/minus.gif");

    });
    $('#collapse' + id).on('hide.bs.collapse', function () {
        $("#" + id).css("background-color", "rgb(205, 223, 244)");

        $("#" + id).css("color", "rgb(105, 99, 105)"); $("#collapseBtn" + id).attr("src", "images/plus.gif");

    });
}