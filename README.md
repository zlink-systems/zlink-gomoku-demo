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

[zlink.systems/start](https://zlink.systems/start)에서 보드 장르의 ZLink 서버 템플릿 zip 하나를 받습니다. 압축을 푼 템플릿과 이 저장소를 AI 코딩 에이전트에게 주면, 컴퓨터와 하는 싱글 플레이를 유지하면서 두 사람이 브라우저에서 **오목 온라인 대전**을 할 수 있는 서버와 클라이언트를 만듭니다. 오목 데모의 작업 실측은 약 55분이었습니다. e2e 실행 대기는 10~15분이었습니다.

### 1. 준비물

| 항목 | 받는 곳 | 비고 |
| --- | --- | --- |
| 서버 템플릿 | [ZLink 시작 페이지](https://zlink.systems/start) | 장르 **보드**, 원하는 서버 언어(Node.js, Java 등), 클라이언트 **웹 브라우저**를 고릅니다. `board-tables` zip 하나를 받아 `my-game/`에 풉니다. |
| 브라우저 커넥터 | 시작 페이지의 설치 링크와 [브라우저 가이드](https://docs.zlink.systems/node/guide/stream-connector/08-browser/) | TypeScript stream-connector인 `@zlink-systems/stream-connector`를 설치합니다. 템플릿에 고정된 Framework 버전과 맞춥니다. |
| 실행 도구 | 선택한 언어의 템플릿 README, 이 문서의 [실행 방법](#실행-방법) | 서버는 템플릿이 요구하는 JDK·Docker 등을 준비합니다. 클라이언트에는 Node.js 22.12 이상이 필요합니다. |
| 이 저장소 | 현재 데모 저장소 | 싱글 플레이 클라이언트와 게임 규칙, 게이트웨이 계약이 들어 있습니다. |

`work/` 아래에 `zlink-gomoku-demo/`와 `my-game/`을 나란히 두면 프롬프트의 경로를 그대로 쓸 수 있습니다. 다른 곳에 압축을 풀었다면 에이전트에게 그 위치를 알려 줍니다. 템플릿의 `README.md`와 `AGENTS.md`에 실행 방법과 확장 지점이 있고, `zlink.structure.json`의 `language`에 서버 언어가 적혀 있습니다. 작업 전에 받은 템플릿 README의 알려진 문제 절을 확인합니다.

### 2. ZLink가 맡는 것과 게임이 맡는 것

| ZLink와 템플릿이 맡는 것 | 게임이 맡는 것 |
| --- | --- |
| 브라우저 연결, Session 관리, 재접속 시 같은 Actor로 다시 연결하는 흐름 | 재접속한 사람에게 현재 판을 복원하고 자리 만료와 승패를 판정합니다. |
| Session node와 Table node 구성, Redis Location Store를 통한 Actor 위치 조회와 라우팅 | Table Spot이 판 상태를 소유하고 착수와 승패를 서버에서 판정합니다. |
| 노드를 늘리는 scale-out과 노드를 비우는 drain에 필요한 배치·재배치 흐름 | 이동할 때 복원해야 할 판 상태와 남은 시간을 스냅숏에 담습니다. |
| 이름 있는 테이블 입장과 템플릿이 제공하는 경우 Matchmaker 대기열 | 빠른 대전·방 코드 정책과 게임별 요청·이벤트를 정의합니다. 클라이언트는 받은 이벤트를 그립니다. |

### 3. AI에게 줄 프롬프트

`work/`에서 AI 코딩 에이전트를 열고 아래 프롬프트를 그대로 줍니다.

```text
목표
- zlink-gomoku-demo/의 싱글 플레이 오목(React 19 + Vite + strict TypeScript)에 두 사람의 온라인 대전을 추가한다.
- ZLink 보드 장르 서버 템플릿(board-tables)으로 게임 서버를 만든다.

범위 밖
- 컴퓨터와 하는 싱글 플레이의 동작과 기존 판 화면은 유지한다. 온라인 표시 추가 범위는 C3과 화면 요구사항(C5부터)을 따른다.
- 템플릿을 다른 서버 언어로 이식하는 작업은 범위 밖이다.

입력
- 클라이언트는 zlink-gomoku-demo/이다. README.md, AGENTS.md, src/features/gomoku_game/gateway/match-gateway.ts를 먼저 읽는다.
- 서버 입력 my-game/은 질문 1에서 확인한 board-tables 템플릿 원본이다. 서버 산출물은 별도의 복사본에 둔다.
- 원본의 README.md, AGENTS.md, zlink.structure.json에서 노드 구성, 요청 흐름, 확장 지점, 실행·검증 명령을 먼저 확인한다.
- ZLink 공식 문서 https://docs.zlink.systems/llms.txt, 고른 언어의 서버 가이드, TypeScript stream-connector 브라우저 가이드 https://docs.zlink.systems/node/guide/stream-connector/08-browser/를 확인한다.
- Framework 버전은 템플릿의 빌드 설정에 고정된 값을 기준으로 삼는다. 서버와 브라우저 커넥터에 같은 버전을 정확히 고정한다.

먼저 확인할 질문
서버 코드를 고치기 전에 사용자에게 묻는다.
1. "zlink.systems/start에서 서버 템플릿을 이미 받아 두셨나요?"라고 묻는다.
   - 받았다면 압축을 푼 폴더를 확인하고 그곳을 my-game/으로 사용한다. work/ 밖이어도 된다.
   - zlink.structure.json의 id가 board-tables인지 확인한다. 확인한 id와 language를 사용자에게 알린다.
   - 받지 않았다면 장르 "보드", 원하는 서버 언어, 클라이언트 "웹 브라우저"를 골라 받은 뒤 압축을 푼 위치를 알려 달라고 안내하고 기다린다.
2. "서버 언어를 무엇으로 할까요?"라고 묻는다.
   - 시작 페이지에서 고를 수 있는 언어 중에 선택하도록 안내한다. 받은 템플릿이 있으면 그 언어를 함께 알린다.
   - 답한 언어와 템플릿의 language가 다르면 해당 언어로 다시 받아 위치를 알려 달라고 안내하고 기다린다. 템플릿을 직접 이식하지 않는다.
3. 정해야 할 것이 더 생기면 사용자에게 묻는다. 템플릿에 없는 구조를 추가할지와 같은 결정을 추측으로 내리지 않는다.

반드시 지킬 규칙 (MUST)
- M1. 템플릿 원본은 보존한다. 서버 코드는 복사본에서만 고친다. 이후 서버 요구사항과 실행 명령은 그 복사본에 적용한다.
- M2. 게임 상태의 소유 위치, Framework 콜백과 I/O의 위치, 공유 메시지 위치, Session의 클라이언트 요청 허용 목록은 템플릿 규칙을 따른다.
  새 클라이언트 요청은 허용 목록에 등록한다. 목록에 없는 패킷은 packet-not-allowed로 거절한다.
- M3. 템플릿에 고정된 버전의 API만 사용한다.
- M4. 서버 메시지 레코드를 처음 만들기 전에 https://docs.zlink.systems 의 메시지 모델 스펙(05-message-model)을 읽는다.
  null을 허용하는 필드는 nullable로 표시한다(Java·Kotlin @Nullable). @ZLinkJsonOptional은 필드 생략만 허용하며 null은 거절한다.
- M5. 64비트 정수(Java long 등)의 JSON 형식은 10진 문자열이다. 브라우저가 보낼 때도 문자열을 사용한다(예: handNumber: "1").
- M6. 나가기처럼 전송 직후 연결을 닫을 때는 request로 보내고 응답을 받은 뒤 연결을 닫는다. send 직후 닫으면 서버가 처리하지 못할 수 있다.
- M7. 재접속 시 이전 tableId로 테이블을 새로 만들지 않는다. 서버 재시작·교체 뒤 테이블이 사라졌으면 자리 없음으로 거절하고 매칭으로 돌려보낸다.

서버 요구사항 (템플릿 복사본)
- S1. 서버가 자유 오목 규칙과 착수 판정을 소유한다.
  템플릿 카드 게임을 15×15 오목으로 바꾼다. 같은 돌 다섯 개 이상을 이으면 이긴다. 장목을 인정하고 금수는 없다. 판이 차고 승자가 없으면 무승부다.
  zlink-gomoku-demo/src/features/gomoku_game/model/의 rules.ts·types.ts를 기준으로 한다.
  TypeScript 서버는 순수 규칙을 재사용한다. 다른 언어에서는 같은 동작을 상태와 분리한 순수 규칙으로 옮기고 rules.test.ts와 같은 경우를 검증한다.
  TableState는 바둑판, 차례, 수 목록, 흑백 배정, 대국 상태를 소유한다.
  서버가 참가자, 차례, 좌표, 빈 칸, 대국 종료 여부를 검증한다. 승패는 서버가 계산한다. 쓰지 않는 카드 게임 메시지와 상수는 지운다.
- S2. Table Spot 하나에 두 자리를 두고 두 사람이 앉으면 대국을 시작한다.
  먼저 앉은 사람이 흑으로 선공하고 두 번째는 백이다. 템플릿이 drain·relocation을 제공하면 남은 시간을 포함한 오목 상태 전체를 스냅숏에 담아 옮긴다.
- S3. 빠른 대전과 방 코드 입장을 지원한다.
  이름 있는 테이블 입장은 템플릿의 JoinTableRequest를 쓴다. Matchmaker가 있으면 FindMatch·CancelMatch를 사용한다. 없으면 ZLink Spot 하나가 대기열을 소유한다.
  빠른 대전은 대기 중인 두 사람에게 새 tableId, 내 색, 상대 닉네임을 알린다.
  방 만들기는 6자리 코드를 발급한다. 다른 사람이 코드로 들어오면 같은 tableId에 앉힌다.
  대기열의 단일 소유자가 방 코드의 발급·조회·만료도 소유한다. 대기 취소, 연결이 끊긴 사람의 대기열·방 코드 제거, 대기 만료를 처리한다.
- S4. 공유 메시지를 타입으로 정의하고 판 이벤트 순서를 표시한다.
  고른 언어의 템플릿 공유 메시지 위치에서 아래 메시지 계약을 구현한다.
- S5. 한 수에 30초를 주고 시간 초과 시 그 사람을 패배 처리한다(timeout).
  Table 한 곳에서 단조 시계로 판정한다. 시험용 시계는 Table 생성 시에만 넘긴다. 남은 시간을 재배치용 상태를 포함한 스냅숏에 담는다.
- S6. 대국마다 한 사람당 최대 3번 상대에게 무르기를 요청할 수 있다.
  상대가 10초 안에 수락하면 요청자의 마지막 수와 그 뒤에 둔 상대 수를 되돌린다. 거절하거나 시간이 지나면 판을 유지한다.
- S7. 같은 Actor로 다시 바인딩하고 템플릿의 Rejoin으로 같은 판을 복원한다.
  연결이 끊겨도 차례 시간은 흐른다. 60초 안에 돌아오지 않으면 그 사람이 진다(leave).
  돌아오면 현재 바둑판·차례·남은 시간을 한 번에 보낸다. 테이블이 사라졌으면 M7을 적용한다.
- S8. 두 사람이 모두 동의하면 같은 테이블에서 재대국한다.
  종료한 대국의 흑백을 바꾸고 handNumber를 늘려 새 판을 시작한다. 한 사람이 나가면 남은 사람에게 알린다.
- S9. 기존 템플릿 e2e를 오목에 맞추고 시나리오와 규칙 검사를 추가한다.
  zlink.structure.json의 scenarios 목록을 구현과 함께 갱신한다. A1의 시나리오와 규칙 경계 시험을 포함한다.

클라이언트 요구사항 (zlink-gomoku-demo/)
- C1. 서버와 같은 버전의 브라우저 커넥터를 설치한다.
  npm install --save-exact @zlink-systems/stream-connector@<서버 템플릿의 Framework 버전>
- C2. OnlineMatchGateway를 기존 MatchGateway 계약에 맞춰 구현한다.
  구현 파일은 src/features/gomoku_game/gateway/online-match-gateway.ts이다.
  stream-connector를 Session node의 실제 ws:// 주소에 연결한다. 서버 시작 로그의 "Server ready:" 등에서 주소를 찾는다.
  첫 패킷을 보내기 전에 푸시 핸들러를 등록한다. 템플릿의 인증·Actor 연결 흐름에 따라 매칭하고 판 이벤트를 받는다.
  화면은 requestMove·requestUndo·resign 의도만 보낸다. GameStarted·MoveApplied·TurnChanged·GameEnded 이벤트를 구독자에게 전달하고 서버에서 받은 이벤트로만 상태를 바꾼다.
  requestMove는 착수 요청만 보낸다. 착수 적용을 받은 뒤에 돌을 놓는다.
  무르기·재접속 스냅숏은 기존 상태 동기화처럼 GameStarted, 유지할 MoveApplied, TurnChanged 순으로 반영한다.
  GameEnded로 시간 초과와 상대 나감을 전달할 수 있게 판 모델의 종료 이유를 확장한다.
  판 번호와 순서 번호로 중복·지난 판·순서가 어긋난 이벤트를 버린다. dispose에서 구독과 연결을 정리한다.
  64비트 필드를 읽을 때는 템플릿 e2e 클라이언트를 참고해 숫자와 10진 문자열을 모두 받아 변환한다. 보낼 때는 M5를 따른다.
- C3. 온라인 전용 기능은 별도 인터페이스에 둔다.
  온라인 전용 인터페이스에는 매칭, 무르기 요청·응답, 재대국, 상대 연결 상태 기능을 둔다. MatchGateway 계약은 유지한다.
  view/의 바둑판·돌·HUD·결과 화면은 그대로 쓴다.
- C4. VITE_ZLINK_STREAM_URL로 Session 주소를 설정한다.
  값이 없으면 온라인 대전 버튼을 비활성화하고 "서버 주소가 없습니다"를 보인다.
  Session의 기본 stream 주소가 루프백이면 다른 기기에서 닿는 주소로 설정을 바꾼다. HTTPS 페이지에서는 wss://로 배포한다.
- C5. 홈에서 온라인 대전 선택 패널을 연다.
  기존 디자인의 짙은 청록 배경, 나무 바둑판, 금색 강조를 유지하고 문구는 한국어로 쓴다.
  2~10자 닉네임을 입력받아 브라우저에 기억한다. "빠른 대전", "방 만들기", "코드로 입장"(6자리 입력칸)을 제공한다.
- C6. 매칭 진행 상태와 취소를 표시한다.
  바둑판 미리보기 위에 "상대를 찾는 중", 흐른 시간(초), 번갈아 깜박이는 돌 두 개, "취소"를 표시한다.
  방을 만들었으면 큰 방 코드, "복사", "친구가 이 코드로 들어오면 시작합니다"를 표시한다.
- C7. 기존 대국 화면에 온라인 상태와 조작을 표시한다.
  오른쪽(모바일은 아래) 선수 카드에 "나"와 상대 닉네임, 흑·백, 차례 강조, 남은 시간 막대(30초)를 표시한다.
  상단 연결 상태 점은 연결이면 초록, 다시 연결 중이면 노랑이다. 상대 차례 문구는 "상대가 생각하고 있어요"를 쓴다.
  "무르기 요청" 버튼에 남은 횟수를 표시하고 "기권하기"를 제공한다.
- C8. 무르기 대기·응답·결과를 표시한다.
  요청한 쪽에 "상대의 답을 기다리는 중"과 10초 카운트다운을 보인다.
  받은 쪽에는 "상대가 한 수 무르기를 요청했어요" 대화상자에 수락·거절을 제공한다. 결과는 짧은 알림(토스트)으로 보인다.
- C9. 상대 연결이 끊기면 바둑판 위에 반투명 띠와 카운트다운을 표시한다.
  문구는 "상대의 연결이 끊겼어요 — 60초 안에 돌아오지 않으면 승리합니다"를 쓴다.
  내 연결이 끊기면 "다시 연결하는 중…"을 보인다. 실패하면 "홈으로"를 제공한다.
- C10. 기존 결과 대화상자에 종료 이유와 재대국 상태를 표시한다.
  다섯 줄·기권·시간 초과·상대 나감·무승부를 구분한다. "재대국 요청"과 "홈으로"를 제공한다.
  내가 요청하면 "상대의 답을 기다리는 중"을 보인다. 상대가 먼저 요청하면 "상대가 재대국을 원해요"와 수락 버튼을 보인다.
  상대가 나가면 재대국 버튼을 끄고 "상대가 나갔어요"를 보인다.
- C11. 휴대폰 세로 390×844에서 요소가 겹치거나 잘리지 않아야 한다.

메시지 계약
- 표의 이름은 논리 계약이다. 템플릿에 같은 패킷이 있으면 실제 이름·필드와의 대응을 명시하고 기존 계약을 유지한다. 표의 범위는 브라우저와 Session 사이다.
- send(푸시)는 서버가 구독된 핸들러로 보내는 이벤트다. request 응답은 해당 호출의 응답으로 돌려준다.
- 모든 판 이벤트에 handNumber(판 번호)와 sequence(순서 번호)를 넣는다. 표의 판 이벤트 필드에는 이 공통 필드가 포함된다.
- ActionRejected의 reason·retryAfterMs는 템플릿 JSON 계약을 유지한다. 새 요청을 Session 허용 목록에 등록한다(M2).

이름 | 방향 | 필드 | send/request
--- | --- | --- | ---
FindMatch | 클라이언트 → 서버 | playerId, nickname | send
MatchQueued | 서버 → 클라이언트 | ticketId | send(푸시)
CancelMatch | 클라이언트 → 서버 | ticketId | send
MatchCancelled | 서버 → 클라이언트 | ticketId, reason | send(푸시)
JoinTableRequest | 클라이언트 → 서버 | playerId, tableId(템플릿의 이름 있는 테이블 입장) | send
CreateRoomRequest / CreateRoomResponse | 클라이언트 → 서버 / 서버 → 클라이언트 | nickname / code(6자리) | request / request 응답
JoinRoomRequest / JoinRoomResponse | 클라이언트 → 서버 / 서버 → 클라이언트 | code, nickname / 수락 여부 또는 거절 사유 | request / request 응답
MatchFound(매칭됨) | 서버 → 클라이언트 | tableId, 내 색, 상대 닉네임 | send(푸시)
GameStarted | 서버 → 클라이언트 | 판 이벤트 공통 필드, 내 색, 바둑판, 차례, 남은 시간 | send(푸시)
MoveRequest | 클라이언트 → 서버 | handNumber, x, y | send
MoveApplied | 서버 → 클라이언트 | 판 이벤트 공통 필드, 수 번호, x, y, 색 | send(푸시)
TurnChanged | 서버 → 클라이언트 | 판 이벤트 공통 필드, 차례인 색, 남은 시간 | send(푸시)
GameEnded | 서버 → 클라이언트 | 판 이벤트 공통 필드, 승자, 이긴 줄, reason(five/draw/resign/timeout/leave) | send(푸시)
ResignRequest | 클라이언트 → 서버 | handNumber | send
UndoRequest / UndoOffered | 클라이언트 → 서버 / 서버 → 상대 | handNumber / 판 이벤트 공통 필드, 응답 기한 | send / send(푸시)
UndoResponse / UndoResult | 클라이언트 → 서버 / 서버 → 클라이언트 | handNumber, 수락 여부 / 판 이벤트 공통 필드, 수락·거절·만료, 수락 후 바둑판·유지한 수 목록·차례·남은 시간 | send / send(푸시)
RematchRequest / RematchResponse | 클라이언트 → 서버 / 서버 → 클라이언트 | handNumber / 판 이벤트 공통 필드, 요청·동의 상태 | send / send(푸시)
Rejoin / 재접속 스냅숏 | 클라이언트 → 서버 / 서버 → 재접속한 클라이언트 | 템플릿의 Actor·tableId 계약 / 판 이벤트 공통 필드, 바둑판, 수 목록, 차례, 남은 시간 | 템플릿 Rejoin 방식
ConnectionChanged | 서버 → 클라이언트 | 판 이벤트 공통 필드, 상대 상태(연결·끊김·나감), 끊겼을 때 복귀 기한 | send(푸시)
LeaveRequest / LeaveResponse | 클라이언트 → 서버 / 서버 → 클라이언트 | tableId / 처리 결과 | request / request 응답
ActionRejected | 서버 → 클라이언트 | reason, retryAfterMs(int32 JSON 숫자, 템플릿 계약) | send(푸시)

완료 조건 (수용 기준)
- A1. 서버 복사본에서 템플릿 README의 빌드 명령과 ./run-e2e.sh 또는 run-e2e.ps1을 실행한다.
  구조 검사, 아래 시나리오, 규칙 경계 시험이 모두 통과해야 한다. 템플릿에 타입 검사·린트 명령이 있으면 함께 통과해야 한다.
  - 빠른 대전 두 명 매칭, 방 코드 입장, 다섯 줄 승리를 확인한다.
  - 차례가 아닌 착수와 이미 놓인 칸에 대한 착수를 거절한다. 거절 전후 상태가 같아야 한다.
  - 시간 초과 패배와 무르기 수락·거절을 확인한다.
  - 재접속 뒤 같은 판에서 이어 두기와 재대국을 확인한다.
  - 순수 규칙 시험에 네 방향, 가장자리, 장목, 무승부, 범위 밖·중복 좌표를 포함한다.
- A2. 클라이언트에서 npm run build, npm test, npm run typecheck, npm run lint가 통과해야 한다.
  가짜 연결로 OnlineMatchGateway의 이벤트 매핑, 중복 무시, 순서 처리를 검증하는 단위 시험을 더한다.
- A3. ./run-server.sh 또는 run-server.ps1으로 로컬 서버를 띄운다.
  브라우저 두 개(데스크톱·모바일 크기)에서 빠른 대전 → 대국 → 무르기 → 승리 → 재대국 → 한쪽 새로고침 뒤 재접속 순서로 수행한다.
  화면 캡처를 남긴다.
- A4. 고른 서버 언어, 변경 사항, 실행 방법을 클라이언트와 서버 복사본의 README에 적는다.

알려진 함정
- 먼저 my-game/README.md의 알려진 문제 절(my-game/README.md#known-issues)을 읽는다.
  한국어 문서에서는 README.ko.md#알려진-문제, Node 템플릿에서는 README.md#relocation-timing 또는 README.ko.md#relocation-대기-시간을 확인한다.
- drain(update) 확인에 약 30초가 걸린다. 진행 중인 판의 턴 시계는 그동안 끝날 수 있다.
  update는 끝난 판을 옮겨 확인한다. 남은 시간의 이전 여부는 도메인 검사에서 별도로 확인한다.
- Java·.NET 커넥터는 64비트 정수를 자동 변환한다. 서버 e2e와 별도로 브라우저에서 M5의 전송 형식을 확인한다.
```

### 4. 검증 방법

1. 서버 복사본에서 `./run-server.sh`를 실행합니다. Windows에서는 템플릿 README에 적힌 `run-server.ps1` 또는 실행 래퍼를 사용합니다.
2. Session 주소를 `VITE_ZLINK_STREAM_URL`에 넣고, 이 저장소에서 `npm ci`와 `npm run dev`를 실행합니다. 서로 다른 브라우저 두 개를 열어 프롬프트의 A3 순서로 대전합니다.
3. 서버 복사본에서 `./run-e2e.sh` 또는 템플릿의 `run-e2e.ps1`을 실행합니다. 템플릿 README의 빌드·구조 검사와 A1의 시나리오가 통과하는지 확인합니다.

## 검증 범위

Vitest는 네 방향·가장자리·장목 승리, 무승부, 불법 착수, 이벤트 reducer, AI의 즉시 승리·사목 방어·열린 삼목 방어, 로컬 게이트웨이의 차례·무르기·기권·타이머 정리를 검증합니다. 화면은 모바일 세로 배치, 터치 입력, 키보드 입력과 reduced-motion 설정을 지원합니다.
