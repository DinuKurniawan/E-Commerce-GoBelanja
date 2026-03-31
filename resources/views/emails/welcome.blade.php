@extends('emails.layout')

@section('title', 'Welcome to GoBelanja')

@section('content')
    <h1>Welcome to GoBelanja! 🎉</h1>
    
    <p>Hi {{ $user->name }},</p>
    
    <p>Thank you for joining GoBelanja! We're thrilled to have you as part of our community.</p>
    
    <p>Get ready to discover amazing products, exclusive deals, and a seamless shopping experience.</p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; margin: 30px 0; text-align: center;">
        <h2 style="color: white; margin-bottom: 15px;">Welcome Bonus</h2>
        <p style="color: white; font-size: 18px; margin-bottom: 20px;">
            Get 10% OFF your first purchase!
        </p>
        <div style="background: white; color: #667eea; padding: 15px 30px; display: inline-block; border-radius: 5px; font-weight: bold; font-size: 24px; letter-spacing: 2px;">
            WELCOME10
        </div>
    </div>
    
    <h2 style="margin-top: 30px; font-size: 20px;">What You Can Do:</h2>
    
    <div style="margin: 20px 0;">
        <div style="padding: 15px; margin: 10px 0; background-color: #f8f9fa; border-radius: 5px;">
            <strong style="color: #667eea;">🛍️ Browse Products</strong><br>
            <span style="color: #666;">Explore thousands of products across various categories</span>
        </div>
        
        <div style="padding: 15px; margin: 10px 0; background-color: #f8f9fa; border-radius: 5px;">
            <strong style="color: #667eea;">❤️ Create Wishlists</strong><br>
            <span style="color: #666;">Save your favorite items for later</span>
        </div>
        
        <div style="padding: 15px; margin: 10px 0; background-color: #f8f9fa; border-radius: 5px;">
            <strong style="color: #667eea;">🚚 Track Orders</strong><br>
            <span style="color: #666;">Monitor your orders in real-time</span>
        </div>
        
        <div style="padding: 15px; margin: 10px 0; background-color: #f8f9fa; border-radius: 5px;">
            <strong style="color: #667eea;">🎁 Earn Rewards</strong><br>
            <span style="color: #666;">Get loyalty points with every purchase</span>
        </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ url('/') }}" class="btn">Start Shopping</a>
    </div>
    
    <p style="margin-top: 30px;">If you have any questions, our customer support team is here to help!</p>
@endsection
