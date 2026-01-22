<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Poll extends Model
{
    use SoftDeletes;

    protected $table ="polls";

    protected $fillable = [
        "title",
        "description",
        "deadline",
        "created_by"
    ];

    public function user() {
        return $this->belongsTo(User::class, "created_by");
    }

    public function choices() {
        return $this->hasMany(Choise::class);
    }

    public function votes() {
        return $this->hasMany(Vote::class);
    }
}
