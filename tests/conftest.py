import pytest
from application import application as app


@pytest.fixture()
def client():
    app.testing = True
    with app.test_client() as client:
        yield client
