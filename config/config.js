/**
 * 스레드 자동화 설정 파일
 *
 * 이 파일에서 모든 설정을 쉽게 변경할 수 있습니다!
 */

require('dotenv').config({ override: true });
const path = require('path');

const config = {
    // ============================================
    // API 설정 (필수)
    // ============================================
    api: {
        accessToken: process.env.ACCESS_TOKEN,
        userId: process.env.THREADS_USER_ID,
        version: process.env.GRAPH_API_VERSION || 'v18.0'
    },

    // ============================================
    // 파일 경로 설정
    // ============================================
    paths: {
        // 스케줄 CSV 파일
        scheduleCSV: path.join(__dirname, '..', 'data', 'content_schedule.csv'),

        // 테스트용 CSV 파일
        testCSV: path.join(__dirname, '..', 'data', 'test_schedule.csv'),

        // 대량 업로드 리스트
        uploadListCSV: path.join(__dirname, '..', 'data', 'upload_list.csv'),

        // 게시 기록 파일
        postedLog: path.join(__dirname, '..', 'data', 'posted_log.json'),

        // 데이터 폴더
        dataDir: path.join(__dirname, '..', 'data')
    },

    // ============================================
    // 스케줄러 설정
    // ============================================
    scheduler: {
        // 스케줄 확인 간격 (분)
        checkInterval: 5,

        // 게시 시간 허용 범위 (±분)
        // 예: 5분이면 07:00 게시물이 06:55~07:05에 게시됨
        timeWindow: 5,

        // API 요청 사이 대기 시간 (초)
        waitBetweenRequests: 5,

        // 연속 게시 사이 대기 시간 (초)
        waitBetweenPosts: 10
    },

    // ============================================
    // 대량 업로드 설정
    // ============================================
    batch: {
        // 게시물 사이 간격 (분)
        intervalMinutes: 60,

        // 최대 게시 개수
        maxPosts: 10
    },

    // ============================================
    // 이미지 처리 설정
    // ============================================
    image: {
        // 이미지 처리 대기 최대 재시도 횟수
        maxRetries: 6,

        // 재시도 간격 (초)
        retryInterval: 5,

        // 외부 이미지 호스팅 서비스
        catboxUploadUrl: 'https://catbox.moe/user/api.php'
    },

    // ============================================
    // 에러 처리 설정
    // ============================================
    error: {
        // 에러 발생 시 자동 재시작 여부
        autoRestart: true,

        // 재시작 대기 시간 (초)
        restartDelay: 30,

        // 최대 재시작 횟수
        maxRestarts: 10
    },

    // ============================================
    // 로깅 설정
    // ============================================
    logging: {
        // 콘솔 로그 표시
        console: true,

        // 상세 로그 (디버그)
        verbose: false,

        // 로그에 타임스탬프 포함
        timestamp: true
    },

    // ============================================
    // 개발/테스트 모드
    // ============================================
    dev: {
        // 테스트 모드 (실제 게시 안 함)
        testMode: false,

        // 드라이런 모드 (API 호출 안 함)
        dryRun: false
    }
};

// 설정 유효성 검증
function validateConfig() {
    const errors = [];

    if (!config.api.accessToken || config.api.accessToken === 'your_access_token_here') {
        errors.push('❌ ACCESS_TOKEN이 설정되지 않았습니다');
    }

    if (!config.api.userId || config.api.userId === 'your_user_id_here') {
        errors.push('❌ THREADS_USER_ID가 설정되지 않았습니다');
    }

    if (errors.length > 0) {
        console.error('\n설정 오류:');
        errors.forEach(err => console.error(err));
        console.error('\n💡 .env 파일을 확인하세요!\n');
        return false;
    }

    return true;
}

// 설정 정보 출력
function printConfig() {
    console.log('\n⚙️  현재 설정:');
    console.log('='.repeat(60));
    console.log(`📱 User ID: ${config.api.userId}`);
    console.log(`🔑 Token: ${config.api.accessToken?.substring(0, 20)}...`);
    console.log(`📅 스케줄 파일: ${path.basename(config.paths.scheduleCSV)}`);
    console.log(`⏰ 확인 간격: ${config.scheduler.checkInterval}분`);
    console.log(`⏱️  게시 허용 범위: ±${config.scheduler.timeWindow}분`);
    console.log('='.repeat(60));
    console.log('');
}

module.exports = {
    ...config,
    validateConfig,
    printConfig
};
