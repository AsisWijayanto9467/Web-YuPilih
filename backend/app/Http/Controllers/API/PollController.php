<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Choise;
use App\Models\Poll;
use App\Models\Vote;
use Illuminate\Http\Request;

class PollController extends Controller
{
    public function getAllPool(Request $request)
    {
        $polls = Poll::select("id",'title', 'description')->get();

        if ($polls->isEmpty()) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 403);
        }

        return response()->json([
            "totalPooling" => $polls->count(),
            "contents" => $polls->map(function ($poll) {
                return [
                    "id" => $poll->id,
                    "title"       => $poll->title,
                    "description" => $poll->description
                ];
            })
        ], 200);
    }

    public function createPool(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'title'       => 'required|string',
            'description' => 'required|string',
            'choices'     => 'required|array|min:2',
            'choices.*.choice' => 'required|string'
        ]);

        $poll = Poll::create([
            'title'       => $request->title,
            'description' => $request->description,
            'deadline'    => now()->addDays(7),
            'created_by'  => $user->id
        ]);

        foreach ($request->choices as $item) {
            Choise::create([
                'choice'  => $item['choice'],
                'poll_id'=> $poll->id
            ]);
        }

        return response()->json([
            "status"  => "success",
            "message" => "polling is created"
        ], 201);
    }

    public function deletePool(Request $request, $id)
    {
        $user = $request->user();

        $poll = Poll::find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "pool Not found"
            ], 403);
        }

        $poll->delete();

        return response()->noContent(); 
    }

    public function poolDetail(Request $request, $id)
    {
        $poll = Poll::with('choices')->find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 403);
        }

        return response()->json([
            "title"       => $poll->title,
            "description" => $poll->description,
            "choice"      => $poll->choices->map(function ($choice) {
                return [
                    "id"     => (string) $choice->id,
                    "choice" => $choice->choice
                ];
            })
        ], 200);
    }

    public function poolResult(Request $request, $id)
    {
        $poll = Poll::with(['choices.votes'])->find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 403);
        }

        $totalVotes = $poll->votes()->count();

        return response()->json([
            "title"       => $poll->title,
            "description" => $poll->description,
            "result" => $poll->choices->map(function ($choice) use ($totalVotes) {
                $voteCount = $choice->votes->count();

                $percentage = $totalVotes > 0
                    ? round(($voteCount / $totalVotes) * 100)
                    : 0;

                return [
                    "id"         => (string) $choice->id,
                    "choice"     => $choice->choice,
                    "percentage" => $percentage
                ];
            })
        ], 200);
    }

    public function addVote(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'user') {
            return response()->json([
                "status"  => "forbidden",
                "message" => "You are not the original"
            ], 403);
        }

        $request->validate([
            'id' => 'required|integer'
        ]);

        $poll = Poll::find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 403);
        }

        $alreadyVote = Vote::where('poll_id', $poll->id)
            ->where('user_id', $user->id)
            ->exists();

        $choice = Choise::where('id', $request->id)
            ->where('poll_id', $poll->id)
            ->first();

        if (!$choice) {
            return response()->json([
                "status"  => "not-found",
                "message" => "choice Not found"
            ], 403);
        }

        Vote::create([
            'choice_id'   => $choice->id,
            'user_id'     => $user->id,
            'poll_id'     => $poll->id,
            'division_id' => $user->division_id
        ]);

        return response()->json([
            "status"  => "success",
            "message" => "vote is added"
        ], 201);
    }


    public function checkUserVote(Request $request, $id)
    {
        $user = $request->user();

        $hasVoted = Vote::where('poll_id', $id)
            ->where('user_id', $user->id)
            ->exists();

        return response()->json([
            "hasVoted" => $hasVoted
        ]);
    }
}
