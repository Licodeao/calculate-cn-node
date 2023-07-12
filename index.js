const path = require("path");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const Segment = require("segment");

const chineseRegex = /[\u4e00-\u9fa5]/g;
const matchCnStringLiteral = /'[\u4e00-\u9fa5]+'/g;
const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
const consoleRegex = /console\..*/g;

const segment = new Segment();
segment.useDefault();

/**
 *
 * @param {String} directory 需要遍历的文件夹
 * @param {Object} csvWriter 创建的csvWriter对象
 * @param {String} avoidFiles 需要避免遍历的文件
 * @returns
 */
async function calculateCnNode(directory, csvWriter, avoidFiles) {
  const baseName = path.basename(directory);
  if (avoidFiles.includes(baseName)) return;

  const files = await fs.promises.readdir(directory);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(directory, file);
    const stats = await fs.promises.stat(filePath);

    if (stats.isDirectory()) {
      await calculateCnNode(filePath, csvWriter, avoidFiles);
    } else if (stats.isFile()) {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      const lines = fileContent.split(/\r?\n/);

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        if (!commentRegex.test(line) && !consoleRegex.test(line)) {
          const chineseMatches = line.match(chineseRegex);
          if (chineseMatches) {
            const chineseString = chineseMatches.join("");
            const words = segment.doSegment(chineseString, {
              simple: true,
              stripPunctuation: true,
            });
            const wordIndex = line.indexOf(words);
            await csvWriter.writeRecords([
              {
                char: words,
                line: j + 1,
                column: wordIndex + 1,
                file: filePath,
              },
            ]);
          }
          const stringLiteralMatches = line.match(matchCnStringLiteral);
          if (stringLiteralMatches) {
            for (const match of stringLiteralMatches) {
              const chineseString = match.slice(1, -1);
              const words = segment.doSegment(chineseString, {
                simple: true,
                stripPunctuation: true,
              });
              const wordIndex = line.indexOf(words);
              await csvWriter.writeRecords([
                {
                  char: words,
                  line: j + 1,
                  column: wordIndex + 1,
                  file: filePath,
                },
              ]);
            }
          }
        }
      }
    }
    console.log("当前已完成一个分词操作~");
  }
}

const input = process.argv[2];
const output = process.argv[3];
const avoidArray = process.argv.slice(4);

const csvWriter = createCsvWriter({
  path: output,
  header: [
    { id: "char", title: "Character" },
    { id: "line", title: "Line" },
    { id: "column", title: "Column" },
    { id: "file", title: "File" },
  ],
});

csvWriter.writeRecords([]).then(() => {
  calculateCnNode(input, csvWriter, avoidArray).then(() => {
    console.log("CSV file written successfully");
  });
});
