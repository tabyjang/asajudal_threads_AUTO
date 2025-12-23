/**
 * 즉시 게시 스크립트 - CSV 첫 번째 항목을 바로 올림
 */

require('dotenv').config({ override: true });
const axios = require('axios');
const fs = require('fs');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v18.0';
const BASE_URL = `https://graph.threads.net/${GRAPH_API_VERSION}`;

// 텍스트 컨테이너 생성
async function createTextPost(text) {
    console.log('📝 텍스트 컨테이너 생성 중...');

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads`,
            {
                media_type: 'TEXT',
                text: text,
                access_token: ACCESS_TOKEN
            }
        );

        return response.data.id;
    } catch (error) {
        console.error('❌ 컨테이너 생성 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 게시물 발행
async function publishPost(containerId) {
    console.log('📤 게시물 발행 중...');

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads_publish`,
            {
                creation_id: containerId,
                access_token: ACCESS_TOKEN
            }
        );

        return response.data.id;
    } catch (error) {
        console.error('❌ 게시물 발행 실패:', error.response?.data || error.message);
        throw error;
    }
}

// CSV 파일 파싱
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

// CSV 라인 파싱
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

// 메인
async function main() {
    console.log('🚀 지금 바로 게시!\n');
    console.log('='.repeat(60));

    // CSV 파일 읽기
    const csvPath = './content_schedule.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const schedule = parseCSV(csvContent);

    // 인자로 받은 인덱스 또는 첫 번째 항목 가져오기
    const index = process.argv[2] ? parseInt(process.argv[2]) : 0;
    const firstItem = schedule[index];

    // 텍스트 준비
    let text = firstItem.text;
    if (firstItem.hashtags) {
        text += `\n\n${firstItem.hashtags}`;
    }

    console.log('📄 게시할 내용:');
    console.log(text);
    console.log('\n' + '='.repeat(60));

    try {
        // 1. 컨테이너 생성
        const containerId = await createTextPost(text);
        console.log(`✅ 컨테이너 생성 완료: ${containerId}`);

        // 2. 5초 대기
        console.log('⏳ 5초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 3. 발행
        const postId = await publishPost(containerId);
        console.log(`✅ 게시 완료! Post ID: ${postId}`);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 크리스마스 이브 운세가 올라갔어요!');
        console.log('📱 Threads 앱에서 확인하세요!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        process.exit(1);
    }
}

main();
