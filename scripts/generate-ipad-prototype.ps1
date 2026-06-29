# Generate iPad prototypes from APP pages (ipad_*.html)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot
$pagesRoot = Join-Path $root "pages"
$appRoot = (Get-ChildItem -Path $pagesRoot -Directory | Where-Object { $_.Name -like "APP*" } | Select-Object -First 1).FullName
$ipadName = "iPad" + [char]0x7AEF
$ipadRoot = Join-Path $pagesRoot $ipadName

if (-not $appRoot) { throw "APP folder not found under pages" }
if (Test-Path $ipadRoot) { Remove-Item $ipadRoot -Recurse -Force }
New-Item -ItemType Directory -Path $ipadRoot -Force | Out-Null

$appSeg = "APP" + [char]0x7AEF
$ipadSeg = "iPad" + [char]0x7AEF

function Get-AssetPrefix([string]$fullPath) {
  $rel = $fullPath.Substring($ipadRoot.Length).TrimStart('\')
  $segCount = ($rel -split '\\').Count
  $depth = $segCount + 1
  return ('../' * $depth) + 'assets/'
}

function Inject-IpadAssets([string]$content, [string]$assetPrefix) {
  $inject = @(
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-tokens.css`">"
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-frame.css`">"
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-layout.css`">"
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-visual.css`">"
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-inspect-layout.css`">"
    "<link rel=`"stylesheet`" href=`"${assetPrefix}ipad-embed.css`">"
    "<script src=`"${assetPrefix}ipad-adapt.js`" defer></script>"
  ) -join "`n"
  if ($content -notmatch 'ipad-tokens\.css') {
    if ($content -match '(<link rel="stylesheet" href="[^"]*app-inspect-layout\.css">)') {
      $content = $content -replace '(<link rel="stylesheet" href="[^"]*app-inspect-layout\.css">)', "`$1`n$inject"
    } elseif ($content -match '(<link rel="stylesheet" href="[^"]*app-embed\.css">)') {
      $content = $content -replace '(<link rel="stylesheet" href="[^"]*app-embed\.css">)', "`$1`n$inject"
    } elseif ($content -match '(<link rel="stylesheet" href="[^"]*app-frame\.css">)') {
      $content = $content -replace '(<link rel="stylesheet" href="[^"]*app-frame\.css">)', "`$1`n$inject"
    } else {
      $content = $content -replace '</head>', "$inject`n</head>"
    }
  }
  return $content
}

function Set-BodyClass([string]$content) {
  if ($content -match '<body(\s+class=")([^"]*)(")') {
    if ($Matches[2] -notmatch 'ipad-adapt') {
      $newClass = ($Matches[2].Trim() + ' ipad-adapt').Trim()
      $content = [regex]::Replace($content, '<body(\s+class=")([^"]*)(")', "<body`$1$newClass`$3", 1)
    }
  } elseif ($content -match '<body([^>]*)>') {
    $attrs = $Matches[1]
    $content = $content.Replace('<body' + $attrs + '>', '<body' + $attrs + ' class="ipad-adapt">')
  }
  return $content
}

function Rewrite-Paths([string]$content) {
  $content = $content.Replace("pages/$appSeg", "pages/$ipadSeg")
  $content = $content -replace 'app-index\.html', 'ipad-index.html'
  $content = [regex]::Replace($content, 'app_([a-z0-9_]+\.html)', 'ipad_$1')
  $content = $content.Replace("'app_task_inspect_home'", "'ipad_task_inspect_home'")
  $content = $content.Replace('"app_task_inspect_home"', '"ipad_task_inspect_home"')
  return $content
}

function Mark-TabBar([string]$content) {
  return [regex]::Replace(
    $content,
    '(<div)([^>]*style="[^"]*position:fixed[^"]*bottom:0[^"]*")',
    '${1} id="ipadGlobalTabBar" class="ipad-global-tabbar"${2}'
  )
}

$files = Get-ChildItem -Path $appRoot -Recurse -Filter "app_*.html"
$count = 0
foreach ($f in $files) {
  $relDir = $f.DirectoryName.Substring($appRoot.Length).TrimStart('\')
  $destDir = if ($relDir) { Join-Path $ipadRoot $relDir } else { $ipadRoot }
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
  $destName = $f.Name -replace '^app_', 'ipad_'
  $destPath = Join-Path $destDir $destName

  $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
  $content = Rewrite-Paths $content
  $content = Set-BodyClass $content
  $content = Mark-TabBar $content
  $prefix = Get-AssetPrefix $destPath
  $content = Inject-IpadAssets $content $prefix

  if ($content -notmatch '<!-- iPad-') {
    $slug = ($destName -replace '\.html$', '' -replace '^ipad_', '').ToUpper()
    $content = $content -replace '<!DOCTYPE html>', "<!DOCTYPE html>`n<!-- iPad-$slug v1.0 landscape -->"
  }

  [System.IO.File]::WriteAllText($destPath, $content, [System.Text.UTF8Encoding]::new($false))
  $count++
}

Write-Host "Generated $count iPad pages -> $ipadRoot"
