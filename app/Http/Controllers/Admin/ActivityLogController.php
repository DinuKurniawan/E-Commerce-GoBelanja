<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function __construct(protected ActivityLogService $activityLog)
    {
    }

    public function index(Request $request)
    {
        $filters = [
            'user_id' => $request->input('user_id'),
            'action' => $request->input('action'),
            'model_type' => $request->input('model_type'),
            'ip_address' => $request->input('ip_address'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        $logs = $this->activityLog->getFilteredActivity($filters, 50);
        
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        $actions = [
            'login', 'logout', 'login_with_2fa', '2fa_enabled', '2fa_disabled',
            'create', 'update', 'delete', 'view', 
            'payment_verified', 'order_created', 'product_created'
        ];

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'filters' => $filters,
        ]);
    }

    public function userActivity($userId)
    {
        $user = User::findOrFail($userId);
        $logs = $this->activityLog->getUserActivity($userId, 100);

        return Inertia::render('Admin/ActivityLogs/UserActivity', [
            'user' => $user,
            'logs' => $logs,
        ]);
    }

    public function export(Request $request)
    {
        $filters = [
            'user_id' => $request->input('user_id'),
            'action' => $request->input('action'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        $logs = $this->activityLog->exportToCsv($filters);

        $filename = 'activity_logs_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'ID', 'User', 'Email', 'Action', 'Model Type', 'Model ID',
                'IP Address', 'User Agent', 'Date/Time'
            ]);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user->name ?? 'N/A',
                    $log->user->email ?? 'N/A',
                    $log->action,
                    $log->model_type,
                    $log->model_id,
                    $log->ip_address,
                    $log->user_agent,
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
