# Sets version in all library package.json files from root package.json
# Usage: .\setver.ps1
# Or with custom version: .\setver.ps1 -Version "1.0.0"

param(
    [string]$Version
)

$rootPackageJsonPath = '.\package.json'
$rootPackageJson = Get-Content $rootPackageJsonPath -Raw | ConvertFrom-Json

if ($Version) {
    $rootVersion = $Version
    Write-Host "Using provided version: $rootVersion" -ForegroundColor Cyan
} else {
    $rootVersion = $rootPackageJson.version
    Write-Host "Using root package.json version: $rootVersion" -ForegroundColor Cyan
}

Write-Host "`nUpdating library versions..." -ForegroundColor Yellow

$updatedCount = 0
Get-ChildItem -Path '.\libs' -Filter package.json -Recurse -Exclude 'node_modules' | ForEach-Object {
    $filePath = $_.FullName
    $relativePath = $filePath.Replace((Get-Location).Path + '\', '')
    
    # Skip if it's in node_modules (additional check)
    if ($filePath -like '*node_modules*') {
        return
    }
    
    try {
        node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('$($filePath.Replace('\','/'))', 'utf8')); pkg.version = '$rootVersion'; fs.writeFileSync('$($filePath.Replace('\','/'))', JSON.stringify(pkg, null, 2) + '\n');"
        Write-Host "  Updated: $relativePath -> $rootVersion" -ForegroundColor Green
        $script:updatedCount++
    } catch {
        Write-Host "  Failed: $relativePath - $_" -ForegroundColor Red
    }
}

Write-Host "`nUpdated $updatedCount package.json files to version $rootVersion" -ForegroundColor Cyan

# Also update peer dependencies that reference internal packages
Write-Host "`nUpdating peer dependencies..." -ForegroundColor Yellow

$internalPackages = @(
    '@adaskothebeast/http-params-processor-core'
)

Get-ChildItem -Path '.\libs' -Filter package.json -Recurse -Exclude 'node_modules' | ForEach-Object {
    $filePath = $_.FullName
    
    if ($filePath -like '*node_modules*') {
        return
    }
    
    $packageJson = Get-Content $filePath -Raw | ConvertFrom-Json
    $updated = $false
    
    if ($packageJson.peerDependencies) {
        foreach ($pkg in $internalPackages) {
            if ($packageJson.peerDependencies.PSObject.Properties.Name -contains $pkg) {
                $packageJson.peerDependencies.$pkg = "^$rootVersion"
                $updated = $true
            }
        }
    }
    
    if ($updated) {
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content $filePath -NoNewline
        # Add newline at end
        Add-Content $filePath ""
        $relativePath = $filePath.Replace((Get-Location).Path + '\', '')
        Write-Host "  Updated peer deps: $relativePath" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
