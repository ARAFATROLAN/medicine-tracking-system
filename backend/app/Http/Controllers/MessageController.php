<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $roles = $user->roles()->pluck('name')->map(fn ($name) => strtolower($name))->toArray();
        $recipientRoles = ['all'];

        if (in_array('doctor', $roles)) {
            $recipientRoles[] = 'doctors';
        }
        if (in_array('pharmacist', $roles)) {
            $recipientRoles[] = 'pharmacists';
        }
        if (in_array('admin', $roles) || in_array('super_admin', $roles)) {
            $recipientRoles[] = 'admins';
        }

        $messages = Message::with(['sender', 'replies.sender'])
            ->whereNull('parent_id')
            ->where(function ($query) use ($recipientRoles, $user) {
                $query->whereIn('recipient_role', $recipientRoles)
                      ->orWhere('sender_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => true,
            'message' => 'Messages retrieved successfully',
            'data' => $messages
        ], 200);
    }

    public function show(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $message = Message::with(['sender.roles', 'replies.sender'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'Message retrieved successfully',
            'data' => $message
        ], 200);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'recipient_role' => 'required|string|in:doctors,pharmacists,admins,all',
            'body' => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:messages,id',
        ]);

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_role' => $validated['recipient_role'],
            'body' => $validated['body'],
            'parent_id' => $validated['parent_id'] ?? null,
            'thread_id' => null,
        ]);

        if ($message->parent_id) {
            $parent = Message::find($message->parent_id);
            $message->thread_id = $parent->thread_id ?: $parent->id;
        } else {
            $message->thread_id = $message->id;
        }

        $message->save();
        $recipients = $this->getRecipientUsers($validated['recipient_role'], $user);

        foreach ($recipients as $recipient) {
            Notification::create([
                'user_id' => $recipient->id,
                'message' => trim($user->name . ' sent a message: ' . mb_substr($message->body, 0, 120)),
                'type' => 'message',
                'reference_id' => $message->id,
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Message sent successfully',
            'data' => $message->load(['sender', 'replies.sender'])
        ], 201);
    }

    private function getRecipientUsers(string $recipientRole, User $sender)
    {
        $query = User::query();

        if ($recipientRole === 'all') {
            return $query->where('id', '!=', $sender->id)->get();
        }

        $roleName = match ($recipientRole) {
            'doctors' => 'Doctor',
            'pharmacists' => 'Pharmacist',
            'admins' => 'Admin',
            default => null,
        };

        if ($roleName) {
            return $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            })->where('id', '!=', $sender->id)->get();
        }

        return collect();
    }
}
