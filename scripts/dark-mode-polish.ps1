# Comprehensive Dark Mode Polish Script
# This script adds consistent, premium dark mode styling across all components

Write-Host "🎨 Starting comprehensive dark mode polish..." -ForegroundColor Cyan

# Define color mapping for premium dark mode
$replacements = @(
    # Backgrounds - Cards and panels
    @{ Pattern = 'bg-white(?!\S)'; Replace = 'bg-white dark:bg-stone-800' }
    @{ Pattern = 'bg-stone-50(?!\S)'; Replace = 'bg-stone-50 dark:bg-stone-900' }
    @{ Pattern = 'bg-stone-100(?!\S)'; Replace = 'bg-stone-100 dark:bg-stone-800' }
    @{ Pattern = 'bg-stone-200(?!\S)'; Replace = 'bg-stone-200 dark:bg-stone-700' }
    
    # Amber backgrounds for highlights (darker in dark mode)
    @{ Pattern = 'bg-amber-50(?!\/)(?!\S)'; Replace = 'bg-amber-50 dark:bg-amber-900/20' }
    @{ Pattern = 'border-amber-200(?!\S)'; Replace = 'border-amber-200 dark:border-amber-700/50' }
    @{ Pattern = 'text-amber-900(?!\S)'; Replace = 'text-amber-900 dark:text-amber-100' }
    
    # Text colors - Headings and content
    @{ Pattern = ' text-stone-800(?!\S)'; Replace = ' text-stone-800 dark:text-stone-100' }
    @{ Pattern = ' text-stone-700(?!.*dark)'; Replace = ' text-stone-700 dark:text-stone-200' }
    @{ Pattern = ' text-stone-600(?!.*dark)'; Replace = ' text-stone-600 dark:text-stone-300' }
    @{ Pattern = ' text-stone-500(?!.*dark)'; Replace = ' text-stone-500 dark:text-stone-400' }
    @{ Pattern = ' text-stone-400(?!.*dark)'; Replace = ' text-stone-400 dark:text-stone-500' }
    @{ Pattern = ' text-stone-200(?!.*dark)'; Replace = ' text-stone-200 dark:text-stone-600' }
    
    # Borders
    @{ Pattern = 'border-stone-200(?!.*dark)'; Replace = 'border-stone-200 dark:border-stone-700' }
    @{ Pattern = 'border-stone-300(?!.*dark)'; Replace = 'border-stone-300 dark:border-stone-600' }
    @{ Pattern = 'border-dashed border-stone-200(?!\S)'; Replace = 'border-dashed border-stone-200 dark:border-stone-700' }
    
    # Disabled states
    @{ Pattern = 'disabled:bg-stone-300(?!\S)'; Replace = 'disabled:bg-stone-300 dark:disabled:bg-stone-700' }
    
    # Input fields
    @{ Pattern = 'border-amber-500 bg-amber-50'; Replace = 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600' }
    @{ Pattern = 'border-stone-300 bg-stone-50'; Replace = 'border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800' }
    
    # Hover states for backgrounds
    @{ Pattern = 'hover:bg-amber-200(?!\S)'; Replace = 'hover:bg-amber-200 dark:hover:bg-amber-800' }
)

# Files to process
$files = @(
    "src\views\components\OrderSummary.tsx",
    "src\views\components\LoadingScreen.tsx",
    "src\views\components\Invoice.tsx",
    "src\views\pages\HistoryPage.tsx",
    "src\views\pages\DashboardPage.tsx"
)

$basePath = "c:\Users\ChungVH\Downloads\katuu---milk-tea-ordering"

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Write-Host "  📝 Processing $file..." -ForegroundColor Yellow
        
        try {
            $content = Get-Content $fullPath -Raw -ErrorAction Stop
            
            # Apply all replacements
            foreach ($replacement in $replacements) {
                $content = $content -replace $replacement.Pattern, $replacement.Replace
            }
            
            # Write back
            Set-Content $fullPath -Value $content -Force -ErrorAction Stop
            Write-Host "  ✅ $file updated!" -ForegroundColor Green
        }
        catch {
            Write-Host "  ⚠️  Error processing $file : $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Dark mode polish complete!" -ForegroundColor Green
Write-Host "Run 'npx tsc --noEmit' to verify TypeScript compilation." -ForegroundColor Cyan
