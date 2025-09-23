# Read JSON data
try {
    $jsonData = Get-Content -Raw -Path "./Resources/Json/map.json" -ErrorAction Stop
    Write-Host "Successfully read JSON file"
} catch {
    Write-Error "Failed to read JSON file: $_"
    exit
}

# Parse JSON
try {
    $systems = ConvertFrom-Json $jsonData -ErrorAction Stop
    Write-Host "Parsed JSON with $($systems.Count) systems"
} catch {
    Write-Error "Failed to parse JSON: $_"
    exit
}

# Group systems by faction and prepare CSV output
$csvData = @()
foreach ($system in $systems) {
    $faction = $system.faction
    $x = $system.position[0]
    $y = $system.position[1]
    $csvData += [PSCustomObject]@{
        Faction = $faction
        X       = [double]$x
        Y       = [double]$y
    }
}

# Export to CSV
try {
    $csvData | Export-Csv -Path "./points.csv" -NoTypeInformation -Encoding UTF8
    Write-Host "Wrote points to ./points.csv"
} catch {
    Write-Error "Failed to write to points.csv: $_"
    exit
}