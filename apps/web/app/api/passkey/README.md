# Usage

## API Endpoints

- **Generate Registration Options:**

  `POST /api/passkey/generate-registration-options`

  - Request Body: `{ "identifier": "user@example.com" }`
  - Response: WebAuthn registration options.

- **Verify Registration:**

  `POST /api/passkey/verify-registration`

  - Request Body: `{ "identifier": "user@example.com", "registrationResponse": {...} }`
  - Response: Verification result.

- **Generate Authentication Options:**

  `POST /api/passkey/generate-authentication-options`

  - Request Body: `{ "identifier": "user@example.com" }`
  - Response: WebAuthn authentication options.

- **Verify Authentication:**

  `POST /api/passkey/verify-authentication`

  - Request Body: `{ "identifier": "user@example.com", "authenticationResponse": {...} }`
  - Response: Verification result.

## Flow

### Registration Flow

+---------------------------+
| User Device |
+---------------------------+
|
| 1. Request Registration Options
v
+---------------------------+
| API: Generate Registration|
| Options |
+---------------------------+
|
| 2. Return WebAuthn Registration Options
v
+---------------------------+
| User Device |
+---------------------------+
|
| 3. Create Registration Response
v
+---------------------------+
| API: Verify Registration |
+---------------------------+
|
| 4. Return Verification Result
v
+---------------------------+
| User Device |
+---------------------------+

Summary:

1. **Request Registration Options**: The user device initiates the registration process by requesting options from the API.
2. **Return WebAuthn Registration Options**: The API responds with the necessary WebAuthn registration options.
3. **Create Registration Response**: The user device uses these options to create a registration response.
4. **Verify Registration**: The API verifies the registration response and returns the result to the user device.

### Authentication Flow

+---------------------------+
| User Device |
+---------------------------+
|
| 5. Request Authentication Options
v
+---------------------------+
| API: Generate Authentication |
| Options |
+---------------------------+
|
| 6. Return WebAuthn Authentication Options
v
+---------------------------+
| User Device |
+---------------------------+
|
| 7. Create Authentication Response
v
+---------------------------+
| API: Verify Authentication |
+---------------------------+
|
| 8. Return Verification Result
v
+---------------------------+
| User Device |
+---------------------------+

Summary:

1. **Request Authentication Options**: The user device requests authentication options from the API.
2. **Return WebAuthn Authentication Options**: The API provides the necessary WebAuthn authentication options.
3. **Create Authentication Response**: The user device creates an authentication response using the provided options.
4. **Verify Authentication**: The API verifies the authentication response and returns the result to the user device.
