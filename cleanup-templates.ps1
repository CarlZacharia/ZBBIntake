# Remove all remaining field references
$loginPath = "c:\Users\carl\apps\ZBBIntake\src\app\login\login.component.html"
$regPath = "c:\Users\carl\apps\ZBBIntake\src\app\registration\registration.component.html"

# Fix login template - remove Angular validation blocks
$loginContent = Get-Content $loginPath -Raw
$loginContent = $loginContent -replace '} @else if \(false\) \{[^}]*@if \(emailField[^}]*\}[^}]*\}[^}]*\}', '}'
$loginContent = $loginContent -replace '} @else if \(false\) \{[^}]*@if \(passwordField[^}]*\}[^}]*\}[^}]*\}', '}'
Set-Content $loginPath $loginContent

# Fix registration template - remove Angular validation blocks
$regContent = Get-Content $regPath -Raw
$regContent = $regContent -replace '} @else if \(false\) \{[^}]*@if \(emailField[^}]*\}[^}]*\}[^}]*\}', '}'
$regContent = $regContent -replace '} @else if \(false\) \{[^}]*@if \(passwordField[^}]*\}[^}]*\}[^}]*\}', '}'
Set-Content $regPath $regContent

Write-Host "Removed all remaining field references"
