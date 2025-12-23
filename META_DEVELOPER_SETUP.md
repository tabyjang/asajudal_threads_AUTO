# Meta Developer API 발급 가이드 (Threads API)

Threads API를 사용하려면 Meta (Facebook) 개발자 계정과 Access Token이 필요합니다.

## 1단계: Meta Developer 계정 생성

### 1-1. Meta Developers 사이트 접속
- 웹브라우저에서 접속: https://developers.facebook.com
- 오른쪽 위 "시작하기" 또는 "Get Started" 버튼 클릭

### 1-2. Facebook 계정으로 로그인
- 본인의 Facebook 계정으로 로그인
- 계정이 없다면 먼저 Facebook 계정 생성 필요

### 1-3. 개발자 계정 등록
- 전화번호 인증 진행
- 개발자 약관 동의
- 계정 유형 선택 (개인/비즈니스)

---

## 2단계: 앱 만들기

### 2-1. 앱 생성
1. Meta Developers 대시보드에서 "앱 만들기" (Create App) 클릭
2. **앱 유형 선택**: "비즈니스" 또는 "소비자" 선택
3. **앱 정보 입력**:
   - 앱 이름: 예) "Threads Auto Uploader"
   - 앱 연락처 이메일: 본인 이메일
   - 비즈니스 계정: 선택사항 (없으면 스킵)

### 2-2. 앱 대시보드 진입
- 앱이 생성되면 자동으로 앱 대시보드로 이동됩니다
- 왼쪽 메뉴에서 앱 설정과 제품 추가가 가능합니다

---

## 3단계: Threads API 제품 추가

### 3-1. Threads 제품 찾기
1. 앱 대시보드 왼쪽 메뉴에서 "제품 추가" (Add Product) 클릭
2. 제품 목록에서 **"Threads"** 찾기
   - 보이지 않으면 검색창에 "Threads" 입력
3. "설정" (Set up) 버튼 클릭

### 3-2. Threads API 권한 설정
- **필요한 권한**:
  - `threads_basic` - 기본 정보 접근
  - `threads_content_publish` - 게시물 작성 권한
  - `threads_manage_insights` - 통계 확인 (선택)

---

## 4단계: Access Token 발급

### 방법 1: 단기 토큰 (테스트용) - 권장

1. **Graph API Explorer 사용**:
   - 접속: https://developers.facebook.com/tools/explorer
   - 위에서 만든 앱 선택 (드롭다운)
   - "User Token 생성" 클릭
   - Threads 권한 선택:
     - `threads_basic`
     - `threads_content_publish`
   - "토큰 생성" 클릭

2. **토큰 복사**:
   - 생성된 Access Token 전체 복사
   - 예시: `EAABwz...` 형태의 긴 문자열
   - ⚠️ 이 토큰은 **60일 후 만료**됩니다

### 방법 2: 장기 토큰 (프로덕션용)

장기 토큰은 단기 토큰을 교환해서 얻습니다:

```bash
# 단기 토큰을 장기 토큰으로 교환
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={앱ID}&client_secret={앱시크릿}&fb_exchange_token={단기토큰}"
```

**필요한 정보**:
- 앱 ID: 앱 대시보드 > 설정 > 기본 설정
- 앱 시크릿: 앱 대시보드 > 설정 > 기본 설정 (보기 클릭)
- 단기 토큰: 위 방법1에서 받은 토큰

---

## 5단계: Threads User ID 확인

Threads API를 사용하려면 **Threads User ID**가 필요합니다.

### 5-1. Graph API로 User ID 확인

```bash
curl "https://graph.facebook.com/v18.0/me?fields=id,username&access_token={ACCESS_TOKEN}"
```

**응답 예시**:
```json
{
  "id": "123456789012345",
  "username": "your_threads_username"
}
```

이 `id` 값이 바로 **Threads User ID**입니다.

---

## 6단계: 필요한 정보 정리

테스트를 위해 다음 정보를 메모장에 정리하세요:

```
ACCESS_TOKEN=EAABwz...(긴 토큰 문자열)
THREADS_USER_ID=123456789012345
```

---

## 주의사항

1. **Access Token 보안**:
   - 절대 GitHub 등에 공개하지 마세요
   - `.env` 파일에 저장하고 `.gitignore`에 추가

2. **토큰 만료**:
   - 단기 토큰: 60일 후 만료
   - 장기 토큰: 약 60일마다 갱신 필요
   - 만료되면 다시 발급받아야 합니다

3. **Threads 계정 연결**:
   - Access Token은 본인의 Threads 계정과 연결됩니다
   - API로 게시하면 본인 Threads에 나타납니다

---

## 다음 단계

정보를 모두 받았다면, 다음 파일로 이동:
- `.env` 파일에 토큰 정보 입력
- `test-threads.js` 실행해서 API 테스트

## 문제 해결

### "Threads 제품이 안 보여요"
- Threads API는 2024년부터 제공 시작
- 일부 지역에서는 아직 사용 불가능할 수 있음
- Graph API 버전 v18.0 이상 필요

### "권한 에러가 나요"
- Threads 앱에서 해당 Facebook 계정으로 로그인되어 있는지 확인
- Access Token 생성 시 올바른 권한을 선택했는지 확인
- 토큰이 만료되지 않았는지 확인

### "테스트 토큰 발급이 안 돼요"
- 앱이 "개발 모드"인지 확인 (테스트 단계에서는 개발 모드 사용)
- 본인이 앱의 관리자/개발자/테스터 역할인지 확인
