<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Choise;
use App\Models\Poll;
use App\Models\Vote;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PollController extends Controller
{
    public function getAllPool(Request $request)
    {
        $query = Poll::select("id", 'title', 'description', 'created_at', 'deadline');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['title', 'created_at', 'deadline'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = (int) $request->get('per_page', 10);
        $polls = $query->paginate($perPage);

        // Return data langsung tanpa format
        return response()->json([
            "totalPooling" => $polls->total(),
            "contents" => $polls->items(), // Langsung return items tanpa map
            "pagination" => [
                "current_page" => $polls->currentPage(),
                "last_page" => $polls->lastPage(),
                "per_page" => $polls->perPage(),
                "total" => $polls->total(),
                "from" => $polls->firstItem(),
                "to" => $polls->lastItem()
            ]
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

     public function poolReport(Request $request, $id)
    {
        $poll = Poll::with(['choices.votes.user.division', 'user'])
            ->find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 404);
        }

        $totalVotes = $poll->votes()->count();

        // Get all voters with their details
        $voters = Vote::with(['user.division', 'choice'])
            ->where('poll_id', $poll->id)
            ->get()
            ->map(function ($vote) {
                return [
                    "vote_id"     => $vote->id,
                    "username"    => $vote->user->username,
                    "division"    => $vote->user->division->name ?? 'No Division',
                    "choice"      => $vote->choice->choice,
                    "voted_at"    => $vote->created_at
                ];
            });

        // Get results per choice with percentage
        $results = $poll->choices->map(function ($choice) use ($totalVotes) {
            $voteCount = $choice->votes->count();
            $percentage = $totalVotes > 0
                ? round(($voteCount / $totalVotes) * 100, 2)
                : 0;

            return [
                "choice_id"    => (string) $choice->id,
                "choice"       => $choice->choice,
                "vote_count"   => $voteCount,
                "percentage"   => $percentage
            ];
        });

        // Get votes per division
        $divisionVotes = Vote::with('division')
            ->where('poll_id', $poll->id)
            ->get()
            ->groupBy('division_id')
            ->map(function ($votes, $divisionId) {
                $division = $votes->first()->division;
                return [
                    "division_id"   => $divisionId,
                    "division_name" => $division->name ?? 'Unknown',
                    "total_votes"   => $votes->count()
                ];
            })->values();

        return response()->json([
            "poll" => [
                "id"          => $poll->id,
                "title"       => $poll->title,
                "description" => $poll->description,
                "deadline"    => $poll->deadline,
                "created_by"  => $poll->user->username ?? 'Unknown',
                "created_at"  => $poll->created_at
            ],
            "summary" => [
                "total_voters"    => $totalVotes,
                "total_choices"   => $poll->choices->count(),
                "total_divisions" => $divisionVotes->count()
            ],
            "results"           => $results,
            "voters"            => $voters,
            "votes_per_division"=> $divisionVotes
        ], 200);
    }

    /**
     * Download report as PDF
     */
    public function downloadReportPDF(Request $request, $id)
    {
        $poll = Poll::with(['choices.votes.user.division', 'user'])
            ->find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 404);
        }

        $totalVotes = $poll->votes()->count();

        // Get results per choice
        $results = $poll->choices->map(function ($choice) use ($totalVotes) {
            $voteCount = $choice->votes->count();
            $percentage = $totalVotes > 0
                ? round(($voteCount / $totalVotes) * 100, 2)
                : 0;

            return [
                "choice"     => $choice->choice,
                "vote_count" => $voteCount,
                "percentage" => $percentage
            ];
        });

        // Get voters
        $voters = Vote::with(['user.division', 'choice'])
            ->where('poll_id', $poll->id)
            ->get()
            ->map(function ($vote) {
                return [
                    "username" => $vote->user->username,
                    "division" => $vote->user->division->name ?? 'No Division',
                    "choice"   => $vote->choice->choice,
                    "voted_at" => $vote->created_at
                ];
            });

        // Using Laravel PDF package
        $pdf = Pdf::loadView('reports.poll-report', [
            'poll'    => $poll,
            'results' => $results,
            'voters'  => $voters,
            'totalVotes' => $totalVotes
        ]);

        return $pdf->download("poll-report-{$poll->id}.pdf");
    }

    /**
     * Download report as CSV
     */
    public function downloadReportCSV(Request $request, $id)
    {
        $poll = Poll::with(['choices.votes.user.division'])
            ->find($id);

        if (!$poll) {
            return response()->json([
                "status"  => "not-found",
                "message" => "Pool Not found"
            ], 404);
        }

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=poll-report-{$poll->id}.csv",
        ];

        $callback = function() use ($poll) {
            $file = fopen('php://output', 'w');

            // Add header
            fputcsv($file, ['Polling Report']);
            fputcsv($file, ['Title:', $poll->title]);
            fputcsv($file, ['Description:', $poll->description]);
            fputcsv($file, ['Date:', $poll->created_at->format('Y-m-d H:i:s')]);
            fputcsv($file, ['']);

            // Results section
            fputcsv($file, ['RESULTS']);
            fputcsv($file, ['Choice', 'Votes', 'Percentage']);

            foreach ($poll->choices as $choice) {
                $voteCount = $choice->votes->count();
                $totalVotes = $poll->votes()->count();
                $percentage = $totalVotes > 0
                    ? round(($voteCount / $totalVotes) * 100, 2)
                    : 0;

                fputcsv($file, [
                    $choice->choice,
                    $voteCount,
                    $percentage . '%'
                ]);
            }

            fputcsv($file, ['']);

            // Voters section
            fputcsv($file, ['VOTERS LIST']);
            fputcsv($file, ['Username', 'Division', 'Choice', 'Voted At']);

            $voters = Vote::with(['user.division', 'choice'])
                ->where('poll_id', $poll->id)
                ->get();

            foreach ($voters as $vote) {
                fputcsv($file, [
                    $vote->user->username,
                    $vote->user->division->name ?? 'No Division',
                    $vote->choice->choice,
                    $vote->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
