# University Protocol Application Decisions

- schema id: midnight-university-protocol-application-decisions
- schema version: midnight-university-protocol-application-decisions.v1
- compatible reader floor: midnight-university-protocol-application-decisions.v1
- compatible reader ceiling: midnight-university-protocol-application-decisions.v1
- students: 10
- companies: 3
- discount applicants: 5
- issuance batches: 2
- batch size: 5

## Issuance Traces
### Ada Avery 0001 (STU-0001)
- holder did: did:midnight:student:0001
- holder method: #holder-key-1
- credential: Example University / BSc Computer Science
- #### Request
- - thread: <hex>
- - from: STU-0001
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0001 requested diploma issuance
- - dto: {"studentId":"STU-0001","holderDidUrl":"did:midnight:student:0001","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0001","graduateName":"Ada Avery 0001","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":98}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0001
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0001
- - dto: {"studentId":"STU-0001","issuedAt":"40000","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":"98"}
### Ben Avery 0002 (STU-0002)
- holder did: did:midnight:student:0002
- holder method: #holder-key-1
- credential: Example University / BSc Data Science
- #### Request
- - thread: <hex>
- - from: STU-0002
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0002 requested diploma issuance
- - dto: {"studentId":"STU-0002","holderDidUrl":"did:midnight:student:0002","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0002","graduateName":"Ben Avery 0002","universityName":"Example University","awardName":"BSc Data Science","finalGrade":94}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0002
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0002
- - dto: {"studentId":"STU-0002","issuedAt":"40001","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Data Science","finalGrade":"94"}
### Cara Avery 0003 (STU-0003)
- holder did: did:midnight:student:0003
- holder method: #holder-key-1
- credential: Example University / BEng Electrical Eng
- #### Request
- - thread: <hex>
- - from: STU-0003
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0003 requested diploma issuance
- - dto: {"studentId":"STU-0003","holderDidUrl":"did:midnight:student:0003","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0003","graduateName":"Cara Avery 0003","universityName":"Example University","awardName":"BEng Electrical Eng","finalGrade":91}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0003
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0003
- - dto: {"studentId":"STU-0003","issuedAt":"40002","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BEng Electrical Eng","finalGrade":"91"}
### Dion Avery 0004 (STU-0004)
- holder did: did:midnight:student:0004
- holder method: #holder-key-1
- credential: Example University / BA Business Analytics
- #### Request
- - thread: <hex>
- - from: STU-0004
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0004 requested diploma issuance
- - dto: {"studentId":"STU-0004","holderDidUrl":"did:midnight:student:0004","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0004","graduateName":"Dion Avery 0004","universityName":"Example University","awardName":"BA Business Analytics","finalGrade":90}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0004
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0004
- - dto: {"studentId":"STU-0004","issuedAt":"40003","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BA Business Analytics","finalGrade":"90"}
### Ella Avery 0005 (STU-0005)
- holder did: did:midnight:student:0005
- holder method: #holder-key-1
- credential: Example University / BSc Computer Science
- #### Request
- - thread: <hex>
- - from: STU-0005
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0005 requested diploma issuance
- - dto: {"studentId":"STU-0005","holderDidUrl":"did:midnight:student:0005","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0005","graduateName":"Ella Avery 0005","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":72}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0005
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0005
- - dto: {"studentId":"STU-0005","issuedAt":"40004","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":"72"}
### Finn Avery 0006 (STU-0006)
- holder did: did:midnight:student:0006
- holder method: #holder-key-1
- credential: Example University / BSc Data Science
- #### Request
- - thread: <hex>
- - from: STU-0006
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0006 requested diploma issuance
- - dto: {"studentId":"STU-0006","holderDidUrl":"did:midnight:student:0006","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0006","graduateName":"Finn Avery 0006","universityName":"Example University","awardName":"BSc Data Science","finalGrade":100}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0006
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0006
- - dto: {"studentId":"STU-0006","issuedAt":"40005","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Data Science","finalGrade":"100"}
### Gia Avery 0007 (STU-0007)
- holder did: did:midnight:student:0007
- holder method: #holder-key-1
- credential: Example University / BEng Electrical Eng
- #### Request
- - thread: <hex>
- - from: STU-0007
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0007 requested diploma issuance
- - dto: {"studentId":"STU-0007","holderDidUrl":"did:midnight:student:0007","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0007","graduateName":"Gia Avery 0007","universityName":"Example University","awardName":"BEng Electrical Eng","finalGrade":71}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0007
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0007
- - dto: {"studentId":"STU-0007","issuedAt":"40006","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BEng Electrical Eng","finalGrade":"71"}
### Hugo Avery 0008 (STU-0008)
- holder did: did:midnight:student:0008
- holder method: #holder-key-1
- credential: Example University / BA Business Analytics
- #### Request
- - thread: <hex>
- - from: STU-0008
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0008 requested diploma issuance
- - dto: {"studentId":"STU-0008","holderDidUrl":"did:midnight:student:0008","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0008","graduateName":"Hugo Avery 0008","universityName":"Example University","awardName":"BA Business Analytics","finalGrade":78}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0008
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0008
- - dto: {"studentId":"STU-0008","issuedAt":"40007","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BA Business Analytics","finalGrade":"78"}
### Iris Avery 0009 (STU-0009)
- holder did: did:midnight:student:0009
- holder method: #holder-key-1
- credential: Example University / BSc Computer Science
- #### Request
- - thread: <hex>
- - from: STU-0009
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0009 requested diploma issuance
- - dto: {"studentId":"STU-0009","holderDidUrl":"did:midnight:student:0009","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0009","graduateName":"Iris Avery 0009","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":85}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0009
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0009
- - dto: {"studentId":"STU-0009","issuedAt":"40008","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Computer Science","finalGrade":"85"}
### Jude Avery 0010 (STU-0010)
- holder did: did:midnight:student:0010
- holder method: #holder-key-1
- credential: Example University / BSc Data Science
- #### Request
- - thread: <hex>
- - from: STU-0010
- - to: uni-example-001
- - message: <hex>
- - responds-to: <hex>
- - summary: Student STU-0010 requested diploma issuance
- - dto: {"studentId":"STU-0010","holderDidUrl":"did:midnight:student:0010","holderMethodId":"#holder-key-1","claimValues":{"diplomaId":"DIP-2030-0010","graduateName":"Jude Avery 0010","universityName":"Example University","awardName":"BSc Data Science","finalGrade":92}}
- #### Result
- - thread: <hex>
- - from: uni-example-001
- - to: STU-0010
- - message: <hex>
- - responds-to: <hex>
- - summary: University issued diploma credential to STU-0010
- - dto: {"studentId":"STU-0010","issuedAt":"40009","issuerVerificationMethodRef":"<hex>:#issuer-key-1","universityName":"Example University","awardName":"BSc Data Science","finalGrade":"92"}

