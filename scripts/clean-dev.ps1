# Script para limpar cache do Next.js
Write-Host "🧹 Limpando cache do Next.js..."

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Pasta .next removida"
}

# Matar processos Node na porta 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "✅ Processo Node na porta 3000 encerrado"
}

Write-Host "🚀 Pronto para iniciar! Run: npm run dev"
