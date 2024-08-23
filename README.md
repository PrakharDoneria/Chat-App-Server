## Endpoints

### User Management

#### POST `/signup`
Registers a new user with a username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- `201 Created`: User registered successfully.
- `409 Conflict`: User already exists.

#### POST `/login`
Logs in a user with a username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- `200 OK`: Login successful.
- `401 Unauthorized`: Invalid username or password.

### Messaging

#### POST `/send-message`
Sends a message to a specified group.

**Request Body:**
```json
{
  "username": "string",
  "groupName": "string",
  "message": "string"
}
```

**Response:**
- `200 OK`: Message sent successfully.

#### GET `/messages`
Retrieves messages from a specified group.

**Query Parameters:**
- `groupName`: The name of the group to retrieve messages from.

**Response:**
- `200 OK`: A list of messages.

### Data Management

#### DELETE `/delete`
Deletes all accounts or all messages based on the `type` parameter.

**Query Parameters:**
- `type`: 
  - `accounts` to delete all user accounts.
  - `msgs` to delete all messages.

**Response:**
- `200 OK`: Successful deletion of data.
- `400 Bad Request`: Invalid `type` parameter.



The server will start on port 8000.
