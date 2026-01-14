<h2>Welcome, {{ $user['name'] }}</h2>
<p>Email: {{ $user['email'] }}</p>

<form method="POST" action="/logout">
    @csrf
    <button type="submit">Logout</button>
</form>

