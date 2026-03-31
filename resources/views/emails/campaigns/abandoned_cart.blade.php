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
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
            color: #fa709a;
            margin-top: 0;
        }
        .cart-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            display: flex;
            align-items: center;
        }
        .cart-item img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
        }
        .cart-item-details {
            flex: 1;
        }
        .cart-item-name {
            font-weight: bold;
            color: #333333;
            margin-bottom: 5px;
        }
        .cart-item-price {
            color: #fa709a;
            font-size: 18px;
            font-weight: bold;
        }
        .cart-total {
            background-color: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border-radius: 8px;
        }
        .cart-total h3 {
            margin: 0 0 10px 0;
            color: #333333;
        }
        .cart-total .price {
            font-size: 32px;
            color: #fa709a;
            font-weight: bold;
        }
        .discount-code {
            background-color: #d4edda;
            border: 2px dashed #28a745;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            border-radius: 8px;
        }
        .discount-code .code {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            font-family: 'Courier New', monospace;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
            color: #fa709a;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 You Left Something Behind!</h1>
        </div>
        <div class="content">
            <h2>Hello {{ $recipient['name'] }}!</h2>
            <p>We noticed you left some items in your cart. Don't worry, we've saved them for you!</p>
            
            @if(isset($recipient['cart_items']) && count($recipient['cart_items']) > 0)
                @foreach($recipient['cart_items'] as $item)
                <div class="cart-item">
                    @if(!empty($item['product_image']))
                    <img src="{{ asset('storage/' . $item['product_image']) }}" alt="{{ $item['product_name'] }}">
                    @endif
                    <div class="cart-item-details">
                        <div class="cart-item-name">{{ $item['product_name'] }}</div>
                        <div>Quantity: {{ $item['quantity'] }}</div>
                        <div class="cart-item-price">Rp {{ number_format($item['product_price'], 0, ',', '.') }}</div>
                    </div>
                </div>
                @endforeach

                <div class="cart-total">
                    <h3>Cart Total:</h3>
                    <div class="price">Rp {{ number_format($recipient['cart_total'] ?? 0, 0, ',', '.') }}</div>
                </div>

                <div class="discount-code">
                    <p>Complete your purchase now and get 10% off with code:</p>
                    <div class="code">COMEBACK10</div>
                </div>
            @endif

            <div style="text-align: center;">
                <a href="{{ route('email.track.click', ['campaign' => $campaign_id, 'email' => $tracking_email, 'url' => url('/user/cart')]) }}" class="cta-button">
                    Complete Your Purchase
                </a>
            </div>

            <p style="margin-top: 30px; color: #666;">This is a limited-time offer. Items in your cart are reserved for 48 hours.</p>
        </div>
        <div class="footer">
            <p>You received this email because you have items in your shopping cart.</p>
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
