"""
Cohort Analyzer Module
Discovers behavioral cohorts using K-Means clustering and generates
auto-labeled cohort profiles for customer segmentation.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


class CohortAnalyzer:
    """
    Segments members into behavioral cohorts using K-Means clustering.
    
    Cohort Generation Strategy:
    - Uses 5 behavioral features: tenure, active_member, products_number, balance, credit_score
    - K-Means clustering with k=6 cohorts
    - Auto-generates human-readable cohort names based on cluster characteristics
    - Creates cohort profiles (mean values for each feature per cohort)
    """
    
    RANDOM_SEED = 42
    N_CLUSTERS = 6
    CLUSTERING_FEATURES = [
        'tenure',
        'active_member',
        'products_number',
        'balance',
        'credit_score'
    ]
    
    def __init__(self):
        np.random.seed(self.RANDOM_SEED)
    
    # ========== STEP 1: Discover Cohorts via K-Means ==========
    
    def discover_cohorts(
        self,
        members_df: pd.DataFrame
    ) -> Tuple[KMeans, pd.DataFrame, StandardScaler]:
        """
        Apply K-Means clustering to discover behavioral cohorts.
        
        Process:
        1. Select clustering features
        2. Normalize features (StandardScaler)
        3. Fit K-Means with k=6
        4. Extract cluster assignments
        
        Args:
            members_df: Member records with required features
        
        Returns:
            - kmeans_model: Trained KMeans model
            - members_with_cohorts: Members + cohort_id column
            - scaler: Fitted StandardScaler (needed for future predictions)
        """
        logger.info(f"Starting cohort discovery for {len(members_df)} members...")
        logger.info(f"Clustering features: {self.CLUSTERING_FEATURES}")
        
        # Extract clustering features
        X = members_df[self.CLUSTERING_FEATURES].copy()
        
        # Handle any missing values (shouldn't be any, but safe check)
        if X.isnull().sum().sum() > 0:
            logger.warning(f"Found missing values, filling with median...")
            X = X.fillna(X.median())
        
        logger.info(f"Feature statistics before normalization:")
        for col in self.CLUSTERING_FEATURES:
            logger.info(f"  {col}: mean={X[col].mean():.2f}, std={X[col].std():.2f}")
        
        # Normalize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        logger.info(f"✓ Features normalized (mean≈0, std≈1)")
        
        # Fit K-Means
        logger.info(f"Fitting K-Means with k={self.N_CLUSTERS}...")
        kmeans = KMeans(
            n_clusters=self.N_CLUSTERS,
            random_state=self.RANDOM_SEED,
            n_init=10,  # Multiple initializations for stability
            max_iter=300
        )
        cohort_ids = kmeans.fit_predict(X_scaled)
        
        logger.info(f"✓ K-Means converged")
        logger.info(f"Inertia (sum of squared distances): {kmeans.inertia_:.2f}")
        
        # Add cohort assignments to members
        members_with_cohorts = members_df.copy()
        members_with_cohorts['cohort_id'] = cohort_ids
        
        # Log cohort sizes
        cohort_sizes = members_with_cohorts['cohort_id'].value_counts().sort_index()
        logger.info(f"\nCohort Sizes:")
        for cohort_id, size in cohort_sizes.items():
            pct = (size / len(members_with_cohorts)) * 100
            logger.info(f"  Cohort {cohort_id}: {size} members ({pct:.1f}%)")
        
        return kmeans, members_with_cohorts, scaler
    
    # ========== STEP 2: Extract Cohort Profiles ==========
    
    def extract_cohort_profiles(
        self,
        members_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate mean/median statistics for each cohort.
        Used to create cohort descriptions and auto-generate names.
        
        Args:
            members_df: Members with cohort_id column
        
        Returns:
            cohort_profiles: DataFrame with mean values per cohort
        """
        logger.info("Extracting cohort profiles...")
        
        profiles = []
        
        for cohort_id in sorted(members_df['cohort_id'].unique()):
            cohort_members = members_df[members_df['cohort_id'] == cohort_id]
            
            profile = {
                'cohort_id': cohort_id,
                'member_count': len(cohort_members),
                'avg_tenure': cohort_members['tenure'].mean(),
                'avg_age': cohort_members['age'].mean(),
                'avg_balance': cohort_members['balance'].mean(),
                'avg_products': cohort_members['products_number'].mean(),
                'avg_credit_score': cohort_members['credit_score'].mean(),
                'avg_active_member': cohort_members['active_member'].mean(),  # % active
                'avg_churn_probability': cohort_members['churn_probability'].mean(),
                'pct_high_risk': (cohort_members['risk_bucket'] == 'High Risk').sum() / len(cohort_members) * 100,
                'pct_medium_risk': (cohort_members['risk_bucket'] == 'Medium Risk').sum() / len(cohort_members) * 100,
                'pct_low_risk': (cohort_members['risk_bucket'] == 'Low Risk').sum() / len(cohort_members) * 100,
                'pct_safe': (cohort_members['risk_bucket'] == 'Safe').sum() / len(cohort_members) * 100
            }
            
            profiles.append(profile)
        
        cohort_profiles = pd.DataFrame(profiles)
        
        logger.info(f"✓ Extracted profiles for {len(cohort_profiles)} cohorts")
        logger.info(f"\nCohort Profiles Summary:")
        print(cohort_profiles.to_string())
        
        return cohort_profiles
    
    # ========== STEP 3: Auto-Generate Cohort Names ==========
    
    @staticmethod
    def generate_cohort_names(cohort_profiles: pd.DataFrame) -> Dict[int, str]:
        """
        Auto-generate human-readable names based on cluster characteristics.
        
        Naming Logic:
        - Compare each cohort's metrics to overall averages
        - Identify distinctive traits (high/low tenure, balance, activity, risk)
        - Create descriptive names
        
        Args:
            cohort_profiles: DataFrame with cohort statistics
        
        Returns:
            Dictionary mapping cohort_id → cohort_name
        """
        logger.info("Auto-generating cohort names...")
        
        # Calculate overall statistics
        overall_tenure = cohort_profiles['avg_tenure'].mean()
        overall_balance = cohort_profiles['avg_balance'].mean()
        overall_products = cohort_profiles['avg_products'].mean()
        overall_active = cohort_profiles['avg_active_member'].mean()
        overall_churn = cohort_profiles['avg_churn_probability'].mean()
        
        cohort_names = {}
        
        for _, row in cohort_profiles.iterrows():
            cohort_id = int(row['cohort_id'])
            
            tenure = row['avg_tenure']
            balance = row['avg_balance']
            products = row['avg_products']
            active = row['avg_active_member']
            churn_prob = row['avg_churn_probability']
            
            # Compare to averages
            tenure_diff = (tenure - overall_tenure) / overall_tenure if overall_tenure > 0 else 0
            balance_diff = (balance - overall_balance) / overall_balance if overall_balance > 0 else 0
            products_diff = (products - overall_products) / overall_products if overall_products > 0 else 0
            active_diff = (active - overall_active) / overall_active if overall_active > 0 else 0
            churn_diff = (churn_prob - overall_churn) / overall_churn if overall_churn > 0 else 0
            
            # Generate name based on key differentiators
            traits = []
            
            # Tenure trait
            if tenure_diff > 0.3:
                traits.append("Loyal")
            elif tenure_diff < -0.3:
                traits.append("New")
            
            # Balance trait
            if balance_diff > 0.3:
                traits.append("Affluent")
            elif balance_diff < -0.3:
                traits.append("Budget-Conscious")
            
            # Activity trait
            if active_diff > 0.3:
                traits.append("Engaged")
            elif active_diff < -0.3:
                traits.append("Dormant")
            
            # Products trait
            if products_diff > 0.3:
                traits.append("Power User")
            elif products_diff < -0.3:
                traits.append("Single-Product")
            
            # Churn risk trait
            if churn_diff > 0.3:
                traits.append("At-Risk")
            elif churn_diff < -0.3:
                traits.append("Stable")
            
            # Create name from traits
            if len(traits) == 0:
                cohort_names[cohort_id] = "Mainstream"
            elif len(traits) == 1:
                cohort_names[cohort_id] = traits[0]
            else:
                # Take best 2-3 traits
                priority_traits = []
                
                # Prioritize by business relevance
                priority_order = ["Loyal", "New", "At-Risk", "Dormant", "Affluent", 
                                "Budget-Conscious", "Engaged", "Power User", "Stable", "Single-Product"]
                
                for trait in priority_order:
                    if trait in traits:
                        priority_traits.append(trait)
                        if len(priority_traits) == 2:
                            break
                
                cohort_names[cohort_id] = " ".join(priority_traits)
        
        logger.info(f"\nAuto-Generated Cohort Names:")
        for cohort_id in sorted(cohort_names.keys()):
            logger.info(f"  Cohort {cohort_id}: {cohort_names[cohort_id]}")
        
        return cohort_names
    
    # ========== STEP 4: Create Cohort Records for Storage ==========
    
    def create_cohort_records(
        self,
        cohort_profiles: pd.DataFrame,
        cohort_names: Dict[int, str]
    ) -> List[Dict[str, Any]]:
        """
        Create cohort records ready for MongoDB storage.
        
        Each record includes:
        - Cohort ID, name, description
        - Characteristic statistics
        - Risk distribution
        - Member count
        
        Args:
            cohort_profiles: Extracted cohort profiles
            cohort_names: Auto-generated names
        
        Returns:
            List of cohort dictionaries for MongoDB
        """
        logger.info("Creating cohort records for storage...")
        
        cohort_records = []
        
        for _, row in cohort_profiles.iterrows():
            cohort_id = int(row['cohort_id'])
            cohort_name = cohort_names[cohort_id]
            
            # Create description from characteristics
            description = self._generate_cohort_description(row, cohort_name)
            
            cohort_record = {
                'cohort_id': cohort_id,
                'cohort_name': cohort_name,
                'description': description,
                'characteristics': {
                    'avg_tenure': round(row['avg_tenure'], 2),
                    'avg_age': round(row['avg_age'], 2),
                    'avg_balance': round(row['avg_balance'], 2),
                    'avg_products': round(row['avg_products'], 2),
                    'avg_credit_score': round(row['avg_credit_score'], 2),
                    'avg_active_member_rate': round(row['avg_active_member'] * 100, 1),
                    'member_count': int(row['member_count'])
                },
                'risk_profile': {
                    'avg_churn_probability': round(row['avg_churn_probability'], 4),
                    'pct_high_risk': round(row['pct_high_risk'], 1),
                    'pct_medium_risk': round(row['pct_medium_risk'], 1),
                    'pct_low_risk': round(row['pct_low_risk'], 1),
                    'pct_safe': round(row['pct_safe'], 1)
                },
                'size_percentage': round(row['member_count'] / cohort_profiles['member_count'].sum() * 100, 1)
            }
            
            cohort_records.append(cohort_record)
        
        logger.info(f"✓ Created {len(cohort_records)} cohort records")
        
        return cohort_records
    
    @staticmethod
    def _generate_cohort_description(row: pd.Series, cohort_name: str) -> str:
        """
        Generate human-readable description for cohort.
        
        Args:
            row: Cohort profile row
            cohort_name: Auto-generated name
        
        Returns:
            Description string
        """
        tenure = row['avg_tenure']
        balance = row['avg_balance']
        products = row['avg_products']
        active = row['avg_active_member']
        churn = row['avg_churn_probability']
        
        parts = [f"{cohort_name}:"]
        
        if tenure > 7:
            parts.append(f"established members with {tenure:.1f} years tenure,")
        elif tenure < 2:
            parts.append(f"new members with {tenure:.1f} years tenure,")
        else:
            parts.append(f"mid-tenure members with {tenure:.1f} years tenure,")
        
        if balance > 150000:
            parts.append(f"high account balances (avg ${balance:,.0f}),")
        elif balance < 50000:
            parts.append(f"lower account balances (avg ${balance:,.0f}),")
        else:
            parts.append(f"moderate account balances (avg ${balance:,.0f}),")
        
        parts.append(f"{products:.1f} products per member.")
        
        if active > 0.8:
            parts.append("Highly active across channels.")
        elif active < 0.3:
            parts.append("Limited channel activity.")
        
        if churn > 0.6:
            parts.append("High churn risk - immediate intervention needed.")
        elif churn < 0.2:
            parts.append("Stable, low-risk segment.")
        
        return " ".join(parts)
    
    # ========== STEP 5: Assign Members to Cohorts ==========
    
    @staticmethod
    def assign_members_to_cohorts(
        members_df: pd.DataFrame,
        cohort_names: Dict[int, str]
    ) -> pd.DataFrame:
        """
        Create member-to-cohort assignment records.
        
        Args:
            members_df: Members with cohort_id column
            cohort_names: Mapping of cohort_id → cohort_name
        
        Returns:
            DataFrame with member_id, cohort_id, cohort_name for storage
        """
        logger.info("Creating member-to-cohort assignments...")
        
        assignments = pd.DataFrame({
            'member_id': members_df['member_id'],
            'cohort_id': members_df['cohort_id'],
            'cohort_name': members_df['cohort_id'].map(cohort_names)
        })
        
        logger.info(f"✓ Created {len(assignments)} member-to-cohort assignments")
        
        return assignments
    
    # ========== STEP 6: Validation ==========
    
    @staticmethod
    def validate_cohort_data(
        members_df: pd.DataFrame,
        cohort_records: List[Dict],
        assignments_df: pd.DataFrame
    ) -> bool:
        """
        Validate cohort generation results.
        
        Checks:
        - All members assigned to exactly one cohort
        - Cohort sizes sum to total members
        - No duplicate assignments
        - All cohorts have records
        
        Args:
            members_df: Original member data with cohort_id
            cohort_records: Cohort definition records
            assignments_df: Member-to-cohort assignments
        
        Returns:
            True if validation passes
        """
        logger.info("Validating cohort data...")
        
        # Check 1: All members assigned
        if len(assignments_df) != len(members_df):
            logger.error(f"✗ Incomplete assignments: {len(members_df) - len(assignments_df)} members")
            return False
        logger.info(f"✓ All {len(members_df)} members assigned to cohorts")
        
        # Check 2: No duplicates
        if len(assignments_df) != len(assignments_df['member_id'].unique()):
            logger.error("✗ Duplicate member assignments detected")
            return False
        logger.info(f"✓ No duplicate assignments")
        
        # Check 3: Cohort sizes sum to total
        cohort_member_count = sum([c['characteristics']['member_count'] for c in cohort_records])
        if cohort_member_count != len(members_df):
            logger.error(f"✗ Cohort size mismatch: {cohort_member_count} vs {len(members_df)}")
            return False
        logger.info(f"✓ Cohort member counts sum correctly: {cohort_member_count}")
        
        # Check 4: All cohorts have records
        expected_cohort_ids = set(members_df['cohort_id'].unique())
        record_cohort_ids = set([c['cohort_id'] for c in cohort_records])
        if expected_cohort_ids != record_cohort_ids:
            logger.error(f"✗ Cohort record mismatch")
            return False
        logger.info(f"✓ All {len(expected_cohort_ids)} cohorts have records")
        
        logger.info("✓ All validations passed!")
        return True


