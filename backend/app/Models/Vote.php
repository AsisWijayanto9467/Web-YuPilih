<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    protected $table = "votes";

    protected $fillable = [
        "choice_id",
        "user_id",
        "poll_id",
        "division_id"
    ];

    public function choice() {
        return $this->belongsTo(Choise::class);
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
    public function poll() {
        return $this->belongsTo(Poll::class);
    }
    public function division() {
        return $this->belongsTo(Division::class);
    }
}
