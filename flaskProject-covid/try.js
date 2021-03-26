// var data = "2020年10月1日至2021年12月21日";
//
// var a = data.replace(/\d*年/g,"")
// console.log(a,data)
import "static/js/Convert_Pinyin.js"

var fullName = pinyin.getFullChars("辽宁省");
console.log(fullName)