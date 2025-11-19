def test_ping(client):
    res = client.get('/ping')
    assert res.status_code == 200
    assert res.get_json().get('message') == 'pong'


def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json().get('status') == 'healthy'


def test_supabase_health_shape(client):
    res = client.get('/supabase/health')
    assert res.status_code == 200
    data = res.get_json()
    for key in [
        'configured', 'url_present', 'key_present', 'key_type',
        'client_created', 'client_error', 'auth', 'storage_buckets', 'status'
    ]:
        assert key in data
