# 기술스택

   1) frontend
     - ejs, jquery

   2) backend 
     - nodejs(express)

   3) DB
     - postgresql, redis, mongodb

# 실행방법
   
   1) node.js 설치 (node: v18.7.0, npm: v8.15.0)
   2) cmd에서 'npm install'
   3) cmd에서 'npm start'

# 구현 범위

   1) 식별 가능한정보: 이메일, 닉네임, 전화번호, 
          비식별정보: 이름, 비밀번호 

   2) 회원가입 기능(문자 인증 후, 가입절차 진행)

   3) 로그인 시, 식별자와 비식별자 모든 조합(비식별자만으로 구성된 조합 제외)에 따라 로그인이 가능하게 구현

   4) 로그인 후 가입한 정보(비밀번호 제외)를 노출

   5) 비밀번호 찾기 기능 구현(문자 발송 api 연동하여 실제 문자 발송)
   
# 구현 스펙

   1) 회원가입 api (/join)
   2) jwt 디코드를 통한 정보 조회 middleware (auth)
   3) 문자전송 api (/sms/send)
   4) 로그인 api (/login)
   5) 문자로 전송받은 코드검증을 위한 api (/sms/checkNumber)
   6) 비밀번호 변경 api(/reset/password)
   7) 비밀번호 변경을 위한 가입된 번호 체크 api(/lookup)
   8) 식별가능한 정보 중복 방지를 위한 api (/valid/identifier)

# 서비스 참고 사항

   1) postgresql function을 이용하여 식별자, 비식별자 순열조합을 구현하였습니다.(루트 경로에 function.sql 참조)

   2) 식별 가능한 정보의 증가와 회원 증가에 따른 확장성을 고려하여 nosql(mongodb) 사용하였습니다.

   3) 로그인 시, jwt 토큰 인증 방식을 사용하였습니다.

   4) 문자 인증 절차를 위해 redis를 사용하였습니다.