## Job-Application Decisions

### Ada Avery 0001 (STU-0001) -> Northwind Robotics (company-northwind-robotics)
- kind: jobApplication
- role: junior-platform-engineer
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-northwind-robotics
- to: STU-0001
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-northwind-robotics for STU-0001
- dto: {"kind":"jobApplication","studentId":"STU-0001","verifierId":"company-northwind-robotics","requestedRole":"junior-platform-engineer","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0001
  - to: company-northwind-robotics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0001 for STU-0001
  - dto: {"kind":"jobApplication","studentId":"STU-0001","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Ben Avery 0002 (STU-0002) -> Blue Ocean Analytics (company-blue-ocean-analytics)
- kind: jobApplication
- role: data-analyst-trainee
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-blue-ocean-analytics
- to: STU-0002
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-blue-ocean-analytics for STU-0002
- dto: {"kind":"jobApplication","studentId":"STU-0002","verifierId":"company-blue-ocean-analytics","requestedRole":"data-analyst-trainee","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0002
  - to: company-blue-ocean-analytics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0002 for STU-0002
  - dto: {"kind":"jobApplication","studentId":"STU-0002","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Cara Avery 0003 (STU-0003) -> Pioneer Systems (company-pioneer-systems)
- kind: jobApplication
- role: robotics-software-intern
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-pioneer-systems
- to: STU-0003
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-pioneer-systems for STU-0003
- dto: {"kind":"jobApplication","studentId":"STU-0003","verifierId":"company-pioneer-systems","requestedRole":"robotics-software-intern","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0003
  - to: company-pioneer-systems
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0003 for STU-0003
  - dto: {"kind":"jobApplication","studentId":"STU-0003","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Dion Avery 0004 (STU-0004) -> Northwind Robotics (company-northwind-robotics)
- kind: jobApplication
- role: business-operations-analyst
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-northwind-robotics
- to: STU-0004
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-northwind-robotics for STU-0004
- dto: {"kind":"jobApplication","studentId":"STU-0004","verifierId":"company-northwind-robotics","requestedRole":"business-operations-analyst","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0004
  - to: company-northwind-robotics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0004 for STU-0004
  - dto: {"kind":"jobApplication","studentId":"STU-0004","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Ella Avery 0005 (STU-0005) -> Blue Ocean Analytics (company-blue-ocean-analytics)
- kind: jobApplication
- role: junior-platform-engineer
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-blue-ocean-analytics
- to: STU-0005
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-blue-ocean-analytics for STU-0005
- dto: {"kind":"jobApplication","studentId":"STU-0005","verifierId":"company-blue-ocean-analytics","requestedRole":"junior-platform-engineer","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0005
  - to: company-blue-ocean-analytics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0005 for STU-0005
  - dto: {"kind":"jobApplication","studentId":"STU-0005","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Finn Avery 0006 (STU-0006) -> Pioneer Systems (company-pioneer-systems)
- kind: jobApplication
- role: data-analyst-trainee
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-pioneer-systems
- to: STU-0006
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-pioneer-systems for STU-0006
- dto: {"kind":"jobApplication","studentId":"STU-0006","verifierId":"company-pioneer-systems","requestedRole":"data-analyst-trainee","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0006
  - to: company-pioneer-systems
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0006 for STU-0006
  - dto: {"kind":"jobApplication","studentId":"STU-0006","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Gia Avery 0007 (STU-0007) -> Northwind Robotics (company-northwind-robotics)
- kind: jobApplication
- role: robotics-software-intern
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-northwind-robotics
- to: STU-0007
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-northwind-robotics for STU-0007
- dto: {"kind":"jobApplication","studentId":"STU-0007","verifierId":"company-northwind-robotics","requestedRole":"robotics-software-intern","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0007
  - to: company-northwind-robotics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0007 for STU-0007
  - dto: {"kind":"jobApplication","studentId":"STU-0007","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Hugo Avery 0008 (STU-0008) -> Blue Ocean Analytics (company-blue-ocean-analytics)
- kind: jobApplication
- role: business-operations-analyst
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-blue-ocean-analytics
- to: STU-0008
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-blue-ocean-analytics for STU-0008
- dto: {"kind":"jobApplication","studentId":"STU-0008","verifierId":"company-blue-ocean-analytics","requestedRole":"business-operations-analyst","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0008
  - to: company-blue-ocean-analytics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0008 for STU-0008
  - dto: {"kind":"jobApplication","studentId":"STU-0008","disclosures":["graduateName","universityName","awardName","honorsCode","graduationYear"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Iris Avery 0009 (STU-0009) -> Pioneer Systems (company-pioneer-systems)
- kind: jobApplication
- role: junior-platform-engineer
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-pioneer-systems
- to: STU-0009
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-pioneer-systems for STU-0009
- dto: {"kind":"jobApplication","studentId":"STU-0009","verifierId":"company-pioneer-systems","requestedRole":"junior-platform-engineer","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0009
  - to: company-pioneer-systems
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0009 for STU-0009
  - dto: {"kind":"jobApplication","studentId":"STU-0009","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade","creditsEarned"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>
### Jude Avery 0010 (STU-0010) -> Northwind Robotics (company-northwind-robotics)
- kind: jobApplication
- role: data-analyst-trainee
- final decision: accepted
- final reason: job application accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: company-northwind-robotics
- to: STU-0010
- message: <hex>
- responds-to: <hex>
- summary: jobApplication request from company-northwind-robotics for STU-0010
- dto: {"kind":"jobApplication","studentId":"STU-0010","verifierId":"company-northwind-robotics","requestedRole":"data-analyst-trainee","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"enforceMinimumFinalGrade":false,"minimumFinalGrade":"0","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0010
  - to: company-northwind-robotics
  - message: <hex>
  - responds-to: <hex>
  - summary: jobApplication submission from STU-0010 for STU-0010
  - dto: {"kind":"jobApplication","studentId":"STU-0010","disclosures":["graduateName","universityName","awardName","graduationYear","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: job application accepted
    - response: <hex>

## Discount Decisions

### Ada Avery 0001 (STU-0001) -> Student Square Mall (mall-student-square)
- kind: mallDiscount
- role: n/a
- final decision: accepted
- final reason: mall discount accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: mall-student-square
- to: STU-0001
- message: <hex>
- responds-to: <hex>
- summary: mallDiscount request from mall-student-square for STU-0001
- dto: {"kind":"mallDiscount","studentId":"STU-0001","verifierId":"mall-student-square","requestedRole":null,"disclosures":["universityName","finalGrade"],"enforceMinimumFinalGrade":true,"minimumFinalGrade":"91","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0001
  - to: mall-student-square
  - message: <hex>
  - responds-to: <hex>
  - summary: mallDiscount submission from STU-0001 for STU-0001
  - dto: {"kind":"mallDiscount","studentId":"STU-0001","disclosures":["universityName","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: mall discount accepted
    - response: <hex>
### Ben Avery 0002 (STU-0002) -> Student Square Mall (mall-student-square)
- kind: mallDiscount
- role: n/a
- final decision: accepted
- final reason: mall discount accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: mall-student-square
- to: STU-0002
- message: <hex>
- responds-to: <hex>
- summary: mallDiscount request from mall-student-square for STU-0002
- dto: {"kind":"mallDiscount","studentId":"STU-0002","verifierId":"mall-student-square","requestedRole":null,"disclosures":["universityName","finalGrade"],"enforceMinimumFinalGrade":true,"minimumFinalGrade":"91","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0002
  - to: mall-student-square
  - message: <hex>
  - responds-to: <hex>
  - summary: mallDiscount submission from STU-0002 for STU-0002
  - dto: {"kind":"mallDiscount","studentId":"STU-0002","disclosures":["universityName","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: mall discount accepted
    - response: <hex>
### Cara Avery 0003 (STU-0003) -> Student Square Mall (mall-student-square)
- kind: mallDiscount
- role: n/a
- final decision: accepted
- final reason: mall discount accepted
- final rejection kind: none
#### Request
- thread: <hex>
- from: mall-student-square
- to: STU-0003
- message: <hex>
- responds-to: <hex>
- summary: mallDiscount request from mall-student-square for STU-0003
- dto: {"kind":"mallDiscount","studentId":"STU-0003","verifierId":"mall-student-square","requestedRole":null,"disclosures":["universityName","finalGrade"],"enforceMinimumFinalGrade":true,"minimumFinalGrade":"91","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0003
  - to: mall-student-square
  - message: <hex>
  - responds-to: <hex>
  - summary: mallDiscount submission from STU-0003 for STU-0003
  - dto: {"kind":"mallDiscount","studentId":"STU-0003","disclosures":["universityName","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: accepted (none)
    - reason: mall discount accepted
    - response: <hex>
### Dion Avery 0004 (STU-0004) -> Student Square Mall (mall-student-square)
- kind: mallDiscount
- role: n/a
- final decision: rejected
- final reason: failed assert: University-diploma disclosed final grade is below the verifier minimum
- final rejection kind: verificationFailed
#### Request
- thread: <hex>
- from: mall-student-square
- to: STU-0004
- message: <hex>
- responds-to: <hex>
- summary: mallDiscount request from mall-student-square for STU-0004
- dto: {"kind":"mallDiscount","studentId":"STU-0004","verifierId":"mall-student-square","requestedRole":null,"disclosures":["universityName","finalGrade"],"enforceMinimumFinalGrade":true,"minimumFinalGrade":"91","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0004
  - to: mall-student-square
  - message: <hex>
  - responds-to: <hex>
  - summary: mallDiscount submission from STU-0004 for STU-0004
  - dto: {"kind":"mallDiscount","studentId":"STU-0004","disclosures":["universityName","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: rejected (verificationFailed)
    - reason: failed assert: University-diploma disclosed final grade is below the verifier minimum
    - response: <hex>
### Ella Avery 0005 (STU-0005) -> Student Square Mall (mall-student-square)
- kind: mallDiscount
- role: n/a
- final decision: rejected
- final reason: failed assert: University-diploma disclosed final grade is below the verifier minimum
- final rejection kind: verificationFailed
#### Request
- thread: <hex>
- from: mall-student-square
- to: STU-0005
- message: <hex>
- responds-to: <hex>
- summary: mallDiscount request from mall-student-square for STU-0005
- dto: {"kind":"mallDiscount","studentId":"STU-0005","verifierId":"mall-student-square","requestedRole":null,"disclosures":["universityName","finalGrade"],"enforceMinimumFinalGrade":true,"minimumFinalGrade":"91","verifierChallengeHashHex":"<hex>"}
- submissions:
  #### submission
  - thread: <hex>
  - from: STU-0005
  - to: mall-student-square
  - message: <hex>
  - responds-to: <hex>
  - summary: mallDiscount submission from STU-0005 for STU-0005
  - dto: {"kind":"mallDiscount","studentId":"STU-0005","disclosures":["universityName","finalGrade"],"issuerVerificationMethodRef":"<hex>:#issuer-key-1","verifierChallengeHashHex":"<hex>"}
- results:
  - sequence 1: rejected (verificationFailed)
    - reason: failed assert: University-diploma disclosed final grade is below the verifier minimum
    - response: <hex>

## Decision Summaries
- Job applications requested: 10
- Job applications accepted: 10
- Job applications rejected: 0
- Job applications verification failed: 0
- Job applications duplicate: 0
- Discounts requested: 5
- Discounts accepted: 3
- Discounts rejected: 2
- Discounts verification failed: 2
- Discounts duplicate: 0

### Job application by company
- Blue Ocean Analytics (company-blue-ocean-analytics): accepted=3, verificationFailed=0, duplicate=0
- Northwind Robotics (company-northwind-robotics): accepted=4, verificationFailed=0, duplicate=0
- Pioneer Systems (company-pioneer-systems): accepted=3, verificationFailed=0, duplicate=0

### Discount rejection reasons
- failed assert: University-diploma disclosed final grade is below the verifier minimum: 2
