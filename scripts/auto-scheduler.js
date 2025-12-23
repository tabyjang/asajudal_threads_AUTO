/**
 * CSV 파일 기반 Threads 자동 스케줄러
 * 지정된 시간에 자동으로 게시물을 올립니다
 */

require('dotenv').config({ override: true });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 환경 변수
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v18.0';
const BASE_URL = `https://graph.threads.net/${GRAPH_API_VERSION}`;

// CSV 파일 경로
const CSV_FILE = path.join(__dirname, 'content_schedule.csv');
const POSTED_LOG = path.join(__dirname, 'posted_log.json');

// 이미 게시된 항목을 추적하기 위한 로그
let postedItems = [];

// 로그 파일 로드
function loadPostedLog() {
    try {
        if (fs.existsSync(POSTED_LOG)) {
            const data = fs.readFileSync(POSTED_LOG, 'utf8');
            postedItems = JSON.parse(data);
            console.log(`📝 ${postedItems.length}개의 게시 기록을 로드했습니다.`);
        }
    } catch (error) {
        console.error('로그 파일 로드 실패:', error.message);
        postedItems = [];
    }
}

// 로그 파일 저장
function savePostedLog() {
    try {
        fs.writeFileSync(POSTED_LOG, JSON.stringify(postedItems, null, 2));
    } catch (error) {
        console.error('로그 파일 저장 실패:', error.message);
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

// CSV 라인 파싱 (따옴표 처리)
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

// 이미지 있는 게시물 생성
async function createImagePost(imageUrl, text) {
    console.log('🖼️  이미지 컨테이너 생성 중...');

    try {
        const response = await axios.post(
            `${BASE_URL}/${THREADS_USER_ID}/threads`,
            {
                media_type: 'IMAGE',
                image_url: imageUrl,
                text: text,
                access_token: ACCESS_TOKEN
            }
        );

        return response.data.id;
    } catch (error) {
        console.error('이미지 컨테이너 생성 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 텍스트만 있는 게시물 생성
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
        console.error('텍스트 컨테이너 생성 실패:', error.response?.data || error.message);
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
        console.error('게시물 발행 실패:', error.response?.data || error.message);
        throw error;
    }
}

// 게시물 업로드
async function uploadPost(item) {
    console.log('\n' + '='.repeat(60));
    console.log(`📢 게시 시작: ${item.content_type}`);
    console.log(`⏰ 예정 시간: ${item.date} ${item.time}`);
    console.log('='.repeat(60));

    try {
        // 텍스트 준비 (해시태그 추가)
        let fullText = item.text;
        if (item.hashtags) {
            fullText += `\n\n${item.hashtags}`;
        }

        // 컨테이너 생성
        let containerId;
        if (item.image_url && item.image_url !== '') {
            containerId = await createImagePost(item.image_url, fullText);
        } else {
            containerId = await createTextPost(fullText);
        }

        console.log(`✅ 컨테이너 생성 완료: ${containerId}`);

        // 대기
        console.log('⏳ 5초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 발행
        const postId = await publishPost(containerId);
        console.log(`✅ 게시 완료! Post ID: ${postId}`);

        // 로그 저장
        postedItems.push({
            ...item,
            posted_at: new Date().toISOString(),
            post_id: postId
        });
        savePostedLog();

        return postId;

    } catch (error) {
        console.error('❌ 게시 실패:', error.message);
        throw error;
    }
}

// 이미 게시되었는지 확인
function isAlreadyPosted(item) {
    return postedItems.some(posted =>
        posted.date === item.date &&
        posted.time === item.time &&
        posted.text === item.text
    );
}

// 게시할 시간인지 확인
function shouldPostNow(item) {
    const now = new Date();
    const itemDate = new Date(item.date + ' ' + item.time);

    // 현재 시간과 5분 이내 차이면 게시
    const diffMinutes = Math.abs(now - itemDate) / 1000 / 60;

    return diffMinutes <= 5;
}

// 메인 스케줄러 루프
async function schedulerLoop() {
    console.log('\n🔍 스케줄 확인 중...');
    console.log(`현재 시각: ${new Date().toLocaleString('ko-KR')}`);

    try {
        // CSV 파일 읽기
        if (!fs.existsSync(CSV_FILE)) {
            console.log('⚠️  CSV 파일이 없습니다:', CSV_FILE);
            return;
        }

        const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
        const schedule = parseCSV(csvContent);

        console.log(`📋 총 ${schedule.length}개의 스케줄 항목`);

        // 각 항목 확인
        for (const item of schedule) {
            // 이미 게시되었으면 건너뛰기
            if (isAlreadyPosted(item)) {
                continue;
            }

            // 게시할 시간이면 업로드
            if (shouldPostNow(item)) {
                console.log(`\n⏰ 게시 시간 도래!`);
                await uploadPost(item);

                // 다음 게시물까지 10초 대기
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        console.log('✅ 스케줄 확인 완료\n');

    } catch (error) {
        console.error('❌ 스케줄러 오류:', error.message);
    }
}

// 시작
async function main() {
    console.log('🚀 Threads 자동 스케줄러 시작!\n');
    console.log('='.repeat(60));
    console.log('📅 CSV 파일:', CSV_FILE);
    console.log('⏰ 확인 간격: 5분마다');
    console.log('🛑 종료: Ctrl+C');
    console.log('='.repeat(60));

    // 로그 로드
    loadPostedLog();

    // 즉시 한 번 실행
    await schedulerLoop();

    // 5분마다 실행
    setInterval(schedulerLoop, 5 * 60 * 1000);

    console.log('\n✅ 스케줄러가 실행 중입니다...\n');
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { uploadPost, parseCSV };
