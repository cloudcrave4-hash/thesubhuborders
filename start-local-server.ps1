Set-Location -LiteralPath $PSScriptRoot
node server.js *> "$PSScriptRoot\server.local.log"
