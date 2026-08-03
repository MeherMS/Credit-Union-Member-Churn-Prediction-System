// app/components/TopAtRiskTable.tsx
'use client';

import Link from 'next/link';
import { getRiskColor, formatCurrency } from '@/app/lib/utils';

interface Member {
  customer_id: number;
  surname: string;
  age: number;
  country: string;
  balance: number;
  churn_probability: number;
  risk_bucket: string;
  risk_days?: number;
}

interface TopAtRiskTableProps {
  members: Array<{
    member_id: string;
    age: number;
    country: string;
    balance: number;
    risk_bucket: string;
    churn_probability: number;
  }>;
}

export default function TopAtRiskTable({ members }: TopAtRiskTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Top 10 At-Risk Members</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Churn Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.member_id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900">#{member.member_id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.member_id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.age}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.country}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(member.balance)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRiskColor(
                      member.churn_probability
                    )}`}
                  >
                    {member.risk_bucket}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href={`/members/${member.member_id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}