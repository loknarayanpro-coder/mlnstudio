Add-Type -AssemblyName System.Drawing
$file = "c:\Users\lok m\Downloads\ai-digital-wardrobe-starter\ai-digital-wardrobe\public\brand\mln-studio-logo.png"
$dest = "c:\Users\lok m\Downloads\ai-digital-wardrobe-starter\ai-digital-wardrobe\public\brand\mln-studio-black.png"

$src = [System.Drawing.Image]::FromFile($file)
$bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height)

for ($x = 0; $x -lt $src.Width; $x++) {
    for ($y = 0; $y -lt $src.Height; $y++) {
        $p = $src.GetPixel($x, $y)
        if ($p.R -gt 25 -or $p.G -gt 25 -or $p.B -gt 25) {
            $lum = [int](0.299 * $p.R + 0.587 * $p.G + 0.114 * $p.B)
            $inv = [int](255 - $lum)
            $alpha = [int][Math]::Min(255, [Math]::Max(0, ($lum * 1.5)))
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $inv, $inv, $inv))
        } else {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$src.Dispose()
$bmp.Dispose()
Write-Host "Done converting logo to transparent black"
