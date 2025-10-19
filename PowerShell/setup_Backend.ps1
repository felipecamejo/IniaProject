# JMeter Installation and Configuration Script
# This script installs Apache JMeter and configures it for performance testing

param(
    [string]$JMeterVersion = "5.6.3",
    [string]$InstallPath = "C:\JMeter",
    [switch]$Force = $false
)

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to check Java installation
function Test-JavaInstallation {
    Write-ColorOutput "Checking Java installation..." "Yellow"
    
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        if ($javaVersion) {
            Write-ColorOutput "Java is installed: $javaVersion" "Green"
            return $true
        }
    }
    catch {
        Write-ColorOutput "Java is not installed or not in PATH" "Red"
        return $false
    }
    return $false
}

# Function to install Java if not present
function Install-Java {
    Write-ColorOutput "Java is required for JMeter. Installing OpenJDK..." "Yellow"
    
    # Check if Chocolatey is installed
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-ColorOutput "Installing OpenJDK using Chocolatey..." "Yellow"
        choco install openjdk -y
    }
    else {
        Write-ColorOutput "Chocolatey not found. Please install Java manually from:" "Red"
        Write-ColorOutput "https://adoptium.net/" "Cyan"
        Write-ColorOutput "Or install Chocolatey first: https://chocolatey.org/install" "Cyan"
        return $false
    }
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    return Test-JavaInstallation
}

# Function to download JMeter
function Download-JMeter {
    param(
        [string]$Version,
        [string]$Path
    )
    
    $downloadUrl = "https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-$Version.zip"
    $zipFile = Join-Path $Path "apache-jmeter-$Version.zip"
    $extractPath = Join-Path $Path "apache-jmeter-$Version"
    
    Write-ColorOutput "Downloading JMeter $Version..." "Yellow"
    Write-ColorOutput "URL: $downloadUrl" "Cyan"
    
    try {
        # Create directory if it doesn't exist
        if (!(Test-Path $Path)) {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        }
        
        # Download JMeter
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
        Write-ColorOutput "Download completed successfully" "Green"
        
        # Extract JMeter
        Write-ColorOutput "Extracting JMeter..." "Yellow"
        Expand-Archive -Path $zipFile -DestinationPath $Path -Force
        
        # Rename extracted folder to JMeter
        $finalPath = Join-Path $Path "JMeter"
        if (Test-Path $finalPath) {
            Remove-Item $finalPath -Recurse -Force
        }
        Rename-Item $extractPath $finalPath
        
        # Clean up zip file
        Remove-Item $zipFile -Force
        
        Write-ColorOutput "JMeter extracted to: $finalPath" "Green"
        return $finalPath
    }
    catch {
        Write-ColorOutput "Error downloading or extracting JMeter: $($_.Exception.Message)" "Red"
        return $null
    }
}

# Function to configure JMeter environment
function Set-JMeterEnvironment {
    param(
        [string]$JMeterPath
    )
    
    Write-ColorOutput "Configuring JMeter environment..." "Yellow"
    
    # Set JMETER_HOME environment variable
    [Environment]::SetEnvironmentVariable("JMETER_HOME", $JMeterPath, "User")
    $env:JMETER_HOME = $JMeterPath
    
    # Add JMeter bin directory to PATH
    $jmeterBinPath = Join-Path $JMeterPath "bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($currentPath -notlike "*$jmeterBinPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$jmeterBinPath", "User")
        $env:Path += ";$jmeterBinPath"
        Write-ColorOutput "Added JMeter to PATH: $jmeterBinPath" "Green"
    }
    
    # Create JMeter properties file with optimized settings
    $propertiesFile = Join-Path $JMeterPath "bin\jmeter.properties"
    if (Test-Path $propertiesFile) {
        Write-ColorOutput "Configuring JMeter properties..." "Yellow"
        
        # Backup original properties file
        Copy-Item $propertiesFile "$propertiesFile.backup" -Force
        
        # Read and modify properties
        $properties = Get-Content $propertiesFile
        $newProperties = @()
        
        foreach ($line in $properties) {
            if ($line -match "^#?jmeter\.save\.saveservice\.response_data=") {
                $newProperties += "jmeter.save.saveservice.response_data=true"
            }
            elseif ($line -match "^#?jmeter\.save\.saveservice\.response_data\.on_error=") {
                $newProperties += "jmeter.save.saveservice.response_data.on_error=true"
            }
            elseif ($line -match "^#?jmeter\.save\.saveservice\.samplerData=") {
                $newProperties += "jmeter.save.saveservice.samplerData=true"
            }
            elseif ($line -match "^#?jmeter\.save\.saveservice\.requestHeaders=") {
                $newProperties += "jmeter.save.saveservice.requestHeaders=true"
            }
            elseif ($line -match "^#?jmeter\.save\.saveservice\.responseHeaders=") {
                $newProperties += "jmeter.save.saveservice.responseHeaders=true"
            }
            elseif ($line -match "^#?jmeter\.save\.saveservice\.assertion_results_failure_message=") {
                $newProperties += "jmeter.save.saveservice.assertion_results_failure_message=true"
            }
            else {
                $newProperties += $line
            }
        }
        
        Set-Content -Path $propertiesFile -Value $newProperties
        Write-ColorOutput "JMeter properties configured for better logging" "Green"
    }
}

