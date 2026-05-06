# Tự động nạp biến môi trường cho Claude Code
$env:ANTHROPIC_AUTH_TOKEN="freecc"
$env:ANTHROPIC_BASE_URL="http://localhost:8082"
$env:CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1

# Mở một cửa sổ mới để chạy Proxy
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\free-claude-code'; free-claude-code"

# Chạy Claude Code ở cửa sổ hiện tại
npx @anthropic-ai/claude-code
