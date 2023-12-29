
// //exceljs
const ExcelJS = require('exceljs');
// const workbook = new ExcelJS.Workbook();
// workbook.creator = 'Me';
// workbook.lastModifiedBy = 'Her';
// workbook.created = new Date(1985, 8, 30);
// workbook.modified = new Date();
// workbook.lastPrinted = new Date(2016, 9, 27);
// // Set workbook dates to 1904 date system
// workbook.properties.date1904 = true;
// // Force workbook calculation on load
// workbook.calcProperties.fullCalcOnLoad = true;
// workbook.views = [
//     {
//       x: 0, y: 0, width: 10000, height: 20000,
//       firstSheet: 0, activeTab: 1, visibility: 'visible'
//     }
//   ]
//   const sheet = workbook.addWorksheet('My Sheet', {
//     headerFooter:{firstHeader: "Hello Exceljs", firstFooter: "Hello World"}
//   });

//   sheet.columns = [
//     { header: 'Id', key: 'id', width: 10 },
//     { header: 'Name', key: 'name', width: 32 },
//     { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
//   ];
//   sheet.pageSetup.printArea = 'A1:G20';
//   console.log(sheet)
//   // write to a file
// const workbook = createAndFillWorkbook();
// await workbook.xlsx.writeFile("filename");

// // write to a stream
// await workbook.xlsx.write(stream);

// // write to a new buffer
// const buffer = await workbook.xlsx.writeBuffer();


// const workbook = createAndFillWorkbook();
// await workbook.csv.writeFile("filename");

// write to a stream
// Be careful that you need to provide sheetName or
// sheetId for correct import to csv.
// await workbook.csv.write(stream, { sheetName: 'Page name' });

// worksheet.addRow({
//     id: i,
//     name: theName,
//     etc: someOtherDetail
//  }).commit();


// console.log("hello")
// async function makefile(){

//     try{
//         const workbook = new ExcelJS.Workbook();
//         const sheet = workbook.addWorksheet('My Sheet');
//         sheet.columns = [
//             { header: 'Id', key: 'id', width: 10 },
//             { header: 'Name', key: 'name', width: 32 },
//             { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
//         ];
//         row = sheet.getRow(1);
//         row.values = {
//             id: 13,
//             name: 'Thing 1',
//             "D.O.B.": Date.now()
//           };
//           const buf = await workbook.xlsx.writeBuffer();
//           console.log(buf)
//           await workbook.xlsx.write(buf);
//         // saveA(new Blob([buf]),"first.xlsx")
//     }catch(err){
//         console.log(err)
//     }
// }
// makefile()