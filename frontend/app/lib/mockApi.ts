// app/lib/mockApi.ts
import { MemberWithPrediction, DashboardSummary } from '@/app/types';

// Sample mock data
const mockMembers: MemberWithPrediction[] = [
  {
    row_number: 1,
    customer_id: 15634602,
    surname: 'Hargrave',
    credit_score: 619,
    country: 'France',
    gender: 'M',
    age: 42,
    tenure: 2,
    balance: 0,
    products_number: 1,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 83711.77,
    churn_probability: 0.85,
    risk_bucket: 'High Risk',
    risk_days: 14,
    feature_importance: {
      tenure: 0.35,
      balance: 0.28,
      products_number: 0.18,
      age: 0.12,
      credit_score: 0.07,
    },
  },
  {
    row_number: 2,
    customer_id: 15702613,
    surname: 'Hill',
    credit_score: 608,
    country: 'Spain',
    gender: 'F',
    age: 41,
    tenure: 1,
    balance: 83369.47,
    products_number: 1,
    credit_card: 0,
    active_member: 1,
    estimated_salary: 112542.58,
    churn_probability: 0.72,
    risk_bucket: 'Medium Risk',
    risk_days: 45,
    feature_importance: {
      tenure: 0.40,
      balance: 0.25,
      products_number: 0.20,
      age: 0.10,
      credit_score: 0.05,
    },
  },
  {
    row_number: 3,
    customer_id: 15628319,
    surname: 'Onio',
    credit_score: 502,
    country: 'France',
    gender: 'F',
    age: 42,
    tenure: 8,
    balance: 159660.95,
    products_number: 3,
    credit_card: 1,
    active_member: 0,
    estimated_salary: 113931.57,
    churn_probability: 0.45,
    risk_bucket: 'Low Risk',
    risk_days: 80,
    feature_importance: {
      tenure: 0.38,
      balance: 0.27,
      products_number: 0.22,
      age: 0.10,
      credit_score: 0.03,
    },
  },
  {
    row_number: 4,
    customer_id: 15556857,
    surname: 'Boni',
    credit_score: 699,
    country: 'France',
    gender: 'M',
    age: 44,
    tenure: 2,
    balance: 125510.82,
    products_number: 1,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 93826.63,
    churn_probability: 0.28,
    risk_bucket: 'Safe',
    risk_days: 180,
    feature_importance: {
      tenure: 0.42,
      balance: 0.30,
      products_number: 0.16,
      age: 0.09,
      credit_score: 0.03,
    },
  },
  {
    row_number: 5,
    customer_id: 15907476,
    surname: 'Mitchell',
    credit_score: 850,
    country: 'Germany',
    gender: 'M',
    age: 29,
    tenure: 4,
    balance: 285476.12,
    products_number: 2,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 156234.89,
    churn_probability: 0.12,
    risk_bucket: 'Safe',
    risk_days: 180,
    feature_importance: {
      tenure: 0.39,
      balance: 0.33,
      products_number: 0.18,
      age: 0.07,
      credit_score: 0.03,
    },
  },
  {
    row_number: 6,
    customer_id: 15701354,
    surname: 'Bake',
    credit_score: 645,
    country: 'Spain',
    gender: 'F',
    age: 44,
    tenure: 4,
    balance: 412141.87,
    products_number: 2,
    credit_card: 0,
    active_member: 1,
    estimated_salary: 174791.12,
    churn_probability: 0.38,
    risk_bucket: 'Low Risk',
    risk_days: 80,
    feature_importance: {
      tenure: 0.40,
      balance: 0.28,
      products_number: 0.19,
      age: 0.09,
      credit_score: 0.04,
    },
  },
  {
    row_number: 7,
    customer_id: 15737888,
    surname: 'Greek',
    credit_score: 822,
    country: 'France',
    gender: 'M',
    age: 50,
    tenure: 10,
    balance: 528123.45,
    products_number: 3,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 234567.89,
    churn_probability: 0.09,
    risk_bucket: 'Safe',
    risk_days: 180,
    feature_importance: {
      tenure: 0.45,
      balance: 0.32,
      products_number: 0.14,
      age: 0.06,
      credit_score: 0.03,
    },
  },
  {
    row_number: 8,
    customer_id: 15622450,
    surname: 'Cauthorn',
    credit_score: 645,
    country: 'Spain',
    gender: 'F',
    age: 37,
    tenure: 5,
    balance: 0,
    products_number: 2,
    credit_card: 0,
    active_member: 1,
    estimated_salary: 134276.43,
    churn_probability: 0.62,
    risk_bucket: 'Medium Risk',
    risk_days: 45,
    feature_importance: {
      tenure: 0.37,
      balance: 0.29,
      products_number: 0.20,
      age: 0.11,
      credit_score: 0.03,
    },
  },
  {
    row_number: 9,
    customer_id: 15801355,
    surname: 'Frazer',
    credit_score: 521,
    country: 'Germany',
    gender: 'M',
    age: 53,
    tenure: 7,
    balance: 234890.56,
    products_number: 2,
    credit_card: 1,
    active_member: 0,
    estimated_salary: 189234.76,
    churn_probability: 0.35,
    risk_bucket: 'Low Risk',
    risk_days: 80,
    feature_importance: {
      tenure: 0.41,
      balance: 0.26,
      products_number: 0.21,
      age: 0.09,
      credit_score: 0.03,
    },
  },
  {
    row_number: 10,
    customer_id: 15933456,
    surname: 'Davis',
    credit_score: 745,
    country: 'Spain',
    gender: 'M',
    age: 55,
    tenure: 8,
    balance: 567890.34,
    products_number: 2,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 198765.43,
    churn_probability: 0.18,
    risk_bucket: 'Safe',
    risk_days: 180,
    feature_importance: {
      tenure: 0.40,
      balance: 0.32,
      products_number: 0.15,
      age: 0.10,
      credit_score: 0.03,
    },
  },
];

