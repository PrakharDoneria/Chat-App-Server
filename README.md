# Group Chat Application

This is a simple group chat application built with Deno and Deno KV storage. The application allows users to sign up, log in, and send and retrieve messages in predefined groups.

## Prerequisites

- [Deno](https://deno.land/)
- Create a `.env` file in the root directory with your JWT secret key:
  ```
  JWT_SECRET_KEY=your-very-secure-secret-key
  ```

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/PrakharDoneria/Chat-App-Server
cd Chat-App-Server
```

Install the necessary dependencies (if any).

## Running the Application

You can start the server using Deno's task runner:

```bash
deno task start
```

The server will start on `http://localhost:8000`.

## Endpoints

### 1. User Signup

**Endpoint:**

- `POST /signup`

**Request Body:**

```json
{
  "username": "ada",
  "password": "securepassword"
}
```

**Headers:**

- `Content-Type: application/json`

**Sample cURL Request:**

```bash
curl -X POST http://localhost:8000/signup \
-H "Content-Type: application/json" \
-d '{
  "username": "ada",
  "password": "securepassword"
}'
```

**Response (Success):**

```json
{
  "message": "User registered successfully"
}
```

**Response (User Already Exists):**

```json
{
  "error": "User already exists"
}
```

### 2. User Login

**Endpoint:**

- `POST /login`

**Request Body:**

```json
{
  "username": "ada",
  "password": "securepassword"
}
```

**Headers:**

- `Content-Type: application/json`

**Sample cURL Request:**

```bash
curl -X POST http://localhost:8000/login \
-H "Content-Type: application/json" \
-d '{
  "username": "ada",
  "password": "securepassword"
}'
```

**Response (Success):**

```json
{
  "message": "Login successful",
  "token": "<jwt_token_here>"
}
```

**Response (Invalid Credentials):**

```json
{
  "error": "Invalid username or password"
}
```

### 3. Send Message to Group

**Endpoint:**

- `POST /send-message`

**Request Body:**

```json
{
  "groupName": "developers",
  "message": "Hello, developers!"
}
```

**Headers:**

- `Authorization: Bearer <jwt_token_here>`
- `Content-Type: application/json`

**Sample cURL Request:**

```bash
curl -X POST http://localhost:8000/send-message \
-H "Authorization: Bearer <jwt_token_here>" \
-H "Content-Type: application/json" \
-d '{
  "groupName": "developers",
  "message": "Hello, developers!"
}'
```

**Response (Success):**

```json
{
  "message": "Message sent successfully"
}
```

**Response (Invalid or Missing Token):**

```json
{
  "error": "Invalid or missing token"
}
```

### 4. Get Messages from Group

**Endpoint:**

- `GET /messages?groupName=<groupName>`

**Headers:**

- `Authorization: Bearer <jwt_token_here>`

**Sample cURL Request:**

```bash
curl -X GET http://localhost:8000/messages?groupName=developers \
-H "Authorization: Bearer <jwt_token_here>"
```

**Response (Success):**

```json
[
  {
    "from": "ada",
    "message": "Hello, developers!",
    "timestamp": "2024-08-23T15:30:00Z"
  },
  {
    "from": "charles",
    "message": "Hi Ada!",
    "timestamp": "2024-08-23T15:31:00Z"
  }
]
```

**Response (Invalid or Missing Token):**

```json
{
  "error": "Invalid or missing token"
}
```

## Environment Variables

Ensure you have a `.env` file with the following content:

```
JWT_SECRET_KEY=your-very-secure-secret-key
```
