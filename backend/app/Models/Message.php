<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_role',
        'body',
        'parent_id',
        'thread_id',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'parent_id')->with('sender')->orderBy('created_at', 'asc');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }
}
