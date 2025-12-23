#!/usr/bin/env node

/**
 * 스레드 자동화 통합 컨트롤 스크립트
 *
 * 사용법:
 *   node start.js                  - 자동 스케줄러 시작
 *   node start.js test             - 테스트 게시물 올리기
 *   node start.js now              - 즉시 게시 (첫 번째 스케줄)
 *   node start.js now 3            - 즉시 게시 (3번째 스케줄)
 *   node start.js batch            - 대량 업로드 시작
 *   node start.js status           - 현재 상태 확인
 *   node start.js config           - 설정 확인
 */

const config = require('./config/config');
const ThreadsAPI = require('./lib/threads-api');
const PostLogger = require('./lib/post-logger');
const { readCSV } = require('./lib/csv-utils');
const fs = require('fs');

// 컬러 출력 (윈도우 호환)
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
    console.log('');
    log('='.repeat(60), 'cyan');
    log(`  ${title}`, 'bright');
    log('='.repeat(60), 'cyan');
    console.log('');
}

// 메인 메뉴
function showMenu() {
    header('🚀 스레드 자동화 컨트롤러');

    console.log('사용 가능한 명령어:');
    console.log('');
    log('  node start.js                ', 'green') + '  - 자동 스케줄러 시작';
    log('  node start.js test           ', 'green') + '  - 테스트 게시물';
    log('  node start.js now            ', 'green') + '  - 첫 번째 스케줄 즉시 게시';
    log('  node start.js now 3          ', 'green') + '  - 3번째 스케줄 즉시 게시';
    log('  node start.js batch          ', 'green') + '  - 대량 업로드';
    log('  node start.js status         ', 'green') + '  - 상태 확인';
    log('  node start.js config         ', 'green') + '  - 설정 확인';
    console.log('');
    log('⚙️  설정 파일: config/config.js', 'yellow');
    log('📝 스케줄 파일: data/content_schedule.csv', 'yellow');
    console.log('');
}

// 테스트 게시
async function testPost() {
    header('🧪 테스트 게시');

    if (!config.validateConfig()) {
        process.exit(1);
    }

    const api = new ThreadsAPI(config.api.accessToken, config.api.userId, config.api.version);
    api.validate();

    const testMessage = `✅ 스레드 자동화 테스트\n\n` +
        `현재 시간: ${new Date().toLocaleString('ko-KR')}\n\n` +
        `모든 시스템이 정상 작동 중입니다! 🎉`;

    try {
        await api.post(testMessage);
        log('\n✅ 테스트 성공! 스레드 앱에서 확인하세요.', 'green');
    } catch (error) {
        log('\n❌ 테스트 실패: ' + error.message, 'red');
        process.exit(1);
    }
}

