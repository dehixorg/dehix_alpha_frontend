'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Gift,
} from 'lucide-react';

// Enums
enum VerificationStatusEnum {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

// Interfaces
interface FreelancerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  profilePicture?: string;
  bio: string;
  skillsRequired: string[];
  experience: string;
  hourlyRate?: number;
  totalProjects?: number;
  rating?: number;
  portfolioLink?: string;
  githubLink?: string;
  linkedInLink?: string;
  websiteLink?: string;
  verificationStatus: VerificationStatusEnum;
  verificationComments?: string;
  joinedDate: Date | string;
  lastActive?: Date | string;
}

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
  onVerifyProfile: (
    freelancerId: string,
    status: VerificationStatusEnum,
    comments?: string,
  ) => Promise<void>;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  onVerifyProfile,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [comments, setComments] = useState<string>(
    freelancer.verificationComments || '',
  );

  const handleVerification = async (
    status: VerificationStatusEnum,
  ): Promise<void> => {
    if (status === VerificationStatusEnum.REJECTED && !comments.trim()) {
      setShowCommentInput(true);
      return;
    }

    setIsVerifying(true);
    try {
      await onVerifyProfile(freelancer._id, status, comments);
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error verifying profile:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: VerificationStatusEnum): string => {
    switch (status) {
      case VerificationStatusEnum.VERIFIED:
        return 'bg-green-900/30 text-green-300 border-green-800/30';
      case VerificationStatusEnum.REJECTED:
        return 'bg-red-900/30 text-red-300 border-red-800/30';
      case VerificationStatusEnum.PENDING:
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-800/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: VerificationStatusEnum) => {
    switch (status) {
      case VerificationStatusEnum.VERIFIED:
        return <CheckCircle className="w-4 h-4" />;
      case VerificationStatusEnum.REJECTED:
        return <XCircle className="w-4 h-4" />;
      case VerificationStatusEnum.PENDING:
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg hover:shadow-gray-800/20 transition-all duration-200">
      {/* Header with Profile Picture and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {freelancer.profilePicture ? (
              <img
                src={freelancer.profilePicture}
                alt={`${freelancer.firstName} ${freelancer.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {freelancer.firstName} {freelancer.lastName}
            </h3>
            <p className="text-gray-400 text-sm">
              {freelancer.experience} Experience
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(freelancer.verificationStatus)}`}
        >
          {getStatusIcon(freelancer.verificationStatus)}
          {freelancer.verificationStatus}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-300">
          <Mail className="w-4 h-4 mr-2 text-gray-500" />
          <span className="truncate">{freelancer.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <Phone className="w-4 h-4 mr-2 text-gray-500" />
          <span>{freelancer.phone}</span>
        </div>
        {freelancer.location && (
          <div className="flex items-center text-sm text-gray-300">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span>{freelancer.location}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
        {freelancer.bio}
      </p>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {freelancer.skillsRequired
            ?.slice(0, 4)
            .map((skill: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-800/30 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          {freelancer.skillsRequired?.length > 4 && (
            <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded-full text-xs">
              +{freelancer.skillsRequired.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {freelancer.hourlyRate && (
          <div className="text-gray-400">
            <span className="text-white font-medium">
              ${freelancer.hourlyRate}
            </span>
            /hr
          </div>
        )}
        {freelancer.totalProjects && (
          <div className="text-gray-400">
            <span className="text-white font-medium">
              {freelancer.totalProjects}
            </span>{' '}
            projects
          </div>
        )}
        {freelancer.rating && (
          <div className="flex items-center space-x-1">
            {renderStars(freelancer.rating)}
            <span className="text-gray-400 text-xs ml-1">
              ({freelancer.rating})
            </span>
          </div>
        )}
      </div>

      {/* Social Links */}
      {(freelancer.portfolioLink ||
        freelancer.githubLink ||
        freelancer.linkedInLink ||
        freelancer.websiteLink) && (
        <div className="flex items-center space-x-3 mb-4">
          {freelancer.portfolioLink && (
            <a
              href={freelancer.portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {freelancer.githubLink && (
            <a
              href={freelancer.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {freelancer.linkedInLink && (
            <a
              href={freelancer.linkedInLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {freelancer.websiteLink && (
            <a
              href={freelancer.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Joined Date */}
      <div className="text-xs text-gray-500 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Joined: {formatDate(freelancer.joinedDate)}
        </div>
        {freelancer.lastActive && (
          <div className="flex items-center mt-1">
            <Clock className="w-4 h-4 mr-2" />
            Last active: {formatDate(freelancer.lastActive)}
          </div>
        )}
      </div>

      {/* Verification Comments */}
      {freelancer.verificationComments && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Verification Comments:</p>
          <p className="text-sm text-gray-300">
            {freelancer.verificationComments}
          </p>
        </div>
      )}

      {/* Comment Input for Rejection */}
      {showCommentInput && (
        <div className="mb-4">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Verification Buttons */}
      {freelancer.verificationStatus === VerificationStatusEnum.PENDING && (
        <div className="flex space-x-3 pt-4 border-t border-gray-700">
          <button
            onClick={() => handleVerification(VerificationStatusEnum.VERIFIED)}
            disabled={isVerifying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={() => handleVerification(VerificationStatusEnum.REJECTED)}
            disabled={isVerifying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle className="w-4 h-4" />
            {isVerifying ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      )}

      {/* Show result for already processed */}
      {freelancer.verificationStatus !== VerificationStatusEnum.PENDING && (
        <div className="pt-4 border-t border-gray-700">
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(freelancer.verificationStatus)}`}
          >
            {getStatusIcon(freelancer.verificationStatus)}
            {freelancer.verificationStatus === VerificationStatusEnum.VERIFIED
              ? 'Profile Verified'
              : 'Profile Rejected'}
          </div>
        </div>
      )}
    </div>
  );
};

// Demo component
const FreelancerProfileDemo: React.FC = () => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([
    {
      _id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionate about creating scalable web applications and mentoring junior developers.',
      skillsRequired: [
        'React',
        'Node.js',
        'TypeScript',
        'AWS',
        'MongoDB',
        'Docker',
      ],
      experience: 'Senior',
      hourlyRate: 85,
      totalProjects: 47,
      rating: 4.9,
      portfolioLink: 'https://sarahjohnson.dev',
      githubLink: 'https://github.com/sarahjohnson',
      linkedInLink: 'https://linkedin.com/in/sarahjohnson',
      verificationStatus: VerificationStatusEnum.PENDING,
      joinedDate: new Date('2023-01-15'),
      lastActive: new Date('2024-01-20'),
    },
    {
      _id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      bio: 'UI/UX Designer specializing in mobile app design and user research. I help businesses create intuitive and beautiful digital experiences.',
      skillsRequired: [
        'Figma',
        'Adobe XD',
        'Sketch',
        'Prototyping',
        'User Research',
      ],
      experience: 'Mid-level',
      hourlyRate: 65,
      totalProjects: 32,
      rating: 4.7,
      portfolioLink: 'https://michaelchen.design',
      linkedInLink: 'https://linkedin.com/in/michaelchen',
      websiteLink: 'https://chendesign.com',
      verificationStatus: VerificationStatusEnum.VERIFIED,
      verificationComments:
        'Excellent portfolio and strong client testimonials.',
      joinedDate: new Date('2023-03-20'),
      lastActive: new Date('2024-01-19'),
    },
    {
      _id: '3',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      bio: 'Data scientist and machine learning engineer with expertise in Python, TensorFlow, and statistical analysis.',
      skillsRequired: [
        'Python',
        'TensorFlow',
        'Pandas',
        'SQL',
        'Machine Learning',
      ],
      experience: 'Expert',
      hourlyRate: 95,
      totalProjects: 23,
      rating: 4.8,
      githubLink: 'https://github.com/emmadavis',
      linkedInLink: 'https://linkedin.com/in/emmadavis',
      verificationStatus: VerificationStatusEnum.REJECTED,
      verificationComments:
        'Portfolio links were not accessible and work samples could not be verified.',
      joinedDate: new Date('2023-06-10'),
      lastActive: new Date('2024-01-18'),
    },
  ]);

  // 🆕 State for popup
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleVerifyProfile = async (
    freelancerId: string,
    status: VerificationStatusEnum,
    comments?: string,
  ): Promise<void> => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    setFreelancers((prevFreelancers: FreelancerProfile[]) =>
      prevFreelancers.map((freelancer: FreelancerProfile) =>
        freelancer._id === freelancerId
          ? {
              ...freelancer,
              verificationStatus: status,
              verificationComments: comments,
            }
          : freelancer,
      ),
    );

    // 🆕 Show popup ONLY if profile was VERIFIED
    if (status === VerificationStatusEnum.VERIFIED) {
      setShowRewardPopup(true);
    }
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
    console.log('Reward claimed successfully!');
    setIsClaiming(false);
    setShowRewardPopup(false);
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Freelancer Profile Verification
        </h1>
        <p className="text-gray-400">
          Review and verify freelancer profiles for platform approval
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((freelancer) => (
          <FreelancerCard
            key={freelancer._id}
            freelancer={freelancer}
            onVerifyProfile={handleVerifyProfile}
          />
        ))}
      </div>

      {/* 🆕 Reward Popup */}
      {showRewardPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Verified!
              </h3>
              <p className="text-gray-600 mb-6">
                Congratulations 🎉 Claim your{' '}
                <span className="font-bold text-green-600">50 DXUT</span>{' '}
                reward.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Claiming...
                    </>
                  ) : (
                    'Claim Reward'
                  )}
                </button>
                <button
                  onClick={() => setShowRewardPopup(false)}
                  className="w-full text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfileDemo;
