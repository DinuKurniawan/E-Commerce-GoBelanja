@extends('emails.layout')

@section('title', 'Order Shipped')

@section('content')
    <h1>Your Order is On the Way! 🚚</h1>
    
    <p>Hi {{ $order->user->name }},</p>
    
    <p>Exciting news! Your order has been shipped and is on its way to you. You can track your shipment using the tracking information below.</p>
    
    <div class="info-box" style="border-left-color: #3b82f6;">
        <strong>Order Number:</strong> {{ $order->order_number }}<br>
        <strong>Tracking Number:</strong> <span style="color: #3b82f6; font-weight: bold;">{{ $order->tracking_number }}</span><br>
        <strong>Courier:</strong> {{ ucfirst($order->shipping_courier) }}<br>
        <strong>Shipped Date:</strong> {{ now()->format('F d, Y') }}
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Shipped Items</h2>
    
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
    
    <div class="info-box">
        <strong>Delivery Address:</strong><br>
        {{ $order->shipping_address }}
    </div>
    
    <div style="text-align: center;">
        <a href="{{ url('/user/orders/' . $order->id) }}" class="btn">Track Shipment</a>
    </div>
    
    <p style="margin-top: 30px;">Estimated delivery time varies by location. You can track your package status in real-time using your tracking number.</p>
@endsection
