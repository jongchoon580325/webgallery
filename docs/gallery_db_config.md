# 사진 갤러리 웹 앱을 위한 데이터베이스 및 CRUD 요구사항

## 데이터베이스 스키마

### 사진 테이블 (Photos)
- `id`: 고유 식별자 (기본 키)
- `title`: 사진 제목 (선택사항)
- `photographer`: 사진작가 이름 (주로 사용자)
- `date_taken`: 촬영 날짜
- `location`: 촬영 장소
- `category`: 사진 카테고리/태그
- `description`: 사진 설명 (선택사항)
- `file_path`: 저장된 이미지 파일 경로
- `thumbnail_path`: 썸네일 버전 경로 (빠른 로딩용)
- `file_size`: 이미지 파일 크기
- `file_type`: 파일 형식/확장자 (jpg, png 등)
- `resolution`: 이미지 해상도
- `created_at`: 레코드 생성 타임스탬프
- `updated_at`: 레코드 최종 수정 타임스탬프

### 카테고리 테이블 (Categories)
- `id`: 고유 식별자 (기본 키)
- `name`: 카테고리 이름
- `description`: 카테고리 설명 (선택사항)
- `created_at`: 레코드 생성 타임스탬프
- `updated_at`: 레코드 최종 수정 타임스탬프

### 앨범 테이블 (Albums, 사진 컬렉션 구성용)
- `id`: 고유 식별자 (기본 키)
- `name`: 앨범 이름
- `description`: 앨범 설명 (선택사항)
- `cover_photo_id`: 커버로 사용할 사진 ID (Photos 테이블 외래 키)
- `created_at`: 레코드 생성 타임스탬프
- `updated_at`: 레코드 최종 수정 타임스탬프

### 앨범_사진 연결 테이블 (Album_Photos)
- `album_id`: 앨범 ID (외래 키)
- `photo_id`: 사진 ID (외래 키)
- `order`: 앨범 내 사진 순서

## CRUD 작업

### 사진 관리
- **생성(Create)**: 메타데이터와 함께 새 사진 업로드
  - 다중 파일 업로드 지원 (1-10개 지정)
  - 자동 썸네일 생성
  - EXIF 데이터 추출 (촬영 날짜, 위치 정보 가능 시)
  - 파일 형식 및 크기 검증
  
- **읽기(Read)**: 필터링과 정렬이 가능한 사진 표시
  - 페이지네이션이 있는 목록 보기
  - 그리드/갤러리 보기
  - 전체 메타데이터가 포함된 개별 사진 보기
  - 카테고리, 날짜, 위치별 필터링
  - 날짜, 이름, 크기 등으로 정렬
  
- **수정(Update)**: 사진 메타데이터 편집
  - 모든 사진 속성 업데이트
  - 다중 사진 일괄 업데이트
  
- **삭제(Delete)**: 사진 제거
  - 단일 사진 삭제
  - 일괄 삭제
  - 휴지통 개념의 소프트 삭제 옵션

### 카테고리 관리
- **생성**: 새 카테고리 추가
- **읽기**: 사진 수가 포함된 전체 카테고리 목록
- **수정**: 카테고리 상세 정보 편집
- **삭제**: 카테고리 제거 (사진 재할당 옵션 포함)

### 앨범 관리
- **생성**: 새 앨범 생성
- **읽기**: 앨범 및 내용물 탐색
- **수정**: 앨범 상세 정보 편집, 사진 순서 변경
- **삭제**: 앨범 제거 (사진 보존 옵션 포함)

## API 엔드포인트

```
# 사진
GET /api/photos - 전체 사진 목록 (페이지네이션 및 필터 포함)
GET /api/photos/:id - 특정 사진 상세 정보
POST /api/photos - 새 사진 업로드
PUT /api/photos/:id - 사진 상세 정보 업데이트
DELETE /api/photos/:id - 사진 삭제

# 카테고리
GET /api/categories - 전체 카테고리 목록
GET /api/categories/:id - 특정 카테고리 정보
GET /api/categories/:id/photos - 특정 카테고리의 전체 사진
POST /api/categories - 새 카테고리 생성
PUT /api/categories/:id - 카테고리 업데이트
DELETE /api/categories/:id - 카테고리 삭제

# 앨범
GET /api/albums - 전체 앨범 목록
GET /api/albums/:id - 특정 앨범 정보
GET /api/albums/:id/photos - 특정 앨범의 전체 사진
POST /api/albums - 새 앨범 생성
PUT /api/albums/:id - 앨범 업데이트
PUT /api/albums/:id/photos - 앨범 내 사진 업데이트 (순서, 추가/제거)
DELETE /api/albums/:id - 앨범 삭제
```

## 추가 데이터베이스 고려사항

1. **저장소 전략**:
   - 실제 이미지 파일은 사용자의 로컬 스토리지에 특정한 디렉토리명을 생성하여 저장하고 indexedDB를 통하여 관리
   - 데이터베이스에는 메타데이터와 파일 경로만 저장
   - 사진 백업 전략 구현

2. **성능 최적화**:
   - 자주 조회되는 필드에 대한 인덱싱 (촬영일, 사진작가, 카테고리)
   - 갤러리 뷰의 지연 로딩
   - 자주 접근하는 이미지에 대한 캐싱 전략

3. **검색 기능**:
   - 사진 메타데이터 전체 텍스트 검색
   - 태그 기반 검색
