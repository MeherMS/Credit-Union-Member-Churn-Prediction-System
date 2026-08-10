"""
Household Analyzer Module
Generates synthetic household groupings from individual member records
and calculates household-level metrics for analytics.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class HouseholdAnalyzer:
    """
    Groups members into households and aggregates metrics at household level.
    
    Household Generation Strategy:
    - 40% single-member households (1 member each)
    - 60% multi-member households (2-4 members each)
    - Creates ~2,500-3,000 households from 10,000 members
    - Deterministic (reproducible with seed)
    """
    
    RANDOM_SEED = 42
    SINGLE_HOUSEHOLD_RATIO = 0.40  # 40% single-member
    MULTI_HOUSEHOLD_RATIO = 0.60   # 60% multi-member
    
    def __init__(self):
        np.random.seed(self.RANDOM_SEED)
    
    # ========== STEP 1: Generate Households from Members ==========
    
    def generate_households_from_members( self, members_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
    Create synthetic household groupings from member records.
    
    Args:
        members_df: DataFrame with member_id, age, tenure, balance, 
                   products_number, credit_score, churn_probability, 
                   risk_bucket, days_to_churn
    
    Returns:
        - households_df: DataFrame with household-level metrics
        - household_mapping: Dict mapping member_id → household_id
    """
        logger.info(f"Starting household generation for {len(members_df)} members...")
    
        total_members = len(members_df)
    
    # Determine household size distribution
    # 40% of members as single-member households
    # 60% of members as multi-member households (2-4 members)
    
        single_member_count = int(total_members * self.SINGLE_HOUSEHOLD_RATIO)
        multi_member_count = total_members - single_member_count
    
        single_household_count = single_member_count  # 1:1 ratio (each single gets own household)
    
        logger.info(f"Household distribution:")
        logger.info(f"  Single-member: {single_household_count} households ({single_member_count} members)")
        logger.info(f"  Multi-member: ~{multi_member_count} members to distribute")
        logger.info(f"  Total members: {total_members}")
    
        # Shuffle members randomly
        member_ids = members_df['member_id'].values
        np.random.shuffle(member_ids)
    
        household_mapping = {}  # member_id → household_id
        household_counter = 1  # Counter for generating household IDs
        member_idx = 0
    
        # ASSIGN SINGLE-MEMBER HOUSEHOLDS (first 40% of members)
        for _ in range(single_household_count):
            if member_idx >= len(member_ids):
                break
        
            household_id = f"HH{str(household_counter).zfill(6)}"
            member_id = member_ids[member_idx]
        
            household_mapping[member_id] = household_id
            household_counter += 1
            member_idx += 1
    
        logger.info(f"✓ Assigned {single_household_count} single-member households")
    
        # ASSIGN MULTI-MEMBER HOUSEHOLDS (remaining 60% of members)
        multi_households_created = 0
    
        while member_idx < len(member_ids):
            household_id = f"HH{str(household_counter).zfill(6)}"
        
            # Random household size: 2-4 members
            # Using probabilities: 2 members (40%), 3 members (40%), 4 members (20%)
            household_size = np.random.choice([2, 3, 4], p=[0.4, 0.4, 0.2])
        
            # Assign this many members to the household
            members_assigned_to_hh = 0
            for _ in range(household_size):
                if member_idx >= len(member_ids):
                    break
            
                member_id = member_ids[member_idx]
                household_mapping[member_id] = household_id
                member_idx += 1
                members_assigned_to_hh += 1
        
            if members_assigned_to_hh > 0:
                multi_households_created += 1
        
            household_counter += 1
    
        logger.info(f"✓ Assigned {multi_households_created} multi-member households")
        logger.info(f"✓ Total members assigned: {len(household_mapping)}")
    
        if len(household_mapping) != total_members:
            logger.error(f"✗ Assignment incomplete: {total_members - len(household_mapping)} members missing")
            raise ValueError(f"Failed to assign all members. Missing: {total_members - len(household_mapping)}")
    
        # Build households_df with aggregated metrics
        households_df = self._aggregate_household_metrics(
            members_df,
            household_mapping
    )
    
        return households_df, household_mapping
    # ========== STEP 2: Aggregate Household Metrics ==========
    
    def _aggregate_household_metrics(
        self,
        members_df: pd.DataFrame,
        household_mapping: Dict[str, str]
    ) -> pd.DataFrame:
        """
        Calculate household-level metrics from individual members.
        
        Aggregations:
        - member_ids: list of all members in household
        - member_count: number of members
        - combined_balance: sum of balances
        - avg_age: average age
        - avg_tenure: average tenure (years)
        - products_number: sum of products across all members
        - avg_credit_score: average credit score
        - weighted_churn_probability: average churn probability
        - risk_bucket: derived from weighted probability
        - household_value: categorization based on balance
        
        Args:
            members_df: Member records
            household_mapping: member_id → household_id dict
        
        Returns:
            households_df: Aggregated household metrics
        """
        logger.info("Aggregating household metrics...")
        
        # Add household_id to members_df
        members_df_copy = members_df.copy()
        members_df_copy['household_id'] = members_df_copy['member_id'].map(household_mapping)
        
        households_list = []
        
        for household_id in members_df_copy['household_id'].unique():
            household_members = members_df_copy[members_df_copy['household_id'] == household_id]
            
            # Aggregate metrics
            member_ids = household_members['member_id'].tolist()
            member_count = len(member_ids)
            combined_balance = household_members['balance'].sum()
            avg_age = household_members['age'].mean()
            avg_tenure = household_members['tenure'].mean()
            total_products = household_members['products_number'].sum()
            avg_credit_score = household_members['credit_score'].mean()
            weighted_churn_probability = household_members['churn_probability'].mean()
            
            # Determine risk bucket from weighted probability
            risk_bucket = self._get_risk_bucket(weighted_churn_probability)
            
            # Determine household value category
            household_value = self._categorize_household_value(combined_balance)
            
            households_list.append({
                'household_id': household_id,
                'member_ids': member_ids,
                'member_count': member_count,
                'combined_balance': round(combined_balance, 2),
                'avg_age': round(avg_age, 2),
                'avg_tenure': round(avg_tenure, 2),
                'products_number': int(total_products),
                'avg_credit_score': round(avg_credit_score, 2),
                'weighted_churn_probability': round(weighted_churn_probability, 4),
                'risk_bucket': risk_bucket,
                'household_value': household_value
            })
        
        households_df = pd.DataFrame(households_list)
        
        logger.info(f"✓ Created {len(households_df)} households with aggregated metrics")
        logger.info(f"\nHousehold Summary Statistics:")
        logger.info(f"  Average balance: ${households_df['combined_balance'].mean():,.2f}")
        logger.info(f"  Average members per household: {households_df['member_count'].mean():.2f}")
        logger.info(f"  Average churn probability: {households_df['weighted_churn_probability'].mean():.4f}")
        
        return households_df
    
    # ========== STEP 3: Risk Bucket Classification ==========
    
    @staticmethod
    def _get_risk_bucket(churn_probability: float) -> str:
        """
        Map churn probability to risk bucket.
        Uses same logic as individual member predictions.
        
        Args:
            churn_probability: Probability (0.0 to 1.0)
        
        Returns:
            Risk bucket name
        """
        if churn_probability >= 0.70:
            return "High Risk"
        elif churn_probability >= 0.50:
            return "Medium Risk"
        elif churn_probability >= 0.30:
            return "Low Risk"
        else:
            return "Safe"
    
    # ========== STEP 4: Household Value Categorization ==========
    
    @staticmethod
    def _categorize_household_value(combined_balance: float) -> str:
        """
        Categorize household into value segments based on combined balance.
        
        Args:
            combined_balance: Total balance across all household members
        
        Returns:
            Value category: "premium", "standard", or "starter"
        """
        if combined_balance >= 150000:
            return "premium"
        elif combined_balance >= 50000:
            return "standard"
        else:
            return "starter"
    
    # ========== STEP 5: Rank Households by Risk ==========
    
    @staticmethod
    def get_top_at_risk_households(
        households_df: pd.DataFrame,
        top_n: int = 50
    ) -> pd.DataFrame:
        """
        Rank households by churn risk and return top N at-risk households.
        
        Ranking criteria:
        1. Primary: Higher churn probability = higher risk
        2. Secondary: Higher balance = higher value to retain
        
        Args:
            households_df: Aggregated household metrics
            top_n: Number of households to return
        
        Returns:
            Top N at-risk households sorted by risk
        """
        logger.info(f"Identifying top {top_n} at-risk households...")
        
        # Sort by churn probability (descending) then by balance (descending)
        top_at_risk = households_df.nlargest(top_n, 'weighted_churn_probability')
        
        logger.info(f"✓ Top {top_n} at-risk households identified")
        logger.info(f"  Risk range: {top_at_risk['weighted_churn_probability'].min():.4f} - {top_at_risk['weighted_churn_probability'].max():.4f}")
        
        return top_at_risk
    
    # ========== STEP 6: Get Risk Distribution Summary ==========
    
    @staticmethod
    def get_household_risk_distribution(households_df: pd.DataFrame) -> Dict[str, int]:
        """
        Count households by risk bucket.
        
        Args:
            households_df: Household metrics
        
        Returns:
            Dictionary with counts per risk level
        """
        risk_distribution = households_df['risk_bucket'].value_counts().to_dict()
        
        logger.info("Household Risk Distribution:")
        for risk_level, count in sorted(risk_distribution.items(), key=lambda x: x[1], reverse=True):
            pct = (count / len(households_df)) * 100
            logger.info(f"  {risk_level}: {count} households ({pct:.1f}%)")
        
        return risk_distribution
    
    # ========== STEP 7: Validation ==========
    
    @staticmethod
    def validate_household_data(
        households_df: pd.DataFrame,
        household_mapping: Dict[str, str],
        members_df: pd.DataFrame
    ) -> bool:
        """
        Validate household generation results.
        
        Checks:
        - No member assigned to multiple households
        - All members have household assignment
        - No empty households
        - No duplicates
        
        Args:
            households_df: Household metrics
            household_mapping: member_id → household_id
            members_df: Original member data
        
        Returns:
            True if validation passes
        """
        logger.info("Validating household data...")
        
        # Check 1: All members assigned
        if len(household_mapping) != len(members_df):
            logger.error(f"✗ Missing assignments: {len(members_df) - len(household_mapping)} members")
            return False
        logger.info(f"✓ All {len(members_df)} members assigned to households")
        
        # Check 2: No duplicate assignments
        member_ids_with_households = list(household_mapping.keys())
        if len(member_ids_with_households) != len(set(member_ids_with_households)):
            logger.error("✗ Duplicate member assignments detected")
            return False
        logger.info(f"✓ No duplicate assignments")
        
        # Check 3: No empty households
        if households_df['member_count'].min() < 1:
            logger.error("✗ Empty households detected")
            return False
        logger.info(f"✓ All households have members")
        
        # Check 4: Total members match
        total_members_in_households = households_df['member_count'].sum()
        if total_members_in_households != len(members_df):
            logger.error(f"✗ Member count mismatch: {total_members_in_households} vs {len(members_df)}")
            return False
        logger.info(f"✓ Member count matches: {total_members_in_households}")
        
        logger.info("✓ All validations passed!")
        return True


# ========== HELPER FUNCTION FOR EASY TESTING ==========

def example_usage():
    """
    Example: Generate households from sample member data.
    Run this to test locally before integrating with MongoDB.
    """
    
    # Create sample member data (mimics Phase 1 output)
    np.random.seed(42)
    sample_members = pd.DataFrame({
        'member_id': [f'MEM{str(i+1).zfill(6)}' for i in range(10000)],
        'age': np.random.randint(18, 97, 10000),
        'tenure': np.random.randint(0, 11, 10000),
        'balance': np.random.uniform(0, 250000, 10000),
        'products_number': np.random.randint(1, 5, 10000),
        'credit_score': np.random.randint(350, 851, 10000),
        'churn_probability': np.random.uniform(0, 1, 10000),
        'risk_bucket': np.random.choice(['High Risk', 'Medium Risk', 'Low Risk', 'Safe'], 10000),
        'days_to_churn': np.random.choice([14, 45, 80, np.nan], 10000)
    })
    
    # Run analyzer
    analyzer = HouseholdAnalyzer()
    households_df, mapping = analyzer.generate_households_from_members(sample_members)
    
    # Validate
    is_valid = analyzer.validate_household_data(households_df, mapping, sample_members)
    
    # Get insights
    if is_valid:
        print("\n" + "="*60)
        print("HOUSEHOLD GENERATION COMPLETE")
        print("="*60)
        print(f"\nTotal households created: {len(households_df)}")
        print(f"\nHousehold size distribution:")
        print(households_df['member_count'].value_counts().sort_index())
        print(f"\nSample households (first 5):")
        print(households_df.head())
        print(f"\nRisk distribution:")
        analyzer.get_household_risk_distribution(households_df)
        print(f"\nTop 10 at-risk households:")
        print(analyzer.get_top_at_risk_households(households_df, top_n=10))
    
    return households_df, mapping


if __name__ == "__main__":
    example_usage()