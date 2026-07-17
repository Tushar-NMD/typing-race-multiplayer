# PowerShell API Test Script for Typeverse Backend

Write-Host "🧪 Testing Typeverse Backend API" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$token1 = $null
$token2 = $null
$roomCode = $null

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
    exit
}
Write-Host ""

# Test 2: Login User 1 (instead of signup)
Write-Host "2. Testing Login (User 1: Tushar)..." -ForegroundColor Yellow
$loginBody1 = @{
    email = "tushar@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody1 -ContentType "application/json"
    $token1 = $response.token
    Write-Host "✅ Login Successful" -ForegroundColor Green
    Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
    Write-Host "   Token: $($token1.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    # If login fails, try signup
    Write-Host "   Login failed, trying signup..." -ForegroundColor Gray
    $signupBody1 = @{
        name = "Tushar Kumar"
        username = "tushar"
        email = "tushar@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method Post -Body $signupBody1 -ContentType "application/json"
        $token1 = $response.token
        Write-Host "✅ Signup Successful" -ForegroundColor Green
        Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Authentication Failed: $_" -ForegroundColor Red
        exit
    }
}
Write-Host ""

# Test 3: Login User 2
Write-Host "3. Testing Login (User 2: Aman)..." -ForegroundColor Yellow
$loginBody2 = @{
    email = "aman@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody2 -ContentType "application/json"
    $token2 = $response.token
    Write-Host "✅ Login Successful" -ForegroundColor Green
    Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
} catch {
    # If login fails, try signup
    Write-Host "   Login failed, trying signup..." -ForegroundColor Gray
    $signupBody2 = @{
        name = "Aman Singh"
        username = "aman"
        email = "aman@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method Post -Body $signupBody2 -ContentType "application/json"
        $token2 = $response.token
        Write-Host "✅ Signup Successful" -ForegroundColor Green
        Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Authentication Failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Get Current User
Write-Host "4. Testing Get Current User (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token1"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Get User Successful" -ForegroundColor Green
    Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Highest WPM: $($response.user.highestWPM)" -ForegroundColor Gray
    Write-Host "   Games Played: $($response.user.gamesPlayed)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get User Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Update Profile
Write-Host "5. Testing Update Profile..." -ForegroundColor Yellow
$updateBody = @{
    name = "Tushar Kumar - Updated"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token1"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Profile Updated" -ForegroundColor Green
    Write-Host "   New Name: $($response.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Create Room
Write-Host "6. Testing Create Room..." -ForegroundColor Yellow
$roomBody = @{
    maxPlayers = 4
    duration = 60
    language = "english"
    isPrivate = $false
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token1"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method Post -Body $roomBody -ContentType "application/json" -Headers $headers
    $roomCode = $response.room.roomCode
    Write-Host "✅ Room Created" -ForegroundColor Green
    Write-Host "   Room Code: $roomCode" -ForegroundColor Gray
    Write-Host "   Host: $($response.room.players[0].username)" -ForegroundColor Gray
    Write-Host "   Max Players: $($response.room.maxPlayers)" -ForegroundColor Gray
    Write-Host "   Duration: $($response.room.duration)s" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create Room Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get Public Rooms
Write-Host "7. Testing Get Public Rooms..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method Get
    Write-Host "✅ Got Public Rooms" -ForegroundColor Green
    Write-Host "   Count: $($response.count)" -ForegroundColor Gray
    if ($response.rooms.Count -gt 0) {
        Write-Host "   First Room Code: $($response.rooms[0].roomCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get Rooms Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get Specific Room
if ($roomCode) {
    Write-Host "8. Testing Get Room Details..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$roomCode" -Method Get
        Write-Host "✅ Got Room Details" -ForegroundColor Green
        Write-Host "   Room Code: $($response.room.roomCode)" -ForegroundColor Gray
        Write-Host "   Status: $($response.room.status)" -ForegroundColor Gray
        Write-Host "   Players: $($response.room.players.Count)/$($response.room.maxPlayers)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Room Failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 9: Join Room
if ($roomCode -and $token2) {
    Write-Host "9. Testing Join Room..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token2"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$roomCode/join" -Method Post -Body "{}" -ContentType "application/json" -Headers $headers
        Write-Host "✅ Joined Room" -ForegroundColor Green
        Write-Host "   Players in Room: $($response.room.players.Count)" -ForegroundColor Gray
        foreach ($player in $response.room.players) {
            Write-Host "   - $($player.username)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Join Room Failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 10: Leave Room
if ($roomCode -and $token2) {
    Write-Host "10. Testing Leave Room..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token2"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$roomCode/leave" -Method Post -Body "{}" -ContentType "application/json" -Headers $headers
        Write-Host "✅ Left Room" -ForegroundColor Green
        Write-Host "   Players Remaining: $($response.room.players.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Leave Room Failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ All Tests Completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Saved data for manual testing:" -ForegroundColor Yellow
Write-Host "   Token 1 (Tushar): $token1" -ForegroundColor Gray
if ($token2) {
    Write-Host "   Token 2 (Aman): $token2" -ForegroundColor Gray
}
if ($roomCode) {
    Write-Host "   Room Code: $roomCode" -ForegroundColor Gray
}
Write-Host ""
Write-Host "You can now test these in Postman or continue in the frontend!" -ForegroundColor Cyan
