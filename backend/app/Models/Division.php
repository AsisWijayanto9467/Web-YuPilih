<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $table = "divisions";

    protected $fillable = [
        "name"
    ];

    public function users() {
        return $this->hasMany(User::class);
    }

    public function vote() {
        return $this->hasMany(Vote::class);
    }
}