// 즉시 게시
async function postNow(index = 0) {
    header(`📤 즉시 게시 ${index > 0 ? `(항목 #${index})` : '(첫 번째 항목)'}`);

    if (!config.validateConfig()) {
        process.exit(1);
    }

    const api = new ThreadsAPI(config.api.accessToken, config.api.userId, config.api.version);
    const logger = new PostLogger(config.paths.postedLog);

    try {
        const schedule = readCSV(config.paths.scheduleCSV);
        console.log(`📋 스케줄 항목 ${schedule.length}개 로드됨`);

        if (index >= schedule.length) {
            log(`❌ 항목 #${index}는 존재하지 않습니다 (최대: ${schedule.length - 1})`, 'red');
            process.exit(1);
        }

        const item = schedule[index];

        console.log('');
        log(`📅 날짜/시간: ${item.date} ${item.time}`, 'cyan');
        log(`📝 콘텐츠 타입: ${item.content_type}`, 'cyan');
        log(`💬 텍스트: ${item.text.substring(0, 100)}...`, 'cyan');
        if (item.image_url) log(`🖼️  이미지: ${item.image_url}`, 'cyan');
        console.log('');

        // 해시태그 추가
        let fullText = item.text;
        if (item.hashtags) {
            fullText += `\n\n${item.hashtags}`;
        }

        // 게시
        const result = await api.post(fullText, item.image_url || null);

        // 기록
        logger.add(item, result.postId);

        log('\n✅ 게시 완료!', 'green');

    } catch (error) {
        log('\n❌ 게시 실패: ' + error.message, 'red');
        process.exit(1);
    }
}

// 상태 확인
async function checkStatus() {
    header('📊 현재 상태');

    const logger = new PostLogger(config.paths.postedLog);
    const stats = logger.getStats();

    console.log(`총 게시물: ${stats.total}개`);
    console.log(`오늘 게시: ${stats.today}개`);

    if (stats.lastPosted) {
        console.log('');
        log('마지막 게시:', 'yellow');
        console.log(`  시간: ${stats.lastPosted.posted_at}`);
        console.log(`  타입: ${stats.lastPosted.content_type}`);
        console.log(`  ID: ${stats.lastPosted.post_id}`);
    }

    console.log('');

    // 다음 스케줄 확인
    try {
        const schedule = readCSV(config.paths.scheduleCSV);
        const now = new Date();

        const upcoming = schedule
            .filter(item => !logger.isPosted(item))
            .map(item => {
                const itemDate = new Date(item.date + ' ' + item.time);
                return { ...item, datetime: itemDate };
            })
            .filter(item => item.datetime > now)
            .sort((a, b) => a.datetime - b.datetime)
            .slice(0, 5);

        if (upcoming.length > 0) {
            log('다음 예정 스케줄 (최대 5개):', 'yellow');
            upcoming.forEach((item, i) => {
                console.log(`  ${i + 1}. ${item.date} ${item.time} - ${item.content_type}`);
            });
        } else {
            log('예정된 스케줄이 없습니다.', 'yellow');
        }

    } catch (error) {
        log('스케줄 파일 읽기 실패: ' + error.message, 'red');
    }

    console.log('');
}

// 설정 확인
function showConfig() {
    header('⚙️  현재 설정');

    console.log('API 설정:');
    console.log(`  User ID: ${config.api.userId}`);
    console.log(`  Token: ${config.api.accessToken?.substring(0, 20)}...`);
    console.log(`  API Version: ${config.api.version}`);
    console.log('');

    console.log('스케줄러 설정:');
    console.log(`  확인 간격: ${config.scheduler.checkInterval}분`);
    console.log(`  시간 허용 범위: ±${config.scheduler.timeWindow}분`);
    console.log(`  대기 시간: ${config.scheduler.waitBetweenRequests}초`);
    console.log('');

    console.log('파일 경로:');
    console.log(`  스케줄 CSV: ${config.paths.scheduleCSV}`);
    console.log(`  게시 기록: ${config.paths.postedLog}`);
    console.log('');

    log('💡 설정 변경: config/config.js 파일을 수정하세요', 'yellow');
    console.log('');
}

// 자동 스케줄러
async function runScheduler() {
    header('🤖 자동 스케줄러 시작');

    if (!config.validateConfig()) {
        process.exit(1);
    }

    config.printConfig();

    const api = new ThreadsAPI(config.api.accessToken, config.api.userId, config.api.version);
    const logger = new PostLogger(config.paths.postedLog);

    let restartCount = 0;

    async function schedulerLoop() {
        console.log('\n🔍 스케줄 확인 중...');
        console.log(`현재 시각: ${new Date().toLocaleString('ko-KR')}`);

        try {
            const schedule = readCSV(config.paths.scheduleCSV);
            console.log(`📋 총 ${schedule.length}개 항목`);

            for (const item of schedule) {
                // 이미 게시되었으면 건너뛰기
                if (logger.isPosted(item)) {
                    continue;
                }

                // 게시 시간 확인
                const now = new Date();
                const itemDate = new Date(item.date + ' ' + item.time);
                const diffMinutes = Math.abs(now - itemDate) / 1000 / 60;

                if (diffMinutes <= config.scheduler.timeWindow) {
                    log(`\n⏰ 게시 시간 도래!`, 'green');

                    // 해시태그 추가
                    let fullText = item.text;
                    if (item.hashtags) {
                        fullText += `\n\n${item.hashtags}`;
                    }

                    // 게시
                    const result = await api.post(
                        fullText,
                        item.image_url || null,
                        config.scheduler.waitBetweenRequests
                    );

                    // 기록
                    logger.add(item, result.postId);

                    // 다음 게시까지 대기
                    await new Promise(resolve =>
                        setTimeout(resolve, config.scheduler.waitBetweenPosts * 1000)
                    );
                }
            }

            log('✅ 스케줄 확인 완료\n', 'green');
            restartCount = 0; // 성공하면 재시작 카운트 리셋

        } catch (error) {
            log('❌ 스케줄러 오류: ' + error.message, 'red');

            if (config.error.autoRestart && restartCount < config.error.maxRestarts) {
                restartCount++;
                log(`⚠️  ${config.error.restartDelay}초 후 재시작... (${restartCount}/${config.error.maxRestarts})`, 'yellow');
                await new Promise(resolve => setTimeout(resolve, config.error.restartDelay * 1000));
            } else {
                log('❌ 최대 재시작 횟수 초과. 스케줄러를 종료합니다.', 'red');
                process.exit(1);
            }
        }
    }

    // 즉시 한 번 실행
    await schedulerLoop();

    // 주기적 실행
    setInterval(schedulerLoop, config.scheduler.checkInterval * 60 * 1000);

    log('✅ 스케줄러가 실행 중입니다...', 'green');
    log('🛑 종료하려면 Ctrl+C를 누르세요\n', 'yellow');
}

// 대량 업로드
async function runBatch() {
    header('📦 대량 업로드');

    if (!config.validateConfig()) {
        process.exit(1);
    }

    const api = new ThreadsAPI(config.api.accessToken, config.api.userId, config.api.version);
    const logger = new PostLogger(config.paths.postedLog);

    try {
        const list = readCSV(config.paths.uploadListCSV);
        console.log(`📋 ${list.length}개 항목 로드됨`);

        const maxPosts = Math.min(config.batch.maxPosts, list.length);
        console.log(`📤 최대 ${maxPosts}개 게시 예정`);
        console.log(`⏱️  간격: ${config.batch.intervalMinutes}분\n`);

        for (let i = 0; i < maxPosts; i++) {
            const item = list[i];

            log(`\n[${i + 1}/${maxPosts}] 게시 중...`, 'cyan');

            let fullText = item.text;
            if (item.hashtags) {
                fullText += `\n\n${item.hashtags}`;
            }

            const result = await api.post(fullText, item.image_url || null);
            logger.add(item, result.postId);

            if (i < maxPosts - 1) {
                log(`⏳ ${config.batch.intervalMinutes}분 대기 중...\n`, 'yellow');
                await new Promise(resolve => setTimeout(resolve, config.batch.intervalMinutes * 60 * 1000));
            }
        }

        log('\n✅ 대량 업로드 완료!', 'green');

    } catch (error) {
        log('\n❌ 대량 업로드 실패: ' + error.message, 'red');
        process.exit(1);
    }
}

// 명령어 처리
async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case 'test':
            await testPost();
            break;

        case 'now':
            const index = arg ? parseInt(arg) : 0;
            await postNow(index);
            break;

        case 'status':
            await checkStatus();
            break;

        case 'config':
            showConfig();
            break;

        case 'batch':
            await runBatch();
            break;

        case undefined:
            // 명령어 없으면 스케줄러 시작
            await runScheduler();
            break;

        default:
            showMenu();
            break;
    }
}

// 실행
if (require.main === module) {
    main().catch(error => {
        log('\n❌ 오류: ' + error.message, 'red');
        process.exit(1);
    });
}

module.exports = { testPost, postNow, checkStatus, runScheduler, runBatch };
