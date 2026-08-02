// app/components/MemberInfoCard.tsx
'use client';

import { formatCurrency } from '@/app/lib/utils';

interface MemberInfoCardProps {
  memberId: number;
  name: string;
  age: number;
  gender: string;
  country: string;
  creditScore: number;
  tenure: number;
  balance: number;
  salary: number;
  productsNumber: number;
  activeStatus: boolean;
}

export default function MemberInfoCard({
  memberId,
  name,
  age,
  gender,
  country,
  creditScore,
  tenure,
  balance,
  salary,
  productsNumber,
  activeStatus,
}: MemberInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        <p className="text-gray-500">Member ID: #{memberId}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Demographics */}
        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Age</p>
          <p className="text-2xl font-bold text-gray-900">{age}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Gender</p>
          <p className="text-2xl font-bold text-gray-900">{gender}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Country</p>
          <p className="text-2xl font-bold text-gray-900">{country}</p>
        </div>

        {/* Financial Info */}
        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Balance</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(balance)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Salary</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(salary)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Credit Score</p>
          <p className="text-lg font-bold text-gray-900">{creditScore}</p>
        </div>

        {/* Account Info */}
        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Tenure</p>
          <p className="text-lg font-bold text-gray-900">{tenure} years</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Products</p>
          <p className="text-lg font-bold text-gray-900">{productsNumber}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">Status</p>
          <p className={`text-lg font-bold ${activeStatus ? 'text-green-600' : 'text-red-600'}`}>
            {activeStatus ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}