@extends('emails.layout')

@section('title', 'Payment Verified')

@section('content')
    <h1>Payment Verified Successfully! ✅</h1>
    
    <p>Hi {{ $order->user->name }},</p>
    
    <p>Great news! Your payment has been verified and confirmed. We're now processing your order and will ship it soon.</p>
    
    <div class="info-box" style="border-left-color: #10b981;">
        <strong>Order Number:</strong> {{ $order->order_number }}<br>
        <strong>Payment Amount:</strong> Rp {{ number_format($order->payment->amount, 0, ',', '.') }}<br>
        <strong>Payment Method:</strong> {{ ucfirst($order->payment->method) }}<br>
        <strong>Payment Date:</strong> {{ $order->payment->paid_at->format('F d, Y H:i') }}
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Order Summary</h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total Paid:</td>
                <td>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    
    <div style="text-align: center;">
        <a href="{{ url('/user/orders/' . $order->id) }}" class="btn">Track Your Order</a>
    </div>
    
    <p style="margin-top: 30px;">Thank you for shopping with us! You'll receive another email once your order ships.</p>
@endsection
