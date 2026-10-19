Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap 2000,1700
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#F6F8F7'))
function Brush($hex) { return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex)) }
$ink = Brush '#17251F'
$muted = Brush '#52685D'
$white = Brush '#FFFFFF'
$green = Brush '#176B4D'
$gold = Brush '#986511'
$blue = Brush '#285F91'
$title = [System.Drawing.Font]::new('Segoe UI',42,[System.Drawing.FontStyle]::Bold)
$section = [System.Drawing.Font]::new('Segoe UI',27,[System.Drawing.FontStyle]::Bold)
$heading = [System.Drawing.Font]::new('Segoe UI',23,[System.Drawing.FontStyle]::Bold)
$body = [System.Drawing.Font]::new('Segoe UI',19)
$small = [System.Drawing.Font]::new('Segoe UI',16)
function Text($text,$x,$y,$w,$h,$font,$brush) {
  $g.DrawString($text,$font,$brush,[System.Drawing.RectangleF]::new($x,$y,$w,$h))
}
function Arrow($x1,$y1,$x2,$y2) {
  $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#7D9488'),4)
  $pen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(5,6)
  $g.DrawLine($pen,$x1,$y1,$x2,$y2)
  $pen.Dispose()
}
function Card($n,$actor,$name,$detail,$endpoint,$x,$y,$accent) {
  $g.FillRectangle($white,$x,$y,440,245)
  $g.FillRectangle($accent,$x,$y,440,7)
  Text "$n  /  $actor" ($x+22) ($y+20) 400 36 $small $accent
  Text $name ($x+22) ($y+63) 400 45 $heading $ink
  Text $detail ($x+22) ($y+114) 400 72 $body $muted
  Text $endpoint ($x+22) ($y+199) 410 38 $small $muted
}
Text 'SurplusLink AI' 65 35 1800 75 $title $ink
Text 'End-to-end trade + frontend-to-backend handoff' 68 119 1800 48 $section $muted
Text '01   USER JOURNEY' 68 199 1700 46 $section $green
Card '1' 'SELLER' 'Publish surplus' "Manual form or AI draft;`nreview and save inventory." 'POST /lots' 65 265 $gold
Card '2' 'BUYER' 'Discover stock' "Browse (skip step 3),`nor parse a sourcing need." 'GET /lots  |  POST /ai/parse-requirement' 540 265 $green
Card '3' 'BUYER' 'Review + match' "Confirm extracted fields;`nsave need and rank stock." 'POST /requirements  ->  GET .../matches' 1015 265 $green
Card '4' 'BUYER' 'Submit offer' "Choose quantity and price;`npreview the 2% buyer fee." 'POST /offers  ->  PENDING' 1490 265 $green
Arrow 507 383 535 383
Arrow 982 383 1010 383
Arrow 1457 383 1485 383
Arrow 1710 515 1710 552
Card '8' 'REPORTING' 'Complete + report' "Confirm handover; finalize`nstock and aggregate fees." 'Handover endpoint + dashboard' 65 560 $blue
Card '7' 'BUYER' 'Pay + unlock pickup' "Demo payment succeeds;`nprivate pickup details unlock." 'POST /deals/{id}/simulate-payment' 540 560 $green
Card '6' 'SYSTEM' 'Create deal' "Reserve accepted quantity;`none deal per accepted offer." 'State: AWAITING_PAYMENT' 1015 560 $blue
Card '5' 'NEGOTIATION' 'Accept or counter' "Seller accepts / rejects / counters;`nbuyer can accept counter." 'POST /offers/{id}/respond' 1490 560 $gold
Arrow 1485 682 1457 682
Arrow 1010 682 982 682
Arrow 535 682 507 682
Text 'Trade state:  AWAITING_PAYMENT  ->  PAID_AWAITING_PICKUP  ->  COMPLETED' 68 842 1850 46 $heading $ink
Text '02   HOW THE FRONTEND GETS ITS DATA' 68 939 1800 48 $section $green
$g.FillRectangle($white,65,1005,1865,105)
Text 'React pages + forms' 89 1022 530 42 $heading $ink
Text 'React Router: page navigation' 89 1069 530 35 $small $muted
Text 'TanStack Query' 705 1022 530 42 $heading $ink
Text 'Load, cache, mutate, refetch' 705 1069 530 35 $small $muted
Text 'Zustand demo identity' 1320 1022 580 42 $heading $ink
Text 'Selected organization and role' 1320 1069 580 35 $small $muted
Arrow 995 1116 995 1151
$g.FillRectangle($green,65,1160,1865,83)
Text 'Shared api interface: pages call the same methods in both modes' 100 1178 1780 52 $heading $white
Arrow 570 1252 570 1286
Arrow 1450 1252 1450 1286
$g.FillRectangle($white,65,1295,902,162)
$g.FillRectangle($white,997,1295,933,162)
Text 'CURRENT: mock provider' 89 1310 850 44 $heading $gold
Text "Browser TypeScript -> localStorage`nRule-based AI parser + simulated payment" 89 1367 850 81 $body $muted
Text 'INTEGRATION: HTTP provider' 1021 1310 880 44 $heading $blue
Text "Axios -> your backend -> database`nServer owns permissions, stock, fees and state" 1021 1367 880 81 $body $muted
Text 'Switch: VITE_DATA_PROVIDER=http  +  VITE_API_BASE_URL  +  restart Vite' 68 1492 1850 42 $heading $ink
Text "Integration still needs identity transport. Demo role selection is not authentication.`nPayment is simulated. API JSON shapes and implementation notes: FRONTEND-BACKEND-GUIDE.md" 68 1562 1850 94 $body $muted
$outputPath = Join-Path $PSScriptRoot 'surpluslink-end-to-end.png'
$bitmap.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bitmap.Dispose()
Write-Output $outputPath
