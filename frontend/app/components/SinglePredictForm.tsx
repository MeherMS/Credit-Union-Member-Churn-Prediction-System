'use client';

import React, { useState } from 'react';
import { useSinglePredict, PredictFormData } from '@/app/hooks/useSinglePredict';
import { getRiskColor } from '@/app/lib/utils';
import { AlertCircle, CheckCircle, Lightbulb, Loader } from 'lucide-react';

export default function SinglePredictForm() {
  const { predict, loading, error, result, reset } = useSinglePredict();
  
  const [formData, setFormData] = useState<PredictFormData>({
    credit_score: 650,
    country: 'France',
    gender: 'M',
    age: 35,
    tenure: 8,
    balance: 50000,
    products_number: 2,
    credit_card: 1,
    active_member: 1,
    estimated_salary: 75000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleRadioChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await predict(formData);
  };

  const getRiskBadgeColor = (riskBucket: string) => {
    switch (riskBucket) {
      case 'High Risk':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium Risk':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Low Risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ====== FORM SECTION ====== */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Single Member Prediction</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Enter member details to predict churn risk
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Credit Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Score
              </label>
              <input
                type="number"
                name="credit_score"
                value={formData.credit_score}
                onChange={handleInputChange}
                min="300"
                max="850"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenure (Years)
              </label>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance ($)
              </label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Products Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Products
              </label>
              <select
                name="products_number"
                value={formData.products_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            {/* Estimated Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Salary ($)
              </label>
              <input
                type="number"
                name="estimated_salary"
                value={formData.estimated_salary}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Spain">Spain</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.gender === 'M'}
                    onChange={() => handleRadioChange('gender', 'M')}
                    className="mr-2"
                  />
                  <span className="text-sm">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.gender === 'F'}
                    onChange={() => handleRadioChange('gender', 'F')}
                    className="mr-2"
                  />
                  <span className="text-sm">Female</span>
                </label>
              </div>
            </div>

            {/* Credit Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Has Credit Card
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.credit_card === 1}
                    onChange={() => handleRadioChange('credit_card', 1)}
                    className="mr-2"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.credit_card === 0}
                    onChange={() => handleRadioChange('credit_card', 0)}
                    className="mr-2"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Active Member */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Member
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.active_member === 1}
                    onChange={() => handleRadioChange('active_member', 1)}
                    className="mr-2"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.active_member === 0}
                    onChange={() => handleRadioChange('active_member', 0)}
                    className="mr-2"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-red-800 text-sm font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={20} className="animate-spin" />
                  Predicting...
                </span>
              ) : (
                'Make Prediction'
              )}
            </button>
          </form>
        </div>

        {/* ====== RESULTS SECTION ====== */}
        <div>
          {result ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Prediction Result</h2>

              {/* Member ID */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Member ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">{result.member_id}</p>
              </div>

              {/* Risk Bucket Badge */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                <div className={`inline-block px-4 py-2 rounded-full font-bold border ${getRiskBadgeColor(result.risk_bucket)}`}>
                  {result.risk_bucket}
                </div>
              </div>

              {/* Churn Probability */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Churn Probability</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-gray-900">
                    {(result.churn_probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-600 mb-1">likelihood</p>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getRiskColor(result.churn_probability)}`}
                    style={{ width: `${result.churn_probability * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Days to Churn */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Predicted Days to Churn</p>
                <p className="text-3xl font-bold text-blue-900">
                  {result.days_to_churn !== null ? result.days_to_churn : 'N/A'}
                </p>
                {result.days_to_churn && (
                  <p className="text-sm text-blue-700 mt-1">
                    If this member churns, it's likely within {result.days_to_churn} days
                  </p>
                )}
              </div>

              {/* Top Risk Factors */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Top Risk Factors</p>
                <div className="space-y-2">
                  {result.top_risk_factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg border-l-4 ${
                result.risk_bucket === 'High Risk'
                  ? 'bg-red-50 border-red-400'
                  : result.risk_bucket === 'Medium Risk'
                  ? 'bg-orange-50 border-orange-400'
                  : result.risk_bucket === 'Low Risk'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-green-50 border-green-400'
              }`}>
                <p className="text-sm font-medium text-gray-800 mb-2">Recommendation</p>
                <p className="text-sm text-gray-700">
                  {result.risk_bucket === 'High Risk'
                    ? '⚠️ Immediate action required. Prioritize engagement and retention initiatives.'
                    : result.risk_bucket === 'Medium Risk'
                    ? '⚠️ Monitor closely. Consider targeted retention offers.'
                    : result.risk_bucket === 'Low Risk'
                    ? '💡 Low risk, but maintain regular engagement.'
                    : '✅ This member is at low churn risk.'}
                </p>
              </div>

              {/* Reset Button */}
              <button
                onClick={reset}
                className="w-full mt-6 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Make Another Prediction
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Fill the form and click "Make Prediction"</p>
              <p className="text-gray-500 text-sm mt-2">Results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}