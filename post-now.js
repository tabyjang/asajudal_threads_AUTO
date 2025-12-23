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

// 메인
async function main() {
    console.log('🚀 지금 바로 게시!\n');
    console.log('='.repeat(60));

    // 12월 24일 오늘의 운세
    const text = `🎄 [12월 24일 화요일] 크리스마스 이브 특집 운세

🐭 쥐띠: 특별한 선물이나 좋은 소식이 올 수 있어요! 기대하세요 ✨
💼 업무운 ★★★★☆ 💰 재물운 ★★★★☆ ❤️ 연애운 ★★★★★

🐮 소띠: 차분하게 주변을 돌아보기 좋은 날. 감사의 마음을 전해보세요
💼 업무운 ★★★☆☆ 💰 재물운 ★★★☆☆ ❤️ 연애운 ★★★★☆

🐯 호랑이띠: 리더십을 발휘할 기회! 파티나 모임에서 주목받아요
💼 업무운 ★★★★☆ 💰 재물운 ★★★☆☆ ❤️ 연애운 ★★★★★

🐰 토끼띠: 로맨틱한 고백이나 프러포즈 성공률 UP!
💼 업무운 ★★★☆☆ 💰 재물운 ★★★★☆ ❤️ 연애운 ★★★★★

👉 전체 12띠 상세 운세는 프로필 링크에서!

#크리스마스이브 #오늘의운세 #띠별운세 #사주`;

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
