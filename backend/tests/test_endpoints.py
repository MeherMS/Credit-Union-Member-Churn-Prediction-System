import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml_pipeline import MLPipeline

client = TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "model_loaded" in data

class TestPredictEndpoint:
    """Test single prediction endpoint"""
    
    @pytest.fixture
    def sample_request(self):
        return {
            "credit_score": 650,
            "country": "France",
            "gender": "M",
            "age": 35,
            "tenure": 8,
            "balance": 50000,
            "products_number": 2,
            "credit_card": 1,
            "active_member": 1,
            "estimated_salary": 75000
        }
    
    def test_predict_valid_request(self, sample_request):
        response = client.post("/predict", json=sample_request)
        assert response.status_code == 200
        data = response.json()
        
        assert "churn_probability" in data
        assert "risk_bucket" in data
        assert "prediction" in data
        assert 0 <= data["churn_probability"] <= 1

    def test_predict_missing_field(self):
        incomplete_request = {
            "credit_score": 650,
            "country": "France",
            # Missing other fields
        }
        response = client.post("/predict", json=incomplete_request)
        assert response.status_code == 422  # Validation error

class TestRootEndpoint:
    """Test root endpoint"""
    
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data

class TestBulkPredictEndpoint:
    """Test bulk prediction endpoint"""
    
    def test_bulk_predict_no_file(self):
        response = client.post("/bulk_predict")
        assert response.status_code == 422  # Missing file

    def test_bulk_predict_invalid_csv(self):
        # Create invalid CSV content
        invalid_csv = b"invalid,data\n1,2"
        response = client.post(
            "/bulk_predict",
            files={"file": ("test.csv", invalid_csv)}
        )
        # Should return 400 for schema validation
        assert response.status_code in [400, 422]

class TestStatsEndpoint:
    """Test statistics endpoint"""
    
    def test_risk_distribution(self):
        response = client.get("/stats/risk_distribution")
        # May return 400 if no data in DB, that's OK for empty DB
        assert response.status_code in [200, 400]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])