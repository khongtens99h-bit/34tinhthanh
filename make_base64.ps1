$dir = (Get-ChildItem -Path "d:\Nhien\34tinhthanh\assets" -Recurse -Directory | Where-Object { $_.FullName -like "*1x" }).FullName
$files = Get-ChildItem -Path $dir -Filter "*.png"
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("const DESIGN_ASSETS_BASE64 = {")
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $b64 = [System.Convert]::ToBase64String($bytes)
    $name = $f.Name
    [void]$sb.AppendLine("  '$name': 'data:image/png;base64,$b64',")
}
[void]$sb.AppendLine("};")
[System.IO.File]::WriteAllText("d:\Nhien\34tinhthanh\assets_base64.js", $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated assets_base64.js with $($files.Count) items."
