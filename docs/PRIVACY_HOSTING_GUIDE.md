# 개인정보처리방침 호스팅 가이드

Meta Developer 앱 설정에는 **공개적으로 접근 가능한** 개인정보처리방침 URL이 필요합니다.

## 방법 1: 로컬 서버 (테스트용) ⚡ 빠름

### 실행

```bash
npm run privacy
```

### 결과
- URL: `http://localhost:3000/privacy-policy.html`
- 브라우저에서 확인 가능

### ⚠️ 단점
- **로컬에서만 접근 가능**
- Meta가 이 URL을 확인하지 못할 수 있음
- 개발 모드에서는 통과될 수도 있지만 권장하지 않음

---

## 방법 2: GitHub Pages (권장) 🌟

완전 무료이고 HTTPS도 자동 제공됩니다!

### 2-1. GitHub 저장소 생성

1. https://github.com 접속 및 로그인
2. "New repository" 클릭
3. 저장소 이름: `threads-privacy` (또는 원하는 이름)
4. Public 선택
5. "Create repository" 클릭

### 2-2. 파일 업로드

**방법 A: 웹에서 직접 업로드**

1. 생성된 저장소 페이지에서 "Add file" → "Upload files" 클릭
2. `privacy-policy.html` 파일을 드래그앤드롭
3. "Commit changes" 클릭

**방법 B: Git 명령어 사용**

현재 프로젝트 폴더에서:

```bash
# Git 저장소 초기화
git init

# privacy-policy.html만 추가
git add privacy-policy.html

# 커밋
git commit -m "Add privacy policy"

# GitHub 원격 저장소 연결 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/threads-privacy.git

# 푸시
git branch -M main
git push -u origin main
```

### 2-3. GitHub Pages 활성화

1. GitHub 저장소 페이지에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Pages" 클릭
3. **Source** 섹션에서:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
4. "Save" 클릭

### 2-4. URL 확인

약 1-2분 후:
- GitHub Pages 섹션에 초록색 체크마크 표시
- URL 표시: `https://YOUR_USERNAME.github.io/threads-privacy/privacy-policy.html`

이 URL을 복사하세요!

### 2-5. Meta Developer에 입력

Meta Developer 앱 설정에서:
- **개인정보처리방침 URL** 필드에 위 URL 입력
- 저장

---

## 방법 3: 다른 호스팅 서비스

### Netlify (무료)

1. https://www.netlify.com 가입
2. "Add new site" → "Deploy manually" 클릭
3. `privacy-policy.html` 파일 드래그앤드롭
4. 자동으로 URL 생성됨 (예: `https://random-name.netlify.app/privacy-policy.html`)

### Vercel (무료)

1. https://vercel.com 가입
2. "New Project" 클릭
3. `privacy-policy.html` 파일 업로드
4. 자동 배포 및 URL 생성

### Cloudflare Pages (무료)

1. https://pages.cloudflare.com 가입
2. GitHub 저장소 연결
3. 자동 배포

---

## 방법 4: ngrok (로컬을 공개 URL로)

로컬 서버를 임시로 공개하는 방법:

### 4-1. ngrok 설치

https://ngrok.com/download 에서 다운로드

### 4-2. 로컬 서버 실행

```bash
npm run privacy
```

### 4-3. 다른 터미널에서 ngrok 실행

```bash
ngrok http 3000
```

### 4-4. 공개 URL 확인

```
Forwarding  https://abcd1234.ngrok.io -> http://localhost:3000
```

공개 URL: `https://abcd1234.ngrok.io/privacy-policy.html`

### ⚠️ 주의
- ngrok 무료 버전은 세션이 종료되면 URL이 변경됨
- 임시 테스트용으로만 사용

---

## 추천 순서

1. **가장 쉬운 방법**: GitHub Pages (5분)
2. **빠른 테스트**: 로컬 서버 + ngrok (2분, 하지만 임시)
3. **대안**: Netlify/Vercel (5분)

## GitHub Pages가 가장 좋은 이유

- ✅ 완전 무료
- ✅ HTTPS 자동 제공
- ✅ 영구적인 URL
- ✅ 안정적인 호스팅
- ✅ 파일 수정 시 자동 업데이트

---

## 문제 해결

### "GitHub Pages가 활성화되지 않아요"

- 저장소가 Public인지 확인
- 파일 이름이 정확히 `privacy-policy.html`인지 확인
- 1-2분 기다린 후 새로고침

### "Meta에서 URL을 확인할 수 없대요"

- HTTPS URL인지 확인 (HTTP는 안 됨)
- 브라우저에서 직접 접속해서 페이지가 보이는지 확인
- 캐시 문제일 수 있으니 10분 정도 기다려보기

### "로컬 URL을 Meta가 거부해요"

- 로컬 URL (`http://localhost`)은 Meta가 접근할 수 없음
- 반드시 공개 URL 사용 (GitHub Pages 등)

---

## 다음 단계

개인정보처리방침 URL을 설정했다면:

1. Meta Developer 앱 설정 페이지로 돌아가기
2. 개인정보처리방침 URL 필드에 입력
3. 저장
4. Graph API Explorer로 Access Token 발급 시도

화이팅!