# ========== HELPER FUNCTION FOR EASY TESTING ==========

def example_usage():
    """
    Example: Discover cohorts and generate names from sample member data.
    Run this to test locally before integrating with MongoDB.
    """
    
    # Create sample member data
    np.random.seed(42)
    sample_members = pd.DataFrame({
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
    
    # Run analyzer
    analyzer = CohortAnalyzer()
    kmeans, members_with_cohorts, scaler = analyzer.discover_cohorts(sample_members)
    
    # Extract profiles
    cohort_profiles = analyzer.extract_cohort_profiles(members_with_cohorts)
    
    # Generate names
    cohort_names = analyzer.generate_cohort_names(cohort_profiles)
    
    # Create records
    cohort_records = analyzer.create_cohort_records(cohort_profiles, cohort_names)
    
    # Create assignments
    assignments_df = analyzer.assign_members_to_cohorts(members_with_cohorts, cohort_names)
    
    # Validate
    # is_valid = analyzer.validate_cohort_data(sample_members, cohort_records, assignments_df)
    is_valid = analyzer.validate_cohort_data(members_with_cohorts, cohort_records, assignments_df)
    if is_valid:
        print("\n" + "="*60)
        print("COHORT DISCOVERY COMPLETE")
        print("="*60)
        print(f"\nCohort Profiles:")
        print(cohort_profiles.to_string())
        
        print(f"\n\nCohort Records (for MongoDB):")
        for cohort in cohort_records:
            print(f"\nCohort {cohort['cohort_id']}: {cohort['cohort_name']}")
            print(f"  Description: {cohort['description']}")
            print(f"  Size: {cohort['characteristics']['member_count']} members ({cohort['size_percentage']:.1f}%)")
            print(f"  Avg Churn: {cohort['risk_profile']['avg_churn_probability']:.4f}")
        
        print(f"\n\nSample Assignments (first 10):")
        print(assignments_df.head(10).to_string())
    
    return members_with_cohorts, cohort_profiles, cohort_names, cohort_records, assignments_df


if __name__ == "__main__":
    example_usage()