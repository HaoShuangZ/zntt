# Inject iPad v2 CSS into existing ipad_*.html (in-place, UTF-8)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$ipadRoot = Join-Path (Join-Path $root "pages") ("iPad" + [char]0x7AEF)

function Get-AssetPrefix([string]$fullPath) {
  $rel = $fullPath.Substring($ipadRoot.Length).TrimStart('\')
  $depth = ($rel -split '\\').Count + 1
  return ('../' * $depth) + 'assets/'
}

function Build-Block([string]$prefix) {
  return @(
    "<link rel=`"stylesheet`" href=`"${prefix}ipad-tokens.css`">"
    "<link rel=`"stylesheet`" href=`"${prefix}ipad-frame.css`">"
    "<link rel=`"stylesheet`" href=`"${prefix}ipad-layout.css`">"
    "<link rel=`"stylesheet`" href=`"${prefix}ipad-visual.css`">"
    "<link rel=`"stylesheet`" href=`"${prefix}ipad-embed.css`">"
    "<script src=`"${prefix}ipad-adapt.js`" defer></script>"
  ) -join "`n"
}

function Patch-Content([string]$content, [string]$prefix) {
  if ($content -match 'ipad-tokens\.css') {
    return $content
  }

  $block = Build-Block $prefix

  $content = [regex]::Replace(
    $content,
    '(?s)\s*<link rel="stylesheet" href="[^"]*ipad-frame\.css">\s*<link rel="stylesheet" href="[^"]*ipad-layout\.css">\s*(?:<link rel="stylesheet" href="[^"]*ipad-visual\.css">\s*)?<link rel="stylesheet" href="[^"]*ipad-embed\.css">\s*<script src="[^"]*ipad-adapt\.js"[^>]*>\s*</script>\s*',
    "`n"
  )

  if ($content -match '(<link rel="stylesheet" href="[^"]*app-inspect-layout\.css">)') {
    $content = [regex]::Replace($content, '(<link rel="stylesheet" href="[^"]*app-inspect-layout\.css">)', "`${1}`n$block", 1)
  } elseif ($content -match '(<link rel="stylesheet" href="[^"]*app-frame\.css">)') {
    $content = [regex]::Replace($content, '(<link rel="stylesheet" href="[^"]*app-frame\.css">)', "`${1}`n$block", 1)
  } else {
    $content = $content -replace '</head>', "$block`n</head>"
  }

  if ($content -match '<body([^>]*)\sclass="([^"]*)"') {
    if ($Matches[2] -notmatch 'ipad-adapt') {
      $nc = $Matches[2].Trim() + ' ipad-adapt'
      $content = [regex]::Replace($content, 'class="[^"]*"', "class=`"$nc`"", 1)
    }
  } elseif ($content -match '<body([^>]*)>') {
    $content = $content.Replace('<body' + $Matches[1] + '>', '<body' + $Matches[1] + ' class="ipad-adapt">')
  }

  return ($content -replace 'v1\.0 landscape', 'v2.0 landscape')
}

$n = 0
Get-ChildItem -Path $ipadRoot -Recurse -Filter 'ipad_*.html' | ForEach-Object {
  $prefix = Get-AssetPrefix $_.FullName
  $old = [IO.File]::ReadAllText($_.FullName, [Text.UTF8Encoding]::new($false))
  $new = Patch-Content $old $prefix
  if ($new -ne $old) {
    [IO.File]::WriteAllText($_.FullName, $new, [Text.UTF8Encoding]::new($false))
    $n++
  }
}
Write-Host "Patched $n / $((Get-ChildItem $ipadRoot -Recurse -Filter ipad_*.html).Count) files"
