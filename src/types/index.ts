export interface User {
  id: string;
  username: string;
  password?: string;
  realName: string;
  userNumber: string;
  isInitialized: boolean;
  role: 'user' | 'admin';
  approvedDate?: string;
}

export interface AbsenceRecord {
  no: number;
  userNumber: string;
  realName: string;
  thumbnailPhoto: string;
  dateStamp: string;
}

export interface InitRecord {
  no: number;
  userNumber: string;
  realName: string;
  thumbnailPhoto: string;
  dateStamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type ViewRoute = 
  | 'logindepan' 
  | 'absence' 
  | 'init-absence' 
  | 'appsinit' 
  | 'databsen' 
  | 'flask-demo';

export interface LivenessState {
  digits: number[];
  spokenWords: string[];
  matchedIndices: boolean[];
  timeLeft: number;
  isVerified: boolean;
  isListening: boolean;
  transcript: string;
}
