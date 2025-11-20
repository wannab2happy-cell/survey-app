#!/bin/bash

# Anders Survey Platform 배포 스크립트
# 사용법: ./deploy.sh [production|staging]

set -e  # 에러 발생 시 스크립트 중단

ENVIRONMENT=${1:-production}
echo "🚀 배포 환경: $ENVIRONMENT"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 에러 메시지 출력
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 함수: 성공 메시지 출력
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 정보 메시지 출력
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. 환경 변수 파일 확인
info "환경 변수 파일 확인 중..."

if [ ! -f "anders-survey-backend/.env" ]; then
    error "백엔드 .env 파일이 없습니다. anders-survey-backend/.env.example을 참고하여 생성하세요."
fi

if [ ! -f "anders-survey-platform/client/.env.production" ]; then
    error "프론트엔드 .env.production 파일이 없습니다. anders-survey-platform/client/.env.production.example을 참고하여 생성하세요."
fi

success "환경 변수 파일 확인 완료"

# 2. 백엔드 의존성 설치
info "백엔드 의존성 설치 중..."
cd anders-survey-backend
npm install --production
success "백엔드 의존성 설치 완료"
cd ..

# 3. 프론트엔드 의존성 설치 및 빌드
info "프론트엔드 의존성 설치 중..."
cd anders-survey-platform/client
npm install
success "프론트엔드 의존성 설치 완료"

info "프론트엔드 빌드 중..."
npm run build
success "프론트엔드 빌드 완료"
cd ../..

# 4. 빌드 결과 확인
if [ ! -d "anders-survey-platform/client/dist" ]; then
    error "빌드 실패: dist 폴더가 생성되지 않았습니다."
fi

success "빌드 결과 확인 완료"

# 5. 배포 준비 완료 메시지
echo ""
success "배포 준비가 완료되었습니다!"
echo ""
info "다음 단계:"
echo "1. 프론트엔드 빌드 파일: anders-survey-platform/client/dist"
echo "2. 백엔드 파일: anders-survey-backend"
echo "3. 서버에 파일 업로드 후 PM2로 백엔드 실행"
echo ""
info "PM2 실행 명령어:"
echo "  cd /path/to/backend"
echo "  pm2 start server.js --name survey-backend"
echo "  pm2 save"
echo ""

