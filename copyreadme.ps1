# Copies README.md and LICENSE to all library directories
# Usage: .\copyreadme.ps1

$sourceReadme = '.\README.md'
$sourceLicense = '.\LICENSE'
$destinationDirectory = '.\libs'

Write-Host "Copying README.md and LICENSE to all libraries..." -ForegroundColor Cyan

$copiedCount = 0

# Get only direct subdirectories of libs (the library folders)
Get-ChildItem -Path $destinationDirectory -Directory | ForEach-Object {
    $libDir = $_.FullName
    $libName = $_.Name
    
    # Check if it's a valid library directory (has src folder or package.json)
    if ((Test-Path (Join-Path $libDir 'src')) -or (Test-Path (Join-Path $libDir 'package.json'))) {
        # Copy README.md
        $destReadme = Join-Path $libDir 'README.md'
        Copy-Item $sourceReadme -Destination $destReadme -Force
        Write-Host "  Copied README.md to $libName" -ForegroundColor Green
        
        # Copy LICENSE
        $destLicense = Join-Path $libDir 'LICENSE'
        Copy-Item $sourceLicense -Destination $destLicense -Force
        Write-Host "  Copied LICENSE to $libName" -ForegroundColor Green
        
        $script:copiedCount++
    }
}

Write-Host "`nCopied files to $copiedCount libraries" -ForegroundColor Cyan
