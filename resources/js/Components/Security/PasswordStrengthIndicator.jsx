import { useEffect, useState } from 'react';

export default function PasswordStrengthIndicator({ password }) {
    const [strength, setStrength] = useState({
        score: 0,
        label: '',
        color: '',
        requirements: {
            minLength: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        },
    });

    useEffect(() => {
        if (!password) {
            setStrength({
                score: 0,
                label: '',
                color: '',
                requirements: {
                    minLength: false,
                    uppercase: false,
                    lowercase: false,
                    number: false,
                    special: false,
                },
            });
            return;
        }

        const requirements = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const score = Object.values(requirements).filter(Boolean).length;

        let label = '';
        let color = '';

        if (score === 5) {
            label = 'Strong';
            color = 'text-green-600 bg-green-100';
        } else if (score >= 3) {
            label = 'Medium';
            color = 'text-yellow-600 bg-yellow-100';
        } else {
            label = 'Weak';
            color = 'text-red-600 bg-red-100';
        }

        setStrength({ score, label, color, requirements });
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${strength.color}`}>
                    {strength.label}
                </span>
            </div>

            <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                            level <= strength.score
                                ? strength.score === 5
                                    ? 'bg-green-500'
                                    : strength.score >= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <RequirementItem met={strength.requirements.minLength} text="At least 8 characters" />
                    <RequirementItem met={strength.requirements.uppercase} text="One uppercase letter" />
                    <RequirementItem met={strength.requirements.lowercase} text="One lowercase letter" />
                    <RequirementItem met={strength.requirements.number} text="One number" />
                    <RequirementItem met={strength.requirements.special} text="One special character" />
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ met, text }) {
    return (
        <div className="flex items-center text-xs">
            {met ? (
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : (
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    />
                </svg>
            )}
            <span className={met ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
        </div>
    );
}
