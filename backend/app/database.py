from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDBManager:
    """Async MongoDB connection manager"""
    
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None
    collection: AsyncIOMotorCollection = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB Atlas"""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            cls.database = cls.client[settings.mongodb_db_name]
            cls.collection = cls.database[settings.mongodb_collection_name]
            
            # Test connection
            await cls.client.admin.command('ping')
            logger.info("✅ Connected to MongoDB Atlas")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("✅ Closed MongoDB connection")

    @classmethod
    async def insert_prediction(cls, prediction_data: dict):
        """Insert a single prediction into the collection"""
        try:
            result = await cls.collection.insert_one(prediction_data)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error inserting prediction: {e}")
            raise

    @classmethod
    async def get_prediction_by_id(cls, member_id: str):
        """Get prediction by member ID"""
        try:
            prediction = await cls.collection.find_one({"member_id": member_id})
            return prediction
        except Exception as e:
            logger.error(f"Error fetching prediction: {e}")
            return None

    @classmethod
    async def get_all_predictions(cls, skip: int = 0, limit: int = 100):
        """Get all predictions with pagination"""
        try:
            predictions = await cls.collection.find().skip(skip).limit(limit).to_list(length=limit)
            return predictions
        except Exception as e:
            logger.error(f"Error fetching predictions: {e}")
            return []

    @classmethod
    async def get_predictions_by_risk_level(cls, min_prob: float = None, max_prob: float = None, country: str = None):
        """Get predictions filtered by risk level and country"""
        try:
            query = {}
            
            if min_prob is not None:
                query["churn_probability"] = {"$gte": min_prob}
            if max_prob is not None:
                if "churn_probability" in query:
                    query["churn_probability"]["$lte"] = max_prob
                else:
                    query["churn_probability"] = {"$lte": max_prob}
            if country:
                query["country"] = country
            
            predictions = await cls.collection.find(query).to_list(length=None)
            return predictions
        except Exception as e:
            logger.error(f"Error fetching filtered predictions: {e}")
            return []

    @classmethod
    async def count_by_risk_bucket(cls):
        """Count predictions by risk bucket"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$risk_bucket",
                        "count": {"$sum": 1}
                    }
                }
            ]
            results = await cls.collection.aggregate(pipeline).to_list(length=None)
            return results
        except Exception as e:
            logger.error(f"Error counting by risk bucket: {e}")
            return []