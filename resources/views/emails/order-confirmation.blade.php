@extends('emails.layout')

@section('title', 'Order Confirmation')

@section('content')
    <h1>Thank You for Your Order! 🎉</h1>
    
    <p>Hi {{ $order->user->name }},</p>
    
    <p>We've received your order and are getting it ready. You'll receive a shipping confirmation email with tracking information once your order ships.</p>
    
    <div class="info-box">
        <strong>Order Number:</strong> {{ $order->order_number }}<br>
        <strong>Order Date:</strong> {{ $order->created_at->format('F d, Y') }}<br>
        <strong>Payment Status:</strong> <span style="color: #f59e0b;">{{ ucfirst($order->payment_status) }}</span>
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Order Details</h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                <td>Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total:</td>
                <td>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    
    <div class="info-box">
        <strong>Shipping Address:</strong><br>
        {{ $order->shipping_address }}
    </div>
    
    <div style="text-align: center;">
        <a href="{{ url('/user/orders/' . $order->id) }}" class="btn">View Order Details</a>
    </div>
    
    <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact our support team.</p>
@endsection
