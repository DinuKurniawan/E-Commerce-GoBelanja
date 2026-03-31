@extends('emails.layout')

@section('title', 'Order Delivered')

@section('content')
    <h1>Your Order Has Been Delivered! 📦</h1>
    
    <p>Hi {{ $order->user->name }},</p>
    
    <p>Great news! Your order has been successfully delivered. We hope you love your purchase!</p>
    
    <div class="info-box" style="border-left-color: #10b981;">
        <strong>Order Number:</strong> {{ $order->order_number }}<br>
        <strong>Delivered Date:</strong> {{ now()->format('F d, Y H:i') }}<br>
        <strong>Tracking Number:</strong> {{ $order->tracking_number }}
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Delivered Items</h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 15px;">How was your experience?</p>
        <a href="{{ url('/user/orders/' . $order->id . '/review') }}" class="btn">Leave a Review</a>
    </div>
    
    <p style="margin-top: 30px;">Your feedback helps us improve and helps other customers make informed decisions. We'd love to hear what you think!</p>
    
    <p>If you have any issues with your order, please contact our support team within 7 days.</p>
@endsection
