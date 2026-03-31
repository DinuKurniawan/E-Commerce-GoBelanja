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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
        }
        .emoji {
            font-size: 48px;
            margin: 10px 0;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
            color: #333333;
        }
        .content h2 {
            color: #4facfe;
            margin-top: 0;
        }
        .discount-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            margin: 30px 0;
        }
        .discount-banner h3 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .discount-banner .code {
            font-size: 32px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
        }
        .footer a {
            color: #4facfe;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">👋</div>
            <h1>We Miss You!</h1>
        </div>
        <div class="content">
            <h2>Hello {{ $recipient['name'] }}!</h2>
            <p>It's been a while since we've seen you, and we wanted to reach out!</p>
            
            {!! $content !!}

            <div class="discount-banner">
                <h3>Welcome Back Gift 🎁</h3>
                <p>We've prepared a special 15% discount just for you!</p>
                <div class="code">WELCOME15</div>
            </div>

            <p>Discover our latest products and exclusive offers waiting for you.</p>

            <div style="text-align: center;">
                <a href="{{ route('email.track.click', ['campaign' => $campaign_id, 'email' => $tracking_email, 'url' => url('/products/search')]) }}" class="cta-button">
                    Start Shopping
                </a>
            </div>

            <p style="margin-top: 30px; color: #666;">We've missed you and can't wait to serve you again!</p>
        </div>
        <div class="footer">
            <p>You received this email because we value your business.</p>
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
