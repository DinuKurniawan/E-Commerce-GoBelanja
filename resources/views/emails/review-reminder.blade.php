@extends('emails.layout')

@section('title', 'Review Reminder')

@section('content')
    <h1>We'd Love Your Feedback! ⭐</h1>
    
    <p>Hi {{ $order->user->name }},</p>
    
    <p>It's been a week since your order was delivered. We hope you're enjoying your purchase!</p>
    
    <p>Your opinion matters to us and helps other customers make informed decisions. Would you take a moment to share your experience?</p>
    
    <div class="info-box">
        <strong>Order Number:</strong> {{ $order->order_number }}<br>
        <strong>Delivered:</strong> {{ $order->updated_at->format('F d, Y') }}
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">Items to Review</h2>
    
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>
                    <a href="{{ url('/user/products/' . $item->product->id . '/review') }}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                        Write Review
                    </a>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ url('/user/orders/' . $order->id . '/review') }}" class="btn">Review Your Order</a>
    </div>
    
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
            <strong>💡 Tip:</strong> Honest reviews help us improve our products and services. Plus, your review helps fellow shoppers!
        </p>
    </div>
    
    <p style="margin-top: 30px;">Thank you for being a valued customer!</p>
@endsection
