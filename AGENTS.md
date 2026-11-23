# 멀티플레이 작업 규칙

- 커밋은 감독자가 수행한다. 요청 없이 커밋하지 않는다.
- `view/`는 그대로 유지한다. 화면은 의도만 보내고 게이트웨이 이벤트를 reducer로 투영한다.
- `gateway/match-gateway.ts`의 계약을 지켜 `OnlineMatchGateway`를 구현한다. ZLink Node `match` 템플릿과 stream-connector를 연결한다.
- 서버에서도 `model/`의 순수 TypeScript 규칙을 재사용한다. React·DOM 의존성을 추가하지 않는다.
- 클라이언트에서 착수·턴·승패를 선반영하지 않는다. 서버가 검증한 이벤트만 적용한다.
- 인증 → 매칭 → 이벤트 연결을 구현하고 재접속·이벤트 순서·중복·연결 해제를 처리한다.
- 온라인 무르기는 서버 합의 정책에 따른다. 지원하지 않으면 게이트웨이 기능 계약을 확장해 UI에 명시한다.
- npm run build / npm test / npm run typecheck / npm run lint를 통과시킨다.