# Function to verify JMeter installation
function Test-JMeterInstallation {
    param(
        [string]$JMeterPath
    )
    
    Write-ColorOutput "Verifying JMeter installation..." "Yellow"
    
    $jmeterBat = Join-Path $JMeterPath "bin\jmeter.bat"
    if (Test-Path $jmeterBat) {
        Write-ColorOutput "JMeter executable found: $jmeterBat" "Green"
        
        # Test JMeter version
        try {
            $version = & $jmeterBat --version 2>&1
            Write-ColorOutput "JMeter version: $version" "Green"
            return $true
        }
        catch {
            Write-ColorOutput "Could not get JMeter version: $($_.Exception.Message)" "Red"
            return $false
        }
    }
    else {
        Write-ColorOutput "JMeter executable not found at: $jmeterBat" "Red"
        return $false
    }
}

# Function to create JMeter test directory structure
function New-JMeterTestStructure {
    param(
        [string]$JMeterPath
    )
    
    Write-ColorOutput "Creating JMeter test directory structure..." "Yellow"
    
    $testDirs = @(
        "tests",
        "tests\scripts",
        "tests\data",
        "tests\results",
        "tests\reports"
    )
    
    foreach ($dir in $testDirs) {
        $fullPath = Join-Path $JMeterPath $dir
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-ColorOutput "Created directory: $fullPath" "Green"
        }
    }
}

# Function to create sample test plan
function New-SampleTestPlan {
    param(
        [string]$JMeterPath
    )
    
    Write-ColorOutput "Creating sample test plan..." "Yellow"
    
    $sampleTestPlan = @"
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Sample Test Plan" enabled="true">
      <stringProp name="TestPlan.comments">Sample test plan for API testing</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments">
          <elementProp name="baseUrl" elementType="Argument">
            <stringProp name="Argument.name">baseUrl</stringProp>
            <stringProp name="Argument.value">http://localhost:8080</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControllerGui" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">1</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">1</stringProp>
        <stringProp name="ThreadGroup.ramp_time">1</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Sample HTTP Request" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain">\${baseUrl}</stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol">http</stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">/api/health</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
"@
    
    $samplePath = Join-Path $JMeterPath "tests\scripts\sample-test-plan.jmx"
    Set-Content -Path $samplePath -Value $sampleTestPlan -Encoding UTF8
    Write-ColorOutput "Sample test plan created: $samplePath" "Green"
}

# Main execution
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "    JMeter Installation and Configuration     " "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput ""

# Check if running as administrator
if (!(Test-Administrator)) {
    Write-ColorOutput "Warning: Not running as administrator. Some operations may require elevated privileges." "Yellow"
    Write-ColorOutput ""
}

# Check Java installation
if (!(Test-JavaInstallation)) {
    if (!(Install-Java)) {
        Write-ColorOutput "Java installation failed. Please install Java manually and run this script again." "Red"
        exit 1
    }
}

# Check if JMeter is already installed
$existingJMeter = Get-Command jmeter -ErrorAction SilentlyContinue
if ($existingJMeter -and !$Force) {
    Write-ColorOutput "JMeter is already installed at: $($existingJMeter.Source)" "Yellow"
    $response = Read-Host "Do you want to reinstall? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-ColorOutput "Installation cancelled." "Yellow"
        exit 0
    }
}

# Download and install JMeter
Write-ColorOutput "Installing JMeter version $JMeterVersion to $InstallPath..." "Yellow"
$jmeterPath = Download-JMeter -Version $JMeterVersion -Path $InstallPath

if ($jmeterPath) {
    # Configure JMeter environment
    Set-JMeterEnvironment -JMeterPath $jmeterPath
    
    # Verify installation
    if (Test-JMeterInstallation -JMeterPath $jmeterPath) {
        Write-ColorOutput ""
        Write-ColorOutput "JMeter installation completed successfully!" "Green"
        
        # Create test directory structure
        New-JMeterTestStructure -JMeterPath $jmeterPath
        
        # Create sample test plan
        New-SampleTestPlan -JMeterPath $jmeterPath
        
        Write-ColorOutput ""
        Write-ColorOutput "===============================================" "Green"
        Write-ColorOutput "           Installation Summary                " "Green"
        Write-ColorOutput "===============================================" "Green"
        Write-ColorOutput "JMeter Path: $jmeterPath" "White"
        Write-ColorOutput "JMeter Home: `$env:JMETER_HOME" "White"
        Write-ColorOutput "Sample Test Plan: $jmeterPath\tests\scripts\sample-test-plan.jmx" "White"
        Write-ColorOutput ""
        Write-ColorOutput "To start JMeter GUI, run: jmeter" "Cyan"
        Write-ColorOutput "To run a test plan, run: jmeter -n -t [test-plan.jmx] -l [results.jtl]" "Cyan"
        Write-ColorOutput ""
        Write-ColorOutput "Note: You may need to restart your terminal or IDE to use JMeter commands." "Yellow"
    }
    else {
        Write-ColorOutput "JMeter installation verification failed." "Red"
        exit 1
    }
}
else {
    Write-ColorOutput "JMeter installation failed." "Red"
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "Script execution completed." "Green"
