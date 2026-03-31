<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $campaign->subject }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
            color: #333333;
        }
        .content h2 {
            color: #667eea;
            margin-top: 0;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Just For You</h1>
        </div>
        <div class="content">
            <h2>Hello {{ $recipient['name'] }}!</h2>
            {!! $content !!}
            <a href="{{ route('email.track.click', ['campaign' => $campaign_id, 'email' => $tracking_email, 'url' => url('/products/search')]) }}" class="cta-button">
                Discover Products
            </a>
        </div>
        <div class="footer">
            <p>You received this email because you're a valued customer.</p>
            <p>
                <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
                <a href="{{ route('newsletter.preferences', ['token' => $unsubscribe_url ? basename($unsubscribe_url) : '']) }}">Manage Preferences</a>
            </p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
    <img src="{{ $tracking_pixel_url }}" width="1" height="1" alt="" style="display:none;">
</body>
</html>
