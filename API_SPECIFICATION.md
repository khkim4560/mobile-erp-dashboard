# GFR Mobile ERP API 명세서 (Specification)

본 문서는 GFR Mobile ERP 대시보드 프론트엔드와 실제 API 서버 간의 연동을 위한 데이터 구조 및 엔드포인트를 정의합니다.

---

## 0. 공통 규칙 (Common Rules)
- **Base URL**: `/api` (Vite Proxy 설정을 통해 실제 서버 주소로 연결됨)
- **날짜 형식**: `YYYY.MM.DD` (문자열)
- **금액/수량**: `Number` (Integer/Long)
- **백분율**: `Number` (Float, 0~100)
- **응답 형식**: `application/json`

---

## 1. 매출 및 실적 관련 API

### 1-1. 당일/전월 실적 요약
- **Endpoint**: `GET /api/daily_performance`, `GET /api/monthly_performance`
- **Description**: 대시보드 메인의 브랜드별 실적 요약 테이블에 사용됩니다.

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `brand` | String | 브랜드 명칭 | 예: "브랜드 A" |
| `target` | Number | 매출 목표액 (또는 목표 건수) | |
| `actual` | Number | 현재 달성 실적액 (또는 실적 건수) | |
| `rate` | Number | 달성율 (%) | `(actual / target) * 100` |

### 1-2. 브랜드별 상세 지표 (필터용)
- **Endpoint**: `GET /api/brand_metrics`
- **Description**: 대시보드 내 브랜드 필터 클릭 시 변경되는 상세 실적 맵 데이터를 반환합니다.

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `Key` | String | 필터 명칭 | 예: "브랜드 A" |
| `Value` | Array | 브랜드 성능 객체 배열 | 1-1의 구조와 동일 |

### 1-3. 매장별 매출 상세 내역
- **Endpoint**: `GET /api/stores`
- **Query Params**: `brand` (옵션), `channel` (옵션), `period` (옵션)
- **Description**: 매출 조회 화면(`SalesView`)의 매장 리스트 데이터입니다.

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | String | 매장 고유 ID | PK |
| `storeName` | String | 매장 명칭 | |
| `actualSales`| Number | 매장별 실제 매출액 | 원 단위 |
| `completedRate`| Number | 목표 달성율 (%) | |
| `stretchGoal` | Number | 추가 달성 목표액 | |
| `brand` | String | 소속 브랜드 | |
| `channel` | String | 유통 채널 | 백화점, 직영점, 아울렛 등 |

---

## 2. 재고 관리 API

### 2-1. 재고 목록 조회
- **Endpoint**: `GET /api/inventory`
- **Query Params**: `q` (검색어), `location` (매장명)
- **Description**: 재고 조회 화면(`InventoryView`)의 리스트 데이터입니다.

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | String | 상품 재고 고유 ID | PK |
| `code` | String | 상품 코드 (SKU / 바코드) | 예: "TS-2024-BLACK-M" |
| `productName` | String | 상품 명칭 | |
| `location` | String | 재고 보유 매장명 | |
| `currentStock`| Number | 현재고 수량 | |
| `availableStock`| Number | 가용재고 수량 | |
| `status` | String | 재고 상태 | 시즌 신상품, 재고부족, 예약 가능 등 |
| `category` | String | 상품 카테고리 | |
| `brand` | String | 브랜드 명칭 | |

### 2-2. 재고 수량 수정
- **Endpoint**: `PUT /api/inventory/:id`
- **Body**: 수정된 재고 객체 전체
- **Description**: 현재고 또는 가용재고 수량 조정 시 호출됩니다.

---

## 3. 결재 관리 API

### 3-1. 결재 요청 목록 조회
- **Endpoint**: `GET /api/approvals`
- **Query Params**: `status` (상태필터)
- **Description**: 결재 관리 화면(`ApprovalView`)의 리스트 데이터입니다.

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | String | 결재 요청 고유 ID | PK |
| `reqCode` | String | 결재 문서 번호 | 예: "2023 - 0852" |
| `title` | String | 결재 요청 제목 | |
| `usageStatus` | String | 할인권/쿠폰 사용 여부 | 사용중, 미사용 |
| `requesterName`| String | 요청자 성명 | |
| `requesterRole`| String | 요청자 직급/역할 | |
| `startDate` | String | 유효 기간 시작일 | `YYYY.MM.DD` |
| `endDate` | String | 유효 기간 종료일 | `YYYY.MM.DD` |
| `status` | String | 결재 진행 상태 | **결재대기, 승인완료, 반려됨** |

### 3-2. 결재 상태 변경
- **Endpoint**: `PUT /api/approvals/:id`
- **Body**: `status`가 변경된 결재 객체
- **Description**: 개별 결재 건의 승인/반려 처리 시 호출됩니다.

---

## 4. 사용자 인증 API (권장 구현)

### 4-1. 로그인
- **Endpoint**: `POST /api/login`
- **Request Body**:
  - `employeeId`: 사원번호
  - `password`: 비밀번호

| 응답 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | String | 사용자 고유 ID | |
| `name` | String | 사용자 성명 | |
| `employeeId` | String | 사원번호 | |
| `roleId` | String | 권한 등급 코드 | |
| `isLoggedIn` | Boolean | 성공 여부 | `true` |
| `token` | String | 인증 토큰 | JWT 등 |

---

## 5. 백엔드 구현 가이드
1. **CamelCase 유지**: 필드명은 프론트엔드와 동일하게 카멜 케이스를 사용하십시오.
2. **CORS/Proxy**: 개발 시에는 Vite의 프록시 설정을 이용하고, 배포 시에는 백엔드에서 CORS 허용 설정이 필요합니다.
3. **Like 검색**: `inventory` API 구현 시 `q` 파라미터는 상품코드와 상품명에 대해 부분 일치 검색이 가능해야 합니다.
