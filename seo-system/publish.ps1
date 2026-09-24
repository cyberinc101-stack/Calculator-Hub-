$root=(Resolve-Path "$PSScriptRoot\..").Path; Set-Location $root; $u=New-Object Text.UTF8Encoding $false; $CT="$root\calculator-types"
$G=@{finance='compound-interest credit-card-payoff debt-snowball-avalanche bankruptcy-calculator retirement savings-goal roi profit-margin markup break-even budget-planner net-worth currency-converter gst-vat payroll-tax employee-cost invoice saas-mrr-arr tip bill-split'
health='bmi calorie calories-burned body-fat ideal-weight macro blood-pressure heart-rate-zones one-rep-max running-pace vo2-max sleep water-intake bac-calculator ovulation pregnancy-due-date'
'math-science'='percentage fraction ratio gcf-lcm prime-number-checker quadratic-equation-solver scientific-notation half-life ohms-law density wavelength-frequency area volume'
everyday='age date-difference time-zone-converter grade-gpa paint-coverage concrete fuel-cost electricity-cost distance-time speed-distance-time'}
$cat=@{}; $d=ConvertFrom-Json ([IO.File]::ReadAllText("$root\seo-system\data\conversions.json")); foreach($q in $d){$cat["convert-$($q.from)-to-$($q.to)"]=($q.category.ToLower() -replace ' ','-')}
function Dest($s){ if($s -eq 'convert-index'){return 'converters/index.html'}; if($s -eq 'unit-converter'){return 'converters/unit-converter.html'}
 if($cat[$s]){return "converters/$($cat[$s])/$s.html"}; if($s -like 'convert-*'){return "converters/other/$s.html"}
 if($s -match '^(loan|mortgage|car-payment|lease|interest-rate|vehicle-loan)|-loan-calculator$'){return "loans/$s.html"}
 foreach($k in $G.Keys){ if(($G[$k] -split ' ') -contains $s){return "$k/$s.html"} } }
$MAP=@{}; gci $CT -Recurse -Filter *.html | ? { $_.DirectoryName -ne $CT -and $_.FullName -notlike '*\longtail\*' -and $_.BaseName -ne 'index' } | % { $MAP[$_.BaseName]=$_.FullName.Substring($CT.Length+1).Replace('\','/') }
$mv=@{}; $warn=@(); foreach($f in (gci $CT -Filter *.html)){ $p=Dest $f.BaseName; if($p){$MAP[$f.BaseName]=$p; $mv[$f.BaseName]=$p}else{$warn+=$f.Name} }
function Fix($t){
 $t=$t -replace '="\.\./(css|js|pages)/','="/$1/' -replace '="\.\./index\.html"','="/index.html"'
 $t=[regex]::Replace($t,'(href|src)="(?:\.\./)?([a-z0-9-]+)\.html"',{param($x) $p=$MAP[$x.Groups[2].Value]; if($p){$x.Groups[1].Value+'="/calculator-types/'+$p+'"'}else{$x.Value}})
 [regex]::Replace($t,'(?<=["''/])calculator-types/([a-z0-9-]+)\.html',{param($x) $p=$MAP[$x.Groups[1].Value]; if($p){'calculator-types/'+$p}else{$x.Value}}) }
New-Item -Force -ItemType Directory "$root\_archive" | Out-Null; Copy-Item "$root\sitemap.xml" "$root\_archive\sitemap.xml.bak-$(Get-Date -f yyyyMMdd-HHmmss)"
$files=@(gci $CT -Recurse -Filter *.html)+@(gci "$root\pages" -Filter *.html)+@(gci "$root\js" -Filter *.js)+@(gi "$root\index.html","$root\sitemap.xml","$root\robots.txt" -ea 0)
$n=0; foreach($f in $files){ $t=[IO.File]::ReadAllText($f.FullName); $o=Fix $t; if($f.Name -eq 'app.js'){$o=$o.Replace("return location.pathname.includes('/calculator-types/') ? '../' : '';","return '/';")}; if($o -ne $t){[IO.File]::WriteAllText($f.FullName,$o,$u);$n++} }
if(-not (Test-Path "$root\vercel.json") -and $mv.Count){ $rd=@($mv.Keys | sort | % { [ordered]@{source="/calculator-types/$_.html";destination="/calculator-types/$($mv[$_])";permanent=$true} }); [IO.File]::WriteAllText("$root\vercel.json",(ConvertTo-Json @{redirects=$rd} -Depth 4),$u) }
foreach($k in $mv.Keys){ $dst="$CT\$($mv[$k].Replace('/','\'))"; New-Item -Force -ItemType Directory (Split-Path $dst) | Out-Null; Move-Item "$CT\$k.html" $dst -Force }
$sm=[IO.File]::ReadAllText("$root\sitemap.xml"); $b=[regex]::Match($sm,'<loc>(https?://[^/<]+)').Groups[1].Value
$add=@(gci $CT -Recurse -Filter *.html | % { $q='calculator-types/'+$_.FullName.Substring($CT.Length+1).Replace('\','/'); if(-not $sm.Contains("/$q<")){ $pr=if($q -like '*loan*'){'0.8'}else{'0.7'}; "  <url><loc>$b/$q</loc><priority>$pr</priority><changefreq>monthly</changefreq></url>" } })
if($b -and $add.Count){[IO.File]::WriteAllText("$root\sitemap.xml",$sm.Replace('</urlset>',(($add -join "`n")+"`n</urlset>")),$u)}
"moved: $($mv.Count) | files rewritten: $n | sitemap added: $($add.Count) | unmapped: $($warn -join ', ')"