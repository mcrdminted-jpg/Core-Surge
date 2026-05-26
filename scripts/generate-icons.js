const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const root = path.resolve(__dirname, '..');
const appDir = path.join(root, 'assets', 'app');
const sourcePng = path.join(appDir, 'icon-source.png');

const exportedAppIcons = [
  { size: 120, output: path.join(appDir, 'icon-120.png') },
  { size: 152, output: path.join(appDir, 'icon-152.png') },
  { size: 167, output: path.join(appDir, 'icon-167.png') },
  { size: 180, output: path.join(appDir, 'icon-180.png') },
  { size: 192, output: path.join(appDir, 'icon-192.png') },
  { size: 512, output: path.join(appDir, 'icon-512.png') },
  { size: 1024, output: path.join(appDir, 'icon-1024.png') }
];

const androidIcons = [
  { size: 48, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher.png') },
  { size: 48, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher_round.png') },
  { size: 48, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher_foreground.png') },
  { size: 72, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher.png') },
  { size: 72, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher_round.png') },
  { size: 72, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher_foreground.png') },
  { size: 96, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher.png') },
  { size: 96, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher_round.png') },
  { size: 96, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher_foreground.png') },
  { size: 144, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher.png') },
  { size: 144, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher_round.png') },
  { size: 144, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher_foreground.png') },
  { size: 192, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png') },
  { size: 192, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher_round.png') },
  { size: 192, output: path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher_foreground.png') }
];

const iosIcons = [
  { size: 1024, output: path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png') }
];

function toPsPath(filePath) {
  return filePath.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

async function main() {
  await fs.access(sourcePng);

  const allOutputs = [...exportedAppIcons, ...androidIcons, ...iosIcons];
  for (const { output } of allOutputs) {
    await fs.mkdir(path.dirname(output), { recursive: true });
  }

  const tempPs1 = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'core-surge-icons-')), 'generate-icons.ps1');
  const psScript = `
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

function New-RoundedRectPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$sourcePath = '${toPsPath(sourcePng)}'
$items = @(
${allOutputs.map(({ size, output }) => `  @{ Size = ${size}; Output = '${toPsPath(output)}' }`).join("\n")}
)

$bgTop = [System.Drawing.Color]::FromArgb(9, 18, 34)
$bgBottom = [System.Drawing.Color]::FromArgb(3, 7, 17)
$borderColor = [System.Drawing.Color]::FromArgb(90, 76, 226, 255)

$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
  foreach ($item in $items) {
    $size = [int]$item.Size
    $outPath = [string]$item.Output

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $bitmap.SetResolution(144, 144)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

      $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        ([System.Drawing.Rectangle]::new(0, 0, $size, $size)),
        $bgTop,
        $bgBottom,
        90
      )
      $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)
      $bgBrush.Dispose()

      $clipPath = New-RoundedRectPath 0 0 $size $size ([math]::Round($size * 0.155))
      $graphics.SetClip($clipPath)
      $graphics.DrawImage($source, 0, 0, $size, $size)
      $graphics.ResetClip()

      $borderPath = New-RoundedRectPath ([math]::Round($size * 0.016)) ([math]::Round($size * 0.016)) ([math]::Round($size * 0.968)) ([math]::Round($size * 0.968)) ([math]::Round($size * 0.15))
      $borderPen = New-Object System.Drawing.Pen($borderColor, [math]::Max(2, [math]::Round($size * 0.008)))
      $graphics.DrawPath($borderPen, $borderPath)
      $borderPen.Dispose()
      $borderPath.Dispose()
      $clipPath.Dispose()

      $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
} finally {
  $source.Dispose()
}
`;

  await fs.writeFile(tempPs1, psScript, 'utf8');
  try {
    await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempPs1], {
      cwd: root,
      timeout: 120000
    });
  } finally {
    await fs.rm(path.dirname(tempPs1), { recursive: true, force: true });
  }

  console.log(`Generated icon set from ${path.relative(root, sourcePng)}`);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