export class MockApi {
  // Health check
  async healthCheck() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'healthy',
          model_loaded: true,
        });
      }, 300);
    });
  }

  // Get all members (paginated)
  async getAllMembers(limit: number = 100, offset: number = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const paginatedMembers = mockMembers.slice(offset, offset + limit);
        resolve({
          members: paginatedMembers,
          total: mockMembers.length,
          limit,
          offset,
        });
      }, 500);
    });
  }

  // Get member by ID
  async getMemberProfile(memberId: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const member = mockMembers.find(
          (m) => m.customer_id.toString() === memberId
        );
        if (member) {
          resolve(member);
        } else {
          reject(new Error(`Member ${memberId} not found`));
        }
      }, 300);
    });
  }

  // Dashboard summary
  async getDashboardSummary() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const summary = {
          total_members: 10000,
          high_risk_count: mockMembers.filter(
            (m) => m.risk_bucket === 'High Risk'
          ).length,
          medium_risk_count: mockMembers.filter(
            (m) => m.risk_bucket === 'Medium Risk'
          ).length,
          low_risk_count: mockMembers.filter(
            (m) => m.risk_bucket === 'Low Risk'
          ).length,
          safe_count: mockMembers.filter((m) => m.risk_bucket === 'Safe')
            .length,
        };
        resolve(summary);
      }, 400);
    });
  }

  // Predict single member
  async predictMember(memberData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomProb = Math.random();
        let risk_bucket = 'Safe';
        let risk_days = 180;

        if (randomProb >= 0.7) {
          risk_bucket = 'High Risk';
          risk_days = 14;
        } else if (randomProb >= 0.5) {
          risk_bucket = 'Medium Risk';
          risk_days = 45;
        } else if (randomProb >= 0.3) {
          risk_bucket = 'Low Risk';
          risk_days = 80;
        }

        resolve({
          member_id: `mock_${Date.now()}`,
          ...memberData,
          churn_probability: parseFloat(randomProb.toFixed(2)),
          risk_bucket,
          risk_days,
          feature_importance: {
            tenure: 0.35,
            balance: 0.28,
            products_number: 0.18,
            age: 0.12,
            credit_score: 0.07,
          },
        });
      }, 400);
    });
  }

  // Bulk predict (CSV)
  async bulkPredict(file: File) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate processing the file
        resolve({
          job_id: `job_${Date.now()}`,
          status: 'completed',
          rows_processed: 100,
          csv_download_url: '/api/results/sample_predictions.csv',
          message: 'Bulk prediction completed successfully',
        });
      }, 1500);
    });
  }

  // Generate report
  async generateReport(filters: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock PDF blob
        const mockPdfContent = 'Mock PDF Report Content';
        const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
        resolve(blob);
      }, 1000);
    });
  }
}

export const mockApi = new MockApi();