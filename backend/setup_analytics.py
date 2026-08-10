"""
Setup Analytics Script
One-time initialization to populate MongoDB with household and cohort data.

Run this ONCE after deploying backend:
    python backend/setup_analytics.py
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
import numpy as np
#from motor.motor_asyncio import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.analytics.household_analyzer import HouseholdAnalyzer
from app.analytics.cohort_analyzer import CohortAnalyzer
from app.config import settings

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def fetch_members_from_mongodb() -> pd.DataFrame:
    """
    Fetch all member records from MongoDB.
    
    Returns:
        DataFrame with member records + churn predictions
    """
    logger.info("Connecting to MongoDB...")
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    collection = db[settings.mongodb_collection_name]
    
    try:
        # Fetch all predictions
        cursor = collection.find({})
        members_data = await cursor.to_list(length=None)
        
        logger.info(f"✓ Fetched {len(members_data)} members from MongoDB")
        
        # Convert to DataFrame
        # Remove MongoDB-specific fields
        for doc in members_data:
            doc.pop('_id', None)  # Remove ObjectId
        
        members_df = pd.DataFrame(members_data)
        
        # Ensure required columns exist
        required_columns = [
            'member_id', 'age', 'tenure', 'balance', 'products_number',
            'credit_score', 'active_member', 'churn_probability', 'risk_bucket'
        ]
        
        missing_columns = [col for col in required_columns if col not in members_df.columns]
        if missing_columns:
            logger.warning(f"Missing columns: {missing_columns}")
            logger.warning("Using sample data instead...")
            client.close()
            return None
        
        logger.info(f"✓ DataFrame created with {len(members_df)} rows, {len(members_df.columns)} columns")
        
        client.close()
        return members_df
    
    except Exception as e:
        logger.error(f"Error fetching from MongoDB: {e}")
        client.close()
        return None


def create_sample_members() -> pd.DataFrame:
    """
    Create sample member data for testing (if MongoDB is empty).
    
    Returns:
        Sample DataFrame with 10,000 members
    """
    logger.warning("Creating sample member data...")
    
    np.random.seed(42)
    members = pd.DataFrame({
        'member_id': [f'MEM{str(i+1).zfill(6)}' for i in range(10000)],
        'age': np.random.randint(18, 97, 10000),
        'tenure': np.random.randint(0, 11, 10000),
        'balance': np.random.uniform(0, 250000, 10000),
        'products_number': np.random.randint(1, 5, 10000),
        'credit_score': np.random.randint(350, 851, 10000),
        'active_member': np.random.randint(0, 2, 10000),
        'churn_probability': np.random.uniform(0, 1, 10000),
        'risk_bucket': np.random.choice(['High Risk', 'Medium Risk', 'Low Risk', 'Safe'], 10000),
        'days_to_churn': np.random.choice([14, 45, 80, np.nan], 10000)
    })
    
    logger.info(f"✓ Created sample data with {len(members)} members")
    return members


async def save_households_to_mongodb(
    households_df: pd.DataFrame,
    household_mapping: dict
) -> bool:
    """
    Save household records to MongoDB.
    
    Args:
        households_df: Household metrics DataFrame
        household_mapping: member_id → household_id mapping
    
    Returns:
        True if successful
    """
    logger.info("Saving households to MongoDB...")
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    collection = db['households']
    
    try:
        # Convert DataFrame to list of dicts
        households_list = households_df.to_dict('records')
        
        # Insert
        result = await collection.insert_many(households_list)
        
        logger.info(f"✓ Inserted {len(result.inserted_ids)} households")
        
        # Also save household mapping in a separate collection for quick lookup
        mapping_collection = db['member_household_mapping']
        mapping_records = [
            {'member_id': member_id, 'household_id': household_id}
            for member_id, household_id in household_mapping.items()
        ]
        
        await mapping_collection.insert_many(mapping_records)
        logger.info(f"✓ Inserted {len(mapping_records)} member-household mappings")
        
        client.close()
        return True
    
    except Exception as e:
        logger.error(f"Error saving households: {e}")
        client.close()
        return False


async def save_cohorts_to_mongodb(
    cohort_records: list,
    assignments_df: pd.DataFrame
) -> bool:
    """
    Save cohort definitions and member assignments to MongoDB.
    
    Args:
        cohort_records: List of cohort definition dicts
        assignments_df: Member-to-cohort assignments DataFrame
    
    Returns:
        True if successful
    """
    logger.info("Saving cohorts to MongoDB...")
    
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    try:
        # Save cohort definitions
        cohorts_collection = db['cohorts']
        result = await cohorts_collection.insert_many(cohort_records)
        logger.info(f"✓ Inserted {len(result.inserted_ids)} cohort definitions")
        
        # Save member-to-cohort assignments
        assignments_collection = db['member_cohort_assignments']
        assignments_list = assignments_df.to_dict('records')
        result = await assignments_collection.insert_many(assignments_list)
        logger.info(f"✓ Inserted {len(result.inserted_ids)} member-cohort assignments")
        
        client.close()
        return True
    
    except Exception as e:
        logger.error(f"Error saving cohorts: {e}")
        client.close()
        return False


async def main():
    """
    Main initialization workflow.
    """
    print("\n" + "="*70)
    print("ANALYTICS SETUP - HOUSEHOLD & COHORT INITIALIZATION")
    print("="*70 + "\n")
    
    # Step 1: Load members
    logger.info("Step 1: Loading member data...")
    members_df = await fetch_members_from_mongodb()
    
    if members_df is None or len(members_df) == 0:
        logger.info("No data found in MongoDB, using sample data")
        members_df = create_sample_members()
    
    if members_df is None or len(members_df) == 0:
        logger.error("✗ Failed to load member data")
        return False
    
    logger.info(f"✓ Loaded {len(members_df)} members\n")
    
    # Step 2: Generate households
    logger.info("Step 2: Generating households...")
    household_analyzer = HouseholdAnalyzer()
    households_df, household_mapping = household_analyzer.generate_households_from_members(members_df)
    
    # Validate
    is_valid = household_analyzer.validate_household_data(
        households_df,
        household_mapping,
        members_df
    )
    
    if not is_valid:
        logger.error("✗ Household validation failed")
        return False
    
    logger.info(f"✓ Generated {len(households_df)} households\n")
    
    # Save households
    logger.info("Saving households to MongoDB...")
    success = await save_households_to_mongodb(households_df, household_mapping)
    if not success:
        logger.error("✗ Failed to save households")
        return False
    logger.info("✓ Households saved\n")
    
    # Step 3: Discover cohorts
    logger.info("Step 3: Discovering cohorts via K-Means clustering...")
    cohort_analyzer = CohortAnalyzer()
    kmeans, members_with_cohorts, scaler = cohort_analyzer.discover_cohorts(members_df)
    
    # Extract profiles
    cohort_profiles = cohort_analyzer.extract_cohort_profiles(members_with_cohorts)
    
    # Generate names
    cohort_names = cohort_analyzer.generate_cohort_names(cohort_profiles)
    
    # Create records
    cohort_records = cohort_analyzer.create_cohort_records(cohort_profiles, cohort_names)
    
    # Create assignments
    assignments_df = cohort_analyzer.assign_members_to_cohorts(members_with_cohorts, cohort_names)
    
    # Validate
    is_valid = cohort_analyzer.validate_cohort_data(
        members_with_cohorts,
        cohort_records,
        assignments_df
    )
    
    if not is_valid:
        logger.error("✗ Cohort validation failed")
        return False
    
    logger.info(f"✓ Discovered {len(cohort_records)} cohorts\n")
    
    # Save cohorts
    logger.info("Saving cohorts to MongoDB...")
    success = await save_cohorts_to_mongodb(cohort_records, assignments_df)
    if not success:
        logger.error("✗ Failed to save cohorts")
        return False
    logger.info("✓ Cohorts saved\n")
    
    # Summary
    print("\n" + "="*70)
    print("✓ ANALYTICS SETUP COMPLETE")
    print("="*70)
    print(f"\nSummary:")
    print(f"  Members processed: {len(members_df):,}")
    print(f"  Households created: {len(households_df):,}")
    print(f"  Cohorts discovered: {len(cohort_records)}")
    print(f"\nCohorts:")
    for cohort in sorted(cohort_records, key=lambda x: x['cohort_id']):
        size = cohort['characteristics']['member_count']
        pct = cohort['size_percentage']
        name = cohort['cohort_name']
        print(f"  {cohort['cohort_id']}: {name} ({size:,} members, {pct}%)")
    print("\nMongoDB Collections Created:")
    print("  - households")
    print("  - member_household_mapping")
    print("  - cohorts")
    print("  - member_cohort_assignments")
    print("\nYou can now use the API endpoints:")
    print("  GET /households")
    print("  GET /household/<household_id>")
    print("  GET /cohorts")
    print("  GET /cohort/<cohort_id>")
    print("\n" + "="*70 + "\n")
    
    return True


if __name__ == "__main__":
    # Run async main
    success = asyncio.run(main())
    
    if success:
        logger.info("✓ Setup completed successfully!")
        sys.exit(0)
    else:
        logger.error("✗ Setup failed!")
        sys.exit(1)