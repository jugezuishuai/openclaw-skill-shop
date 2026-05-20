$env:ANTHROPIC_BASE_URL = "https://open.bigmodel.cn/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = "47f8dc4062a541f697c0f7d5b77cb285.ytNPInHfdJVZ9BOr"
$env:ANTHROPIC_MODEL = "glm-5"

# Change to project directory
Set-Location "D:\java\workspace\java\自主demo\auto-coding-agent-demo-main"

Write-Host "Using GLM-5 for automation..." -ForegroundColor Cyan
Write-Host ""

$runs = $args[0]
if (-not $runs) {
    Write-Host "Usage: .\run-glm-automation.ps1 <number_of_runs>"
    Write-Host "Example: .\run-glm-automation.ps1 10"
    exit 1
}

# Run the bash script via git bash or wsl
bash ./run-automation.sh $runs
