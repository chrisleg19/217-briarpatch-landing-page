param(
    [int]$Port = 8123,
    [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving '$Root' at http://localhost:$Port/  (Ctrl+C to stop)"

$mime = @{
    ".html" = "text/html; charset=utf-8";
    ".css"  = "text/css; charset=utf-8";
    ".js"   = "application/javascript; charset=utf-8";
    ".jpg"  = "image/jpeg"; ".jpeg" = "image/jpeg";
    ".png"  = "image/png"; ".gif" = "image/gif";
    ".svg"  = "image/svg+xml"; ".ico" = "image/x-icon";
    ".webp" = "image/webp"; ".json" = "application/json";
}

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $reqPath = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
        if ($reqPath -eq "/") { $reqPath = "/index.html" }
        $full = Join-Path $Root ($reqPath.TrimStart("/"))

        if (Test-Path $full -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($full)
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $reqPath")
            $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $ctx.Response.OutputStream.Close()
    } catch {
        Write-Host "Error: $_"
    }
}
