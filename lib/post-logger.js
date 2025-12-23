/**
 * 게시 기록 관리
 */

const fs = require('fs');
const path = require('path');

class PostLogger {
    constructor(logFilePath) {
        this.logFilePath = logFilePath;
        this.postedItems = [];
        this.load();
    }

    /**
     * 로그 파일 로드
     */
    load() {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const data = fs.readFileSync(this.logFilePath, 'utf8');
                this.postedItems = JSON.parse(data);
                console.log(`📝 ${this.postedItems.length}개의 게시 기록 로드됨`);
            } else {
                console.log('📝 새로운 게시 기록 시작');
            }
        } catch (error) {
            console.error('⚠️  로그 파일 로드 실패:', error.message);
            this.postedItems = [];
        }
    }

    /**
     * 로그 파일 저장
     */
    save() {
        try {
            const dir = path.dirname(this.logFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.logFilePath, JSON.stringify(this.postedItems, null, 2));
            console.log('💾 게시 기록 저장 완료');
        } catch (error) {
            console.error('⚠️  로그 파일 저장 실패:', error.message);
        }
    }

    /**
     * 게시 기록 추가
     */
    add(item, postId) {
        this.postedItems.push({
            ...item,
            posted_at: new Date().toISOString(),
            post_id: postId
        });
        this.save();
    }

    /**
     * 이미 게시되었는지 확인
     */
    isPosted(item) {
        return this.postedItems.some(posted =>
            posted.date === item.date &&
            posted.time === item.time &&
            posted.text === item.text
        );
    }

    /**
     * 통계 조회
     */
    getStats() {
        return {
            total: this.postedItems.length,
            today: this.getTodayCount(),
            lastPosted: this.postedItems[this.postedItems.length - 1]
        };
    }

    /**
     * 오늘 게시된 개수
     */
    getTodayCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.postedItems.filter(item =>
            item.posted_at.startsWith(today)
        ).length;
    }
}

module.exports = PostLogger;
