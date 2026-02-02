# IndiChess Frontend

React frontend application for IndiChess chess platform.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_ENDPOINT=ws://localhost:8080/ws-indichess
```

## Tech Stack

- React 19
- Vite 6
- Tailwind CSS 4
- React Router DOM 7
- SockJS & StompJS for WebSocket
