const path = require("path");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const chineseRegex = /[\u4e00-\u9fa5]/g;
const matchCnStringLiteral = /'[\u4e00-\u9fa5]+'/g;

const info = [];

function calculateCnNode(directory) {
  const files = fs.readdirSync(directory);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      calculateCnNode(filePath);
    } else if (stats.isFile()) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const lines = fileContent.split("\n");

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        if (!line.includes("//")) {
          let match;
          while ((match = chineseRegex.exec(line)) !== null) {
            info.push({
              char: match[0],
              line: j + 1,
              column: match.index + 1,
              file: filePath,
            });
          }
          while ((match = matchCnStringLiteral.exec(line)) !== null) {
            info.push({
              char: match[0],
              line: j + 1,
              column: match.index + 1,
              file: filePath,
            });
          }
        }
      }
    }
  }
}

const input = process.argv[2];
const output = process.argv[3];

calculateCnNode(input);

const csvWriter = createCsvWriter({
  path: output,
  header: [
    { id: "char", title: "Character" },
    { id: "line", title: "Line" },
    { id: "column", title: "Column" },
    { id: "file", title: "File" },
  ],
});

csvWriter.writeRecords(info).then(() => {
  console.log("CSV file written successfully");
});
