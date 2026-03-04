# Root URL path should fail
Invoke-RestMethod -Uri http://localhost:8080/

# Read users
Invoke-RestMethod -Uri http://localhost:8080/users -Method Get

# Create a user
Invoke-RestMethod -Uri http://localhost:8080/users -Method Post

$Params = @{
  Method      = 'Post'
  Uri         = 'http://localhost:8080/users'
  Body        = @{
    email    = 'kalel.kandor@krypton.com'
    password = 'kalel'
  } | ConvertTo-Json
  ContentType = 'application/json'
}
Invoke-RestMethod @Params

$Params = @{
  Method = 'Post'
  Uri    = 'http://localhost:8080/users?email=kalel.kandor@krypton.com&password=kalel'
}
Invoke-RestMethod @Params

# Read a user
Invoke-RestMethod -Uri http://localhost:8080/users -Method Get

# Update a user
Invoke-RestMethod -Uri http://localhost:8080/users -Method Patch

# Delete a user
Invoke-RestMethod -Uri http://localhost:8080/users -Method Delete
