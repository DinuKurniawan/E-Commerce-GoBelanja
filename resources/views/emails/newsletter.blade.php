@extends('emails.layout')

@section('title', $subject)

@section('content')
    <h1>{{ $subject }}</h1>
    
    <div style="margin: 30px 0;">
        {!! nl2br(e($content)) !!}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ url('/') }}" class="btn">Visit Our Store</a>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px;">
            You're receiving this email because you subscribed to our newsletter.<br>
            <a href="{{ url('/newsletter/unsubscribe') }}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
        </p>
    </div>
@endsection
