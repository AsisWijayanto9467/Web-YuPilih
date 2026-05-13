<!DOCTYPE html>
<html>
<head>
    <title>Poll Report - {{ $poll->title }}</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .percentage-bar { background: #4CAF50; height: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Polling Report</h2>
        <h3>{{ $poll->title }}</h3>
        <p>{{ $poll->description }}</p>
        <p>Date: {{ $poll->created_at->format('Y-m-d H:i:s') }}</p>
    </div>

    <div class="section">
        <h4>Results</h4>
        <table>
            <thead>
                <tr>
                    <th>Choice</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($results as $result)
                <tr>
                    <td>{{ $result['choice'] }}</td>
                    <td>{{ $result['vote_count'] }}</td>
                    <td>
                        <div class="percentage-bar" style="width: {{ $result['percentage'] }}%;"></div>
                        {{ $result['percentage'] }}%
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h4>Voters List</h4>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Division</th>
                    <th>Choice</th>
                    <th>Voted At</th>
                </tr>
            </thead>
            <tbody>
                @foreach($voters as $voter)
                <tr>
                    <td>{{ $voter['username'] }}</td>
                    <td>{{ $voter['division'] }}</td>
                    <td>{{ $voter['choice'] }}</td>
                    <td>{{ $voter['voted_at'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
