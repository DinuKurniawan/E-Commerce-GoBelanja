@extends('emails.layout')

@section('title', 'Items Waiting in Your Cart')

@section('content')
    <h1>Don't Miss Out! 🛒</h1>
    
    <p>Hi {{ $user->name }},</p>
    
    <p>We noticed you left some items in your cart. Good news - they're still available and waiting for you!</p>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Items in Your Cart</h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            @php
                $total = 0;
            @endphp
            @foreach($cartItems as $item)
            @php
                $subtotal = $item->product->price * $item->quantity;
                $total += $subtotal;
            @endphp
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>Rp {{ number_format($subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total:</td>
                <td>Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 20px; border-radius: 10px; color: white; margin: 30px 0; text-align: center;">
        <p style="color: white; font-size: 18px; margin: 0;">
            ⚡ <strong>Limited Stock Alert!</strong><br>
            These items are popular and may sell out soon.
        </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ url('/cart') }}" class="btn">Complete Your Purchase</a>
    </div>
    
    <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;">
            <strong>💳 Secure Checkout:</strong> Your cart is saved and ready for checkout. Complete your purchase in just a few clicks!
        </p>
    </div>
    
    <p style="margin-top: 30px;">Need help? Our customer service team is always here to assist you.</p>
    
    <p style="margin-top: 15px; color: #999; font-size: 12px;">
        Your cart items will be held for 7 days. After that, they may become unavailable.
    </p>
@endsection
