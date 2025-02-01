## Usage

### API Endpoints

- **Generate Registration Options:**

  `POST /api/generate-registration-options`

  - Request Body: `{ "identifier": "user@example.com" }`
  - Response: WebAuthn registration options.

- **Verify Registration:**

  `POST /api/verify-registration`

  - Request Body: `{ "identifier": "user@example.com", "registrationResponse": {...} }`
  - Response: Verification result.

- **Generate Authentication Options:**

  `POST /api/generate-authentication-options`

  - Request Body: `{ "identifier": "user@example.com" }`
  - Response: WebAuthn authentication options.

- **Verify Authentication:**

  `POST /api/verify-authentication`

  - Request Body: `{ "identifier": "user@example.com", "authenticationResponse": {...} }`
  - Response: Verification result.
