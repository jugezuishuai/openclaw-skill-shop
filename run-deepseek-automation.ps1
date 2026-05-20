$env:ANTHROPIC_BASE_URL = "https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = "sk-42cc5ec8df2c4f56a354a8ec0831bd52"
$env:ANTHROPIC_MODEL = "deepseek-v4-pro"

# Change to project directory
Set-Location "D:\java\workspace\java\自主demo\auto-coding-agent-demo-main"

Write-Host "Using DeepSeek V4-Pro for automation..." -ForegroundColor Cyan
Write-Host ""

$runs = $args[0]
if (-not $runs) {
    Write-Host "Usage: .\run-deepseek-automation.ps1 <number_of_runs>"
    Write-Host "Example: .\run-deepseek-automation.ps1 10"
    exit 1
}

# Run the bash script via git bash or wsl
bash ./run-automation.sh $runs
