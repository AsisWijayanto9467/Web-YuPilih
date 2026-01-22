<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Choise extends Model
{
    protected $table = "choices";

    protected $fillable = [
        "choice",
        "poll_id"
    ];

    public function poll() {
        return $this->belongsTo(Poll::class);
    }

    public function votes() {
        return $this->hasMany(Vote::class, "choice_id");
    }
}
