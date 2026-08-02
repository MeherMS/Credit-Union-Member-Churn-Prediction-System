import asyncio
import os
from datetime import datetime
# Fix import here:
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv('MONGODB_URL')
DB_NAME = os.getenv('MONGODB_DB_NAME', 'Credit_Union_Member_Churn')
COLLECTION_NAME = 'Credit_Union_Member_Churn'

async def populate_mongodb():
    """Insert sample predictions into MongoDB"""
    
    # Fix client instantiation here:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    print(f"🔗 Connected to MongoDB")
    print(f"   Database: {DB_NAME}")
    print(f"   Collection: {COLLECTION_NAME}")
    
    # Sample predictions from our bulk job
    sample_predictions = [
        {
            "member_id": "MEM001",
            "credit_score": 650,
            "country": "France",
            "gender": "M",
            "age": 35,
            "tenure": 8,
            "balance": 50000,
            "products_number": 2,
            "credit_card": 1,
            "active_member": 1,
            "estimated_salary": 75000,
            "churn_probability": 0.23,
            "risk_bucket": "Low Risk",
            "days_to_churn": 80,
            "prediction": 0,
            "created_at": datetime.now()
        },
        {
            "member_id": "MEM002",
            "credit_score": 720,
            "country": "Germany",
            "gender": "F",
            "age": 42,
            "tenure": 12,
            "balance": 120000,
            "products_number": 3,
            "credit_card": 1,
            "active_member": 1,
            "estimated_salary": 85000,
            "churn_probability": 0.65,
            "risk_bucket": "Medium Risk",
            "days_to_churn": 45,
            "prediction": 1,
            "created_at": datetime.now()
        },
        {
            "member_id": "MEM003",
            "credit_score": 580,
            "country": "Spain",
            "gender": "M",
            "age": 28,
            "tenure": 2,
            "balance": 15000,
            "products_number": 1,
            "credit_card": 0,
            "active_member": 0,
            "estimated_salary": 45000,
            "churn_probability": 0.72,
            "risk_bucket": "High Risk",
            "days_to_churn": 14,
            "prediction": 1,
            "created_at": datetime.now()
        },
        {
            "member_id": "MEM004",
            "credit_score": 800,
            "country": "France",
            "gender": "M",
            "age": 55,
            "tenure": 15,
            "balance": 250000,
            "products_number": 4,
            "credit_card": 1,
            "active_member": 1,
            "estimated_salary": 150000,
            "churn_probability": 0.15,
            "risk_bucket": "Safe",
            "days_to_churn": None,
            "prediction": 0,
            "created_at": datetime.now()
        },
        {
            "member_id": "MEM005",
            "credit_score": 500,
            "country": "Germany",
            "gender": "F",
            "age": 25,
            "tenure": 0,
            "balance": 0,
            "products_number": 1,
            "credit_card": 0,
            "active_member": 0,
            "estimated_salary": 35000,
            "churn_probability": 0.78,
            "risk_bucket": "High Risk",
            "days_to_churn": 14,
            "prediction": 1,
            "created_at": datetime.now()
        }
    ]
    
    try:
        # Insert predictions
        result = await collection.insert_many(sample_predictions)
        
        print(f"\n✅ Successfully inserted {len(result.inserted_ids)} predictions")
        for i, pred_id in enumerate(result.inserted_ids):
            print(f"   {i+1}. ID: {pred_id}")
        
        # Verify
        count = await collection.count_documents({})
        print(f"\n✅ Total predictions in collection: {count}")
        
        # Show summary
        high_risk = await collection.count_documents({"risk_bucket": "High Risk"})
        medium_risk = await collection.count_documents({"risk_bucket": "Medium Risk"})
        low_risk = await collection.count_documents({"risk_bucket": "Low Risk"})
        safe = await collection.count_documents({"risk_bucket": "Safe"})
        
        print(f"\n📊 Risk Distribution:")
        print(f"   High Risk: {high_risk}")
        print(f"   Medium Risk: {medium_risk}")
        print(f"   Low Risk: {low_risk}")
        print(f"   Safe: {safe}")
        
        print(f"\n✅ MongoDB populated successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        client.close()

# Run it
if __name__ == "__main__":
    asyncio.run(populate_mongodb())