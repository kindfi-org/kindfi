Test Coverage for Auth Contract
Overview
Implement comprehensive test cases for the Auth Contract to ensure reliability and correctness.

Test Scenarios to Cover
Account Creation

Successful account creation with valid parameters
Error cases with invalid parameters
Authorization Checks

Valid authorization scenarios
Invalid signature verification
Challenge verification
Device management authorization
Device Management

Adding devices
Removing devices
Device limit checks
Recovery Address Management

Adding recovery address
Updating recovery address
Recovery process testing
Error Cases

Invalid parameters
Unauthorized access attempts
Edge cases in signature verification
References
Related to PR: add auth contract #120
Discussion: add auth contract #120 (comment)
Implementation Guidelines
Use proper test fixtures and mocks where necessary
Cover both success and failure scenarios
Include edge cases and boundary conditions
Follow Rust testing best practices
