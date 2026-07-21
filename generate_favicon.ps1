# Genera favicon.ico multi-resolucion (16/32/48/64) con el estilo de marca de JDF Sistemas
# (fondo oscuro + "JDF" en rojo, itálica, como el logo del sitio).
# Cada tamaño se guarda como PNG embebido dentro del .ico (soportado por todos los navegadores modernos).

Add-Type -AssemblyName System.Drawing

$darkColor = [System.Drawing.Color]::FromArgb(8, 13, 26)     # --dark
$redColor  = [System.Drawing.Color]::FromArgb(198, 0, 0)      # --red

function New-FaviconPng {
    param([int]$size)

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Fondo redondeado oscuro
    $g.Clear([System.Drawing.Color]::Transparent)
    $radius = [Math]::Max(2, [int]($size * 0.18))
    $rect = New-Object System.Drawing.Rectangle 0, 0, ($size - 1), ($size - 1)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush $darkColor
    $g.FillPath($brush, $path)

    # Texto "J" en rojo, itálica, centrado (legible incluso en 16px)
    $fontSize = [float]($size * 0.68)
    $fontStyle = [System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic
    $font = New-Object System.Drawing.Font("Arial", $fontSize, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
    $textBrush = New-Object System.Drawing.SolidBrush $redColor
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("J", $font, $textBrush, (New-Object System.Drawing.RectangleF 0, ($size * -0.03), $size, $size), $sf)

    $g.Dispose()
    return $bmp
}

$sizes = @(16, 32, 48, 64)
$pngBytesList = @()

foreach ($s in $sizes) {
    $bmp = New-FaviconPng -size $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesList += ,$ms.ToArray()
    $bmp.Dispose()
    $ms.Dispose()
}

# Ensamblar el archivo .ico manualmente (ICONDIR + ICONDIRENTRY[] + datos PNG)
$outPath = Join-Path $PSScriptRoot "favicon.ico"
$fs = [System.IO.File]::Open($outPath, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter $fs

# ICONDIR: reserved(2)=0, type(2)=1, count(2)
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$sizes.Count)

$headerSize = 6 + (16 * $sizes.Count)
$offset = $headerSize

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $bytes = $pngBytesList[$i]
    $wByte = if ($s -ge 256) { 0 } else { $s }
    $hByte = if ($s -ge 256) { 0 } else { $s }

    $bw.Write([Byte]$wByte)      # width
    $bw.Write([Byte]$hByte)      # height
    $bw.Write([Byte]0)           # color palette
    $bw.Write([Byte]0)           # reserved
    $bw.Write([UInt16]1)         # color planes
    $bw.Write([UInt16]32)        # bits per pixel
    $bw.Write([UInt32]$bytes.Length)  # size of image data
    $bw.Write([UInt32]$offset)        # offset of image data
    $offset += $bytes.Length
}

foreach ($bytes in $pngBytesList) {
    $bw.Write($bytes)
}

$bw.Flush()
$bw.Close()
$fs.Close()

Write-Host "favicon.ico creado correctamente en $outPath"
