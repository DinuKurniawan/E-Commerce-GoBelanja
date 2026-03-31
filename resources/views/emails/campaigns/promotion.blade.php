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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
        }
        .badge {
            display: inline-block;
            background-color: #ff4444;
            color: #ffffff;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
            color: #333333;
        }
        .content h2 {
            color: #f5576c;
            margin-top: 0;
        }
        .discount-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
            color: #f5576c;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Special Promotion</h1>
            <span class="badge">LIMITED TIME OFFER</span>
        </div>
        <div class="content">
            <h2>Hello {{ $recipient['name'] }}!</h2>
            {!! $content !!}
            
            @if(isset($recipient['loyalty_tier']))
            <div class="discount-box">
                As a {{ $recipient['loyalty_tier'] }} member, you get exclusive access to this promotion!
            </div>
            @endif
            
            <a href="{{ route('email.track.click', ['campaign' => $campaign_id, 'email' => $tracking_email, 'url' => url('/products/search')]) }}" class="cta-button">Shop Now & Save</a>
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
