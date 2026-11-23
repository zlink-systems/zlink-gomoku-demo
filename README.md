# 오목 · ZLink Playground

컴퓨터와 두는 싱글 플레이 오목 웹 게임입니다. 이 싱글 게임을 [ZLink](https://zlink.systems)를 이용해 멀티 플레이 게임으로 개발하는 과정을 보여 주는 데모용 저장소입니다. 멀티 플레이를 붙이는 방법은 [멀티 플레이 붙이기](#멀티-플레이-붙이기)에 있습니다. React 19, Vite, strict TypeScript, SVG, 순수 CSS를 사용하며 외부 이미지·폰트·UI 프레임워크가 없습니다.

## 실행 방법

Node.js 22.12 이상을 권장합니다. 의존성은 정확한 버전과 package-lock.json으로 고정합니다.

```sh
npm ci
npm run dev
```

터미널에 표시된 로컬 주소를 엽니다. 휴대폰은 같은 네트워크에서 표시된 Network 주소로 접속할 수 있습니다.

```sh
npm run build      # 타입 검사와 프로덕션 빌드
npm run preview    # dist 미리보기
npm test           # Vitest 단위 테스트, 감시 없이 실행
npm run typecheck  # strict 타입 검사
npm run lint       # ESLint flat config
npm run format     # Prettier
```

## 폴더 구조

```text
src/
  app/                         앱 구성, 화면 전환, 전역 스타일
  features/
    home/                      난이도와 돌 선택
    gomoku_game/
      model/                   순수 규칙, 타입, 이벤트 reducer
      gateway/                 MatchGateway, 로컬 구현, 온라인 스텁
      ai/                      3단계 패턴 평가 컴퓨터
      view/                    SVG 바둑판, 돌, HUD, 결과 화면
  shared/                      Button, 접근성 기본 Dialog
```

## 화면 흐름

홈에서 쉬움·보통·어려움과 흑·백을 선택하고 **컴퓨터와 대국**을 누릅니다. 흑이 선공이며, 백을 고르면 컴퓨터가 먼저 둡니다. 온라인 대전은 준비 중 상태로 비활성화되어 있습니다.

15×15 바둑판의 교차점을 클릭하거나 터치해 돌을 놓습니다. 키보드로는 바둑판에 Tab으로 진입한 뒤 방향키로 위치를 고르고 Enter 또는 Space로 착수합니다. 마지막 수는 돌 중앙의 작은 점으로 표시됩니다. 화면은 현재 차례와 수를 안내합니다.

가로·세로·대각선으로 같은 돌 다섯 개 이상을 이으면 승리하며 장목도 인정합니다. 금수 없는 자유 오목입니다. 바둑판이 가득 차고 승자가 없으면 무승부입니다. 결과 대화상자에서 다시 하기·홈으로·바둑판 보기를 선택합니다. 기권과 대국 중 홈 이동에는 확인 창이 있습니다.

**한 수 무르기**는 마지막 사용자 착수부터 컴퓨터 응답까지 되돌립니다. 컴퓨터가 생각 중이면 대기 작업도 취소합니다. 사용자가 백일 때 컴퓨터의 첫 수는 유지합니다. 종료된 대국은 무르지 않습니다.

쉬움은 후보 수에 변화를 주며, 보통은 즉시 승리와 상대의 즉시 승리를 확인합니다. 어려움은 즉시 승리를 우선하고 상대의 사목·열린 삼목·끊어진 위협을 점수화해 방어합니다. 완전 탐색이나 최강 AI는 아니며, 동시에 생긴 두 승리 위협을 모두 막을 수는 없습니다. 주변 후보만 평가하며 180ms의 짧은 생각 시간을 둡니다.

## 이벤트와 권한

화면 → `requestMove(x,y)` / `requestUndo()` / `resign()` → 게이트웨이 → 이벤트 → `gameReducer` → 화면 순서입니다. 화면은 규칙이나 AI를 직접 호출하지 않습니다. `MoveApplied`가 오기 전에는 돌을 배치하지 않습니다. `TurnChanged`, `GameEnded`도 각각 명시적인 이벤트로만 상태를 바꿉니다.

로컬 게이트웨이는 규칙 검증과 AI를 담당합니다. 무르기는 `GameStarted` 뒤 유지할 `MoveApplied`를 재생하고 `TurnChanged`를 내보내는 전체 상태 동기화입니다. `start` 이전에 구독하고, 화면을 벗어나면 `dispose`로 타이머와 리스너를 정리합니다. 앱 구성 지점은 `src/app/App.tsx`입니다.

## 멀티 플레이 붙이기

ZLink 시작 페이지에서 템플릿을 받고, 이 저장소와 템플릿을 AI 코딩 에이전트에게 주어 멀티 플레이 게임을 만들게 합니다.

### 1. 템플릿 받기

1. [zlink.systems/start](https://zlink.systems/start)를 엽니다.
2. 게임 장르에서 **보드**를 고릅니다. 서버 구조는 `board-tables`(Session node + Table node, Redis Location Store)입니다.
3. 서버 언어는 **Node.js**를 고릅니다. 클라이언트와 같은 TypeScript라서 이 저장소의 `model/` 규칙을 서버에서 그대로 쓸 수 있습니다.
4. 클라이언트는 **웹 브라우저**를 고릅니다. 브라우저 클라이언트는 TypeScript stream-connector(`@zlink-systems/stream-connector`)를 씁니다. 페이지의 설치·브라우저 가이드 링크를 함께 엽니다.
5. 서버 템플릿을 내려받아 압축을 풉니다(`my-game/`). 템플릿의 `README.md`와 `AGENTS.md`가 실행 방법과 확장 지점을 설명합니다.

폴더를 다음처럼 둡니다.

```text
work/
  zlink-gomoku-demo/   이 저장소(클라이언트)
  my-game/             내려받은 board-tables 서버 템플릿
```

### 2. AI에게 줄 프롬프트

`work/`에서 AI 코딩 에이전트를 열고 아래 프롬프트를 그대로 줍니다.

```text
`zlink-gomoku-demo/`는 컴퓨터와 두는 싱글 플레이 오목(React 19 + Vite + strict TypeScript)이고,
`my-game/`은 zlink.systems/start에서 받은 ZLink 보드 장르 서버 템플릿(board-tables, Node.js)이다.
이 둘로 두 사람이 온라인에서 대국하는 멀티 플레이 오목을 만들어 줘. 싱글 플레이(컴퓨터와 대국)는 지금처럼 동작해야 한다.

먼저 읽을 것
- my-game/README.md, my-game/AGENTS.md: 템플릿 구조, 요청 흐름, 확장 지점, 실행·검증 명령. 템플릿의 규칙(상태는 TableState가 소유,
  Framework 콜백과 I/O는 server/table/infrastructure/, 메시지는 server/shared/messages.ts, 클라이언트 요청은 session.ts 허용 목록)을 그대로 따른다.
- zlink-gomoku-demo/README.md, zlink-gomoku-demo/AGENTS.md, src/features/gomoku_game/gateway/match-gateway.ts:
  화면은 의도(requestMove·requestUndo·resign)만 보내고 게이트웨이 이벤트(GameStarted·MoveApplied·TurnChanged·GameEnded)로만 상태를 바꾼다.
- ZLink 공식 문서: https://docs.zlink.systems/llms.txt, Node 서버 가이드, stream-connector 브라우저 가이드. 템플릿 package.json에 고정된 버전의 API만 쓴다.

서버(my-game/)
1. 게임 규칙: 템플릿의 카드 게임 규칙을 오목으로 바꾼다. 판정은 zlink-gomoku-demo/src/features/gomoku_game/model/의 rules.ts·types.ts를
   서버로 가져와 그대로 쓴다(15×15, 다섯 개 이상 이으면 승리, 장목 인정, 금수 없음, 바둑판이 차면 무승부). TableState가 바둑판·차례·수 목록·
   흑백 배정·대국 상태를 소유하고, 착수가 들어오면 서버가 참가자·차례·좌표·빈 칸·대국 종료 여부를 검증한 뒤 판정한다. 클라이언트가 보낸 승패는 믿지 않는다.
2. 테이블: 한 Table Spot = 오목 판 하나, 자리 2개. 먼저 앉은 사람이 흑(선공), 두 번째가 백. 두 자리가 차면 대국을 시작한다.
3. 매칭: 템플릿은 클라이언트가 tableId를 정해 JoinTableRequest를 보낸다. 여기에 두 가지 입장을 더한다.
   - 빠른 대전: 대기열에서 두 사람을 짝지어 새 tableId를 정하고 두 사람에게 알린다. 대기열을 소유하는 곳은 한 곳만 둔다(ZLink Spot 하나).
   - 방 코드: 한 사람이 방을 만들면 짧은 코드(6자리)를 받고, 다른 사람이 그 코드로 같은 tableId에 들어온다.
   대기 취소, 대기 중 연결 끊김(대기열에서 뺌)을 처리한다.
4. 메시지(server/shared/messages.ts, 클래스로 타입 정의): 빠른 대전 요청·취소, 방 만들기·코드로 입장, 매칭됨(tableId, 내 색, 상대 이름),
   착수 요청(handNumber·x·y), 착수 적용(수 번호·x·y·색), 차례 바뀜(색·남은 시간), 대국 끝(승자·이긴 줄·이유: five/draw/resign/timeout/leave),
   기권, 무르기 요청·응답·결과, 재대국 요청·응답, 상대 연결 상태, 거절(ActionRejected: reason·retryAfterMs). 모든 판 이벤트에 handNumber와
   순서 번호를 넣어 클라이언트가 중복·순서 어긋남을 버릴 수 있게 한다.
5. 시간: 한 수 30초. 시간이 지나면 그 사람이 진다(timeout). 시간 판정은 TableState 한 곳에서 단조 시계로 하고 남은 시간을 스냅숏에 넣는다.
6. 무르기: 상대 동의제. 요청하면 상대에게 묻고, 수락하면 요청한 사람의 마지막 수(그 뒤 상대 수 포함)를 되돌린다. 10초 안에 답이 없거나
   거절하면 그대로 둔다. 대국마다 한 사람당 3번까지.
7. 연결 끊김·재접속: 템플릿의 재접속(같은 Actor로 다시 바인딩, Rejoin 처리)을 그대로 쓴다. 끊긴 사람의 차례 시간은 계속 흐르고,
   60초 안에 돌아오지 않으면 그 사람이 진다(leave). 돌아오면 지금 바둑판·차례·남은 시간을 한 번에 받는다.
8. 재대국: 대국이 끝나면 두 사람 모두 재대국을 누르면 같은 테이블에서 흑백을 바꿔 새 판을 시작한다. 한 사람이 나가면 남은 사람에게 알린다.
9. 템플릿의 table·reconnect·update 시나리오(e2e/client.mts)를 오목에 맞게 고치고 아래 시나리오를 더한다: 빠른 대전 두 명 매칭,
   방 코드 입장, 다섯 줄 승리, 차례가 아닌 착수·이미 놓인 칸 착수 거절(상태 그대로), 시간 초과 패배, 무르기 수락·거절, 재접속 뒤 같은 판 이어 두기,
   재대국. e2e/domain.test.ts에 오목 규칙의 경계 시험을 더한다.

클라이언트(zlink-gomoku-demo/)
1. OnlineMatchGateway(src/features/gomoku_game/gateway/online-match-gateway.ts)를 MatchGateway 계약 그대로 구현한다.
   stream-connector로 서버(Session node의 ws:// 주소)에 연결하고, 서버 메시지를 GameStarted·MoveApplied·TurnChanged·GameEnded로 바꿔
   구독자에게 보낸다. requestMove는 착수 요청만 보내고 돌은 서버의 착수 적용을 받은 뒤에만 놓는다(낙관적 반영 금지).
   handNumber·순서 번호로 중복과 지난 판 이벤트를 버린다. dispose에서 구독과 연결을 닫는다.
   int64 필드는 JSON에서 10진 문자열로 오므로 템플릿 e2e/client.mts처럼 바꿔 읽는다.
2. 게이트웨이에 온라인 전용 기능(매칭, 무르기 요청·응답, 재대국, 상대 연결 상태)을 더할 때는 MatchGateway를 넓히지 말고 온라인 전용
   인터페이스를 따로 둔다. view/의 바둑판·돌·HUD·결과 화면은 고치지 않고 그대로 쓴다.
3. 서버 주소는 Vite 환경 변수(VITE_ZLINK_STREAM_URL)로 받는다. 값이 없으면 홈의 온라인 대전 버튼을 비활성화하고 "서버 주소가 없습니다"를 보인다.

화면(지금 디자인과 같은 톤 — 짙은 청록 배경, 나무 바둑판, 금색 강조, 한국어)
1. 홈: "온라인 대전" 버튼을 켠다. 누르면 닉네임 입력(2~10자, 브라우저에 기억)과 세 가지 선택이 있는 패널을 연다:
   "빠른 대전", "방 만들기", "코드로 입장"(6자리 입력칸).
2. 매칭 대기 화면: 바둑판 미리보기 위에 "상대를 찾는 중" 문구와 흐른 시간(초), 돌 두 개가 번갈아 깜박이는 표시, "취소" 버튼.
   방 만들기면 큰 글씨로 방 코드와 "복사" 버튼, "친구가 이 코드로 들어오면 시작합니다" 안내.
3. 대국 화면: 지금 화면 구성을 그대로 두고 오른쪽(모바일은 아래) 선수 카드에 "나"/상대 닉네임과 흑·백 표시, 차례인 쪽 강조와 남은 시간 막대(30초).
   상단에 연결 상태 점(초록=연결, 노랑=다시 연결 중). "컴퓨터가 생각하고 있어요" 대신 "상대가 생각하고 있어요".
   버튼: "무르기 요청"(남은 횟수 표시), "기권하기".
4. 무르기: 요청한 쪽은 "상대의 답을 기다리는 중"(10초 카운트다운), 받은 쪽은 "상대가 한 수 무르기를 요청했어요" 대화상자에 수락·거절.
   결과를 짧은 알림(토스트)으로 보인다.
5. 상대 연결 끊김: 바둑판 위에 반투명 띠로 "상대의 연결이 끊겼어요 — 60초 안에 돌아오지 않으면 승리합니다"와 카운트다운.
   내 연결이 끊기면 "다시 연결하는 중…"을 보이고, 실패하면 "홈으로" 버튼.
6. 결과 대화상자: 지금 결과 창에 이유(다섯 줄·기권·시간 초과·상대 나감·무승부)를 더하고 "재대국 요청" 버튼(누르면 "상대의 답을 기다리는 중",
   상대가 요청하면 "상대가 재대국을 원해요" 수락 버튼), "홈으로". 상대가 나가면 재대국 버튼을 끄고 "상대가 나갔어요".
7. 휴대폰 세로 화면(390×844)에서도 겹치거나 잘리는 곳이 없게 한다.

완료 조건
- my-game: 템플릿 README의 빌드·e2e 명령(./run-e2e.sh 또는 run-e2e.ps1)이 모든 시나리오 통과, npm run typecheck·lint 통과.
- zlink-gomoku-demo: npm run build·test·typecheck·lint 통과. OnlineMatchGateway 단위 시험(가짜 연결로 이벤트 매핑·중복 무시·순서)을 더한다.
- 서버를 로컬로 띄우고 브라우저 두 개(데스크톱·모바일 크기)로 빠른 대전 → 대국 → 무르기 → 승리 → 재대국 → 한쪽 새로고침 뒤 재접속까지
  실제로 해 보고, 화면 캡처를 남긴다.
- 무엇을 바꿨는지와 실행 방법을 두 저장소의 README에 적는다.
```

AI가 만든 결과는 위 완료 조건으로 확인합니다. 서버 규칙과 상태는 서버가 소유하고, 클라이언트는 서버가 보낸 이벤트만 그린다는 것이 이 데모의 핵심 구조입니다.

## 검증 범위

Vitest는 네 방향·가장자리·장목 승리, 무승부, 불법 착수, 이벤트 reducer, AI의 즉시 승리·사목 방어·열린 삼목 방어, 로컬 게이트웨이의 차례·무르기·기권·타이머 정리를 검증합니다. 화면은 모바일 세로 배치, 터치 입력, 키보드 입력과 reduced-motion 설정을 지원합니다.
