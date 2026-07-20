# University Protocol Transcript Export

- schema id: midnight-university-protocol-export
- schema version: midnight-university-protocol-export.v2
- compatible reader floor: midnight-university-protocol-export.v2
- compatible reader ceiling: midnight-university-protocol-export.v2
- current privacy profile: production-commitment-v2
- production privacy profile: production-commitment-v2
- students: 10
- companies: 3
- discount applicants: 5
- issuance batches: 2
- batch size: 5
- total transcript entries: 65
- total threads: 25

## Rejection Breakdown

- job applications accepted: 10
- job applications verification failed: 0
- job applications duplicate: 0
- discounts accepted: 3
- discounts verification failed: 2
- discounts duplicate: 0

## Company Breakdown

- Blue Ocean Analytics (company-blue-ocean-analytics): accepted=3, verificationFailed=0, duplicate=0
- Northwind Robotics (company-northwind-robotics): accepted=4, verificationFailed=0, duplicate=0
- Pioneer Systems (company-pioneer-systems): accepted=3, verificationFailed=0, duplicate=0

## Discount Rejection Reasons

- failed assert: University-diploma production final grade predicate is below the verifier minimum: 2

## Privacy Profile

- current claim commitment model: salted-per-field-persistent-commit
- production public claims: universityName, awardName, graduationYear
- production committed/private candidates: diplomaId, studentId, graduateName, facultyName, honorsCode, graduationMonth, finalGrade, creditsEarned
- production commitment fields: diplomaIdCommitment, studentIdCommitment, graduateNameCommitment, facultyNameCommitment, honorsCodeCommitment, graduationMonthCommitment, finalGradeCommitment, creditsEarnedCommitment
- predicate-only fields: finalGrade, creditsEarned
- opening policy: Production issuance must use high-entropy field-domain-separated openings; deterministic fixture openings are only for tests.
- statement: The production profile keeps routing facts public and moves stable identifiers plus sensitive academic facts into claim commitments.

## Issuance Threads

### Ada Avery 0001 (STU-0001)
- phase: issuance
- thread id: <hex>
- student: Ada Avery 0001 (STU-0001)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Ben Avery 0002 (STU-0002)
- phase: issuance
- thread id: <hex>
- student: Ben Avery 0002 (STU-0002)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Cara Avery 0003 (STU-0003)
- phase: issuance
- thread id: <hex>
- student: Cara Avery 0003 (STU-0003)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Dion Avery 0004 (STU-0004)
- phase: issuance
- thread id: <hex>
- student: Dion Avery 0004 (STU-0004)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Ella Avery 0005 (STU-0005)
- phase: issuance
- thread id: <hex>
- student: Ella Avery 0005 (STU-0005)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Finn Avery 0006 (STU-0006)
- phase: issuance
- thread id: <hex>
- student: Finn Avery 0006 (STU-0006)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Gia Avery 0007 (STU-0007)
- phase: issuance
- thread id: <hex>
- student: Gia Avery 0007 (STU-0007)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Hugo Avery 0008 (STU-0008)
- phase: issuance
- thread id: <hex>
- student: Hugo Avery 0008 (STU-0008)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Iris Avery 0009 (STU-0009)
- phase: issuance
- thread id: <hex>
- student: Iris Avery 0009 (STU-0009)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

### Jude Avery 0010 (STU-0010)
- phase: issuance
- thread id: <hex>
- student: Jude Avery 0010 (STU-0010)
- message count: 2
- accepted results: 0
- rejected results: 0
- rejection kinds: none
- message types: issuance:request, issuance:result

## Job Application Threads

### Ada Avery 0001 (STU-0001)
- phase: jobApplications
- thread id: <hex>
- student: Ada Avery 0001 (STU-0001)
- verifier: Northwind Robotics (company-northwind-robotics)
- requested role: junior-platform-engineer
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Ben Avery 0002 (STU-0002)
- phase: jobApplications
- thread id: <hex>
- student: Ben Avery 0002 (STU-0002)
- verifier: Blue Ocean Analytics (company-blue-ocean-analytics)
- requested role: data-analyst-trainee
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Cara Avery 0003 (STU-0003)
- phase: jobApplications
- thread id: <hex>
- student: Cara Avery 0003 (STU-0003)
- verifier: Pioneer Systems (company-pioneer-systems)
- requested role: robotics-software-intern
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Dion Avery 0004 (STU-0004)
- phase: jobApplications
- thread id: <hex>
- student: Dion Avery 0004 (STU-0004)
- verifier: Northwind Robotics (company-northwind-robotics)
- requested role: business-operations-analyst
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Ella Avery 0005 (STU-0005)
- phase: jobApplications
- thread id: <hex>
- student: Ella Avery 0005 (STU-0005)
- verifier: Blue Ocean Analytics (company-blue-ocean-analytics)
- requested role: junior-platform-engineer
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Finn Avery 0006 (STU-0006)
- phase: jobApplications
- thread id: <hex>
- student: Finn Avery 0006 (STU-0006)
- verifier: Pioneer Systems (company-pioneer-systems)
- requested role: data-analyst-trainee
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Gia Avery 0007 (STU-0007)
- phase: jobApplications
- thread id: <hex>
- student: Gia Avery 0007 (STU-0007)
- verifier: Northwind Robotics (company-northwind-robotics)
- requested role: robotics-software-intern
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Hugo Avery 0008 (STU-0008)
- phase: jobApplications
- thread id: <hex>
- student: Hugo Avery 0008 (STU-0008)
- verifier: Blue Ocean Analytics (company-blue-ocean-analytics)
- requested role: business-operations-analyst
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Iris Avery 0009 (STU-0009)
- phase: jobApplications
- thread id: <hex>
- student: Iris Avery 0009 (STU-0009)
- verifier: Pioneer Systems (company-pioneer-systems)
- requested role: junior-platform-engineer
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Jude Avery 0010 (STU-0010)
- phase: jobApplications
- thread id: <hex>
- student: Jude Avery 0010 (STU-0010)
- verifier: Northwind Robotics (company-northwind-robotics)
- requested role: data-analyst-trainee
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

## Discount Threads

### Ada Avery 0001 (STU-0001)
- phase: discounts
- thread id: <hex>
- student: Ada Avery 0001 (STU-0001)
- verifier: Student Square Mall (mall-student-square)
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Ben Avery 0002 (STU-0002)
- phase: discounts
- thread id: <hex>
- student: Ben Avery 0002 (STU-0002)
- verifier: Student Square Mall (mall-student-square)
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Cara Avery 0003 (STU-0003)
- phase: discounts
- thread id: <hex>
- student: Cara Avery 0003 (STU-0003)
- verifier: Student Square Mall (mall-student-square)
- message count: 3
- accepted results: 1
- rejected results: 0
- rejection kinds: none
- message types: presentation:request, presentation:submission, presentation:result

### Dion Avery 0004 (STU-0004)
- phase: discounts
- thread id: <hex>
- student: Dion Avery 0004 (STU-0004)
- verifier: Student Square Mall (mall-student-square)
- message count: 3
- accepted results: 0
- rejected results: 1
- rejection kinds: verificationFailed
- message types: presentation:request, presentation:submission, presentation:result

### Ella Avery 0005 (STU-0005)
- phase: discounts
- thread id: <hex>
- student: Ella Avery 0005 (STU-0005)
- verifier: Student Square Mall (mall-student-square)
- message count: 3
- accepted results: 0
- rejected results: 1
- rejection kinds: verificationFailed
- message types: presentation:request, presentation:submission, presentation:result

