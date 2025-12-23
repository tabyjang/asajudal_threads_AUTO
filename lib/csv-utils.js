/**
 * CSV 파일 처리 유틸리티
 */

const fs = require('fs');

/**
 * CSV 라인 파싱 (따옴표 처리)
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * CSV 파일 파싱
 */
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const item = {};
            headers.forEach((header, index) => {
                item[header.trim()] = values[index].trim();
            });
            data.push(item);
        }
    }

    return data;
}

/**
 * CSV 파일 읽기 및 파싱
 */
function readCSV(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`CSV 파일을 찾을 수 없습니다: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return parseCSV(content);
}

module.exports = {
    parseCSV,
    parseCSVLine,
    readCSV
};
