# Independent ZIP verification using .NET, with synthetic fixtures generated outside Git.
$ErrorActionPreference = 'Stop'
$result = node (Join-Path $PSScriptRoot 'check-r2.mjs') | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Prototype fixture tests failed' }
$archive = [System.IO.Compression.ZipFile]::OpenRead((Join-Path $result.temporaryFixtureDirectory 'evidence.zip'))
try {
    if ($archive.Entries.Count -ne 4) { throw 'Expected four ZIP entries' }
    $original = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Join-Path $result.temporaryFixtureDirectory 'sample.png')))
    $imageCount = 0
    foreach ($entry in $archive.Entries) {
        $stream = $entry.Open()
        try {
            if ($entry.Name.EndsWith('.png')) {
                $buffer = [System.IO.MemoryStream]::new()
                try {
                    $stream.CopyTo($buffer)
                    if ([Convert]::ToBase64String($buffer.ToArray()) -ne $original) { throw 'Image bytes differ' }
                    $imageCount++
                } finally { $buffer.Dispose() }
            } else {
                $reader = [System.IO.StreamReader]::new($stream)
                $rows = $reader.ReadToEnd() | ConvertFrom-Csv
                $total = ($rows | Measure-Object -Property amount_satang -Sum).Sum
                if ($rows.Count -ne 2 -or $total -ne 180000) { throw 'Expense count/total incorrect' }
            }
        } finally { $stream.Dispose() }
    }
    [ordered]@{ reader='System.IO.Compression.ZipFile independent ZIP reader'; result='PASS'; entries=4; image_files=$imageCount; original_image_bytes='MATCH'; expenses=2; total_satang=180000 } | ConvertTo-Json
} finally { $archive.Dispose() }